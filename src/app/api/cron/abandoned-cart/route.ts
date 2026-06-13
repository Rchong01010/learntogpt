import { Resend } from "resend";
import { personalizeUnsubscribe, buildUnsubscribeHeaders } from "@/lib/unsubscribe-token";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { buildAbandonedCartEmail } from "@/lib/emails/abandoned-cart";

/**
 * Abandoned cart cron — daily email nudge for users who completed free content
 * but have not purchased the full course unlock.
 *
 * Targeting: users whose account was created 24–48 hours ago, who have 1+
 * completed lessons (user_progress status = 'completed'), and who do NOT have
 * a row in course_unlocks. The 24–48h window ensures:
 *   - We give them a full day before nudging (not pushy)
 *   - Running daily means each user only lands in the window once (dedup)
 *
 * Rate limit: max 10 emails per cron run (burst protection).
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (set by Vercel Cron automatically).
 *
 * Schedule: once/day at 15:00 UTC (8am PDT) — see vercel.json.
 *
 * ---
 * MIGRATION NEEDED (run manually via Supabase MCP):
 *
 * -- If you want persistent dedup beyond the time-window approach, add:
 * -- ALTER TABLE user_profiles ADD COLUMN abandoned_cart_sent_at timestamptz;
 * -- Then filter on abandoned_cart_sent_at IS NULL in the query below.
 * -- For now, the 24-48h window + daily cron provides natural dedup.
 * ---
 */

// --- In-memory rate limiting (defense-in-depth for cron endpoints) ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const MAX_EMAILS_PER_RUN = 10;

export async function GET(request: Request) {
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Auth
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[abandoned-cart] CRON_SECRET not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const resendKey = process.env.RESEND_API_KEY;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

  if (isProd && !resendKey) {
    console.error("[abandoned-cart] RESEND_API_KEY required in production");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const now = Date.now();
  const windowStart = new Date(now - FORTY_EIGHT_HOURS_MS).toISOString();
  const windowEnd = new Date(now - TWENTY_FOUR_HOURS_MS).toISOString();

  const supabase = await createSupabaseAdmin();

  // 1. Find users created 24-48h ago who do NOT have a course_unlock.
  //    We get all users in the window first, then exclude those with unlocks.
  const { data: recentUsers, error: usersErr } = await supabase
    .from("user_profiles")
    .select("user_id, created_at")
    .gte("created_at", windowStart)
    .lte("created_at", windowEnd)
    .eq("email_unsubscribed", false);

  if (usersErr) {
    console.error("[abandoned-cart] user query failed:", usersErr.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  if (!recentUsers || recentUsers.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      reason: "no users in 24-48h window",
    });
  }

  // 2. Exclude users who already purchased (have a course_unlock row).
  const userIds = recentUsers.map((u) => u.user_id);
  const { data: unlocked, error: unlockErr } = await supabase
    .from("course_unlocks")
    .select("user_id")
    .in("user_id", userIds);

  if (unlockErr) {
    console.error("[abandoned-cart] unlock query failed:", unlockErr.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  const unlockedSet = new Set((unlocked ?? []).map((u) => u.user_id));
  const unpaidUsers = recentUsers.filter((u) => !unlockedSet.has(u.user_id));

  if (unpaidUsers.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      reason: "all users in window already purchased",
    });
  }

  // 3. Of the unpaid users, find those who completed at least 1 lesson.
  type Candidate = {
    user_id: string;
    email: string;
    display_name: string | null;
    completed_count: number;
  };

  const candidates: Candidate[] = [];

  for (const user of unpaidUsers) {
    if (candidates.length >= MAX_EMAILS_PER_RUN) break;

    const { count, error: progressErr } = await supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.user_id)
      .eq("status", "completed");

    if (progressErr || !count || count === 0) continue;

    // Look up email via auth admin API
    const { data: userData, error: userErr } =
      await supabase.auth.admin.getUserById(user.user_id);
    if (userErr || !userData?.user?.email) continue;

    candidates.push({
      user_id: user.user_id,
      email: userData.user.email,
      display_name:
        (userData.user.user_metadata?.display_name as string | undefined) ??
        null,
      completed_count: count,
    });
  }

  if (candidates.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      reason: "no qualifying users (no completions in window)",
    });
  }

  // 4. Send emails
  const resend = isProd && resendKey ? new Resend(resendKey) : null;
  let sent = 0;
  let failed = 0;

  for (const c of candidates) {
    const { subject, html, text } = buildAbandonedCartEmail(
      c.display_name,
      c.completed_count,
    );

    if (!resend) {
      console.info("[abandoned-cart] (dev) would email", {
        email: c.email,
        completed_count: c.completed_count,
      });
      sent += 1;
      continue;
    }

    try {
      const personalized = personalizeUnsubscribe({ html, text }, c.email);
      await resend.emails.send({
        from: "Learn to GPT <notifications@learntogpt.com>",
        to: c.email,
        subject,
        html: personalized.html,
        text: personalized.text,
        headers: buildUnsubscribeHeaders(c.email),
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error("[abandoned-cart] send failed", {
        user_id: c.user_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return Response.json({
    success: true,
    sent,
    failed,
    scanned: recentUsers.length,
    unpaid: unpaidUsers.length,
    candidates: candidates.length,
    dev_mode: !resend,
  });
}
