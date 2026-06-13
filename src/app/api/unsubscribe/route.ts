import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * Unsubscribe API.
 *
 * POST /api/unsubscribe?e=<base64url email>&t=<hmac>
 *   - RFC 8058 one-click unsubscribe target (mail clients POST here from the
 *     List-Unsubscribe header) → sets email_unsubscribed = true.
 *   - &action=resubscribe → sets it back to false (the page's resubscribe
 *     form). &redirect=1 → 303 back to the human-facing page.
 * GET → 307 to the human-facing /unsubscribe page (some clients GET the
 *   List-Unsubscribe URL; never flip state on GET from here — the page itself
 *   handles the human flow).
 *
 * Auth = the HMAC token (signed with CRON_SECRET); the service-role client is
 * only reached after verification. Generic responses, no user enumeration.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = new URL("/unsubscribe", request.url);
  for (const k of ["e", "t"]) {
    const v = searchParams.get(k);
    if (v) target.searchParams.set(k, v);
  }
  return NextResponse.redirect(target, 307);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = rateLimit(`unsubscribe:${ip}`, { limit: 10, windowSeconds: 3600 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const e = searchParams.get("e") ?? undefined;
  const t = searchParams.get("t") ?? undefined;
  const resubscribe = searchParams.get("action") === "resubscribe";
  const redirect = searchParams.get("redirect") === "1";

  const email = verifyUnsubscribeToken(e, t);
  if (!email) {
    // Generic — no enumeration, no token oracle beyond valid/invalid.
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseAdmin();
    const { error } = await supabase.rpc("set_email_unsubscribed", {
      p_email: email,
      p_value: !resubscribe,
    });
    if (error) {
      console.error("[api/unsubscribe] rpc failed:", error.message);
      // Still acknowledge: CAN-SPAM intent is recorded in logs; a 5xx would
      // make one-click clients retry against a transient failure.
    }
  } catch (err) {
    console.error(
      "[api/unsubscribe] failed:",
      err instanceof Error ? err.message : String(err),
    );
  }

  if (redirect && e && t) {
    const target = new URL("/unsubscribe", request.url);
    target.searchParams.set("e", e);
    target.searchParams.set("t", t);
    if (resubscribe) target.searchParams.set("resubscribed", "1");
    return NextResponse.redirect(target, 303);
  }
  return NextResponse.json({ ok: true });
}
