import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, getPriceId } from "@/lib/stripe";
import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";

const AFF_COOKIE = "aff_code";
// Mirror of the regex in src/proxy.ts. Defense-in-depth: the proxy validates
// before storing, but we revalidate here in case a cookie was set by an
// older code path or tampered with client-side.
const AFF_CODE_RE = /^[A-Z0-9]{3,40}$/;

/**
 * Look up an affiliate coupon by the value stored in the aff_code cookie.
 * Returns the Stripe coupon id to apply, or null if the code is invalid,
 * unknown, or for a creator we no longer want to honor (declined / dormant).
 *
 * Uses the service-role client because affiliate_creators is RLS-locked to
 * service_role only (see migration 013).
 */
async function resolveAffiliateCoupon(
  cookieValue: string | undefined
): Promise<string | null> {
  if (!cookieValue) return null;
  if (!AFF_CODE_RE.test(cookieValue)) return null;

  try {
    const sb = await createSupabaseAdmin();
    const { data, error } = await sb
      .from("affiliate_creators")
      .select("stripe_coupon_id, outreach_status")
      .eq("coupon_code", cookieValue)
      .maybeSingle();
    if (error || !data) return null;
    if (data.outreach_status === "declined" || data.outreach_status === "dormant") {
      return null;
    }
    return data.stripe_coupon_id || null;
  } catch (e) {
    console.error("[checkout] affiliate lookup failed:", e);
    return null;
  }
}

/** Ensure origin is a full https URL */
function getOrigin(): string {
  let origin = (process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com")
    .replace(/[\r\n\s]+/g, "")
    .replace(/\/+$/, "");
  if (!origin.startsWith("http")) {
    origin = `https://${origin}`;
  }
  return origin;
}

/**
 * GET handler — used by the auth callback redirect for pro plan sign-ups.
 * Creates a Stripe checkout session and redirects the user directly to Stripe.
 *
 * Uses a local @supabase/ssr client instead of the shared createSupabaseServer()
 * helper because this handler returns NextResponse.redirect(...) on every path.
 * Session cookies written via next/headers cookies() do NOT propagate to a
 * brand-new redirect response — they must be written directly onto the outgoing
 * response object via setAll. Same pattern as src/app/api/auth/callback/route.ts.
 * See memory: feedback_supabase_ssr_cookies.md.
 */
export async function GET(request: NextRequest) {
  // Capture any cookie rotations Supabase emits during getUser() so we can
  // re-apply them to whichever redirect response we end up returning.
  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Parameters<typeof NextResponse.prototype.cookies.set>[2];
  }> = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  /** Builds a redirect response that carries any rotated Supabase cookies. */
  function redirectWithCookies(url: URL | string): NextResponse {
    const target = typeof url === "string" ? url : url.toString();
    const res = target.startsWith("http")
      ? NextResponse.redirect(target)
      : NextResponse.redirect(new URL(target, request.url));
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = getOrigin();

  if (!user) {
    return redirectWithCookies("/sign-in");
  }

  // Rate limit: 5 checkout attempts per minute
  const rl = rateLimit(user.id, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return redirectWithCookies("/pricing?checkout=rate-limited");
  }

  let priceId: string;
  try {
    priceId = getPriceId();
  } catch {
    console.error("STRIPE_PRICE_ID is not configured");
    return redirectWithCookies("/pricing?checkout=unavailable");
  }

  // Check if user already has an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .single();

  if (subscription?.status === "active") {
    return redirectWithCookies("/dashboard");
  }

  const successUrl = `${origin}/dashboard?checkout=success`;
  const cancelUrl = `${origin}/pricing?checkout=canceled`;

  // Affiliate auto-apply: pull the aff_code cookie set by proxy.ts on
  // /?coupon=CODE landings, validate against affiliate_creators, and pass
  // the matching Stripe coupon to the checkout session. Stripe rejects
  // discounts + allow_promotion_codes simultaneously, so it's one OR the
  // other — coupon path wins, fallback lets folks type a code they heard.
  const affCookie = request.cookies.get(AFF_COOKIE)?.value;
  const stripeCouponId = await resolveAffiliateCoupon(affCookie);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription" as const,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        ...(stripeCouponId ? { aff_coupon: stripeCouponId } : {}),
      },
      ...(stripeCouponId
        ? { discounts: [{ coupon: stripeCouponId }] }
        : { allow_promotion_codes: true }),
      ...(subscription?.stripe_customer_id
        ? { customer: subscription.stripe_customer_id }
        : { customer_email: user.email }),
    });

    if (!session.url) {
      return redirectWithCookies("/pricing?checkout=failed");
    }

    return redirectWithCookies(session.url);
  } catch (err) {
    console.error("Checkout error:", err instanceof Error ? err.message : err);
    return redirectWithCookies("/pricing?checkout=failed");
  }
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 checkout attempts per minute
  const rl = rateLimit(user.id, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let priceId: string;
  try {
    priceId = getPriceId();
  } catch {
    console.error("STRIPE_PRICE_ID is not configured");
    return Response.json(
      { error: "Checkout is temporarily unavailable" },
      { status: 500 }
    );
  }

  // Check if user already has an active subscription (prevent duplicate checkout)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .single();

  if (subscription?.status === "active") {
    return Response.json(
      { error: "You already have an active subscription" },
      { status: 409 },
    );
  }

  const origin = getOrigin();

  // Affiliate auto-apply (mirrors GET handler).
  const affCookie = request.cookies.get(AFF_COOKIE)?.value;
  const stripeCouponId = await resolveAffiliateCoupon(affCookie);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription" as const,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      metadata: {
        user_id: user.id,
        ...(stripeCouponId ? { aff_coupon: stripeCouponId } : {}),
      },
      ...(stripeCouponId
        ? { discounts: [{ coupon: stripeCouponId }] }
        : { allow_promotion_codes: true }),
      ...(subscription?.stripe_customer_id
        ? { customer: subscription.stripe_customer_id }
        : { customer_email: user.email }),
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
