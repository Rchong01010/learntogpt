/**
 * Self-service affiliate signup.
 *
 * POST /api/affiliates/signup
 *   Body: { name, email, primary_channel, handles{}, reach_estimate, preferred_language, payout_email, turnstile_token }
 *
 * Flow:
 *   1. Validate input + Turnstile + 5K min reach
 *   2. Dedupe by email
 *   3. Generate handle-based coupon code (collision-check)
 *   4. Create Stripe coupon — 20% off first month only (duration: once)
 *   5. Insert affiliate_creators row (signup_source='self_service')
 *   6. Send Resend confirmation email
 *   7. Ping Slack
 */

import { createSupabaseAdmin } from "@/lib/supabase-server";
import { verifyTurnstile } from "@/lib/turnstile";
import { getStripe } from "@/lib/stripe";
import { rateLimitPersistent, rateLimitResponse, hashIp, getClientIP } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/escape-html";
import { pingSignupSlack } from "@/lib/slack-signups";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SLACK_WEBHOOK_URL = (process.env.SLACK_WEBHOOK_URL ?? "").trim();
if (!SLACK_WEBHOOK_URL) console.error("[affiliate-signup] SLACK_WEBHOOK_URL not configured — Slack notifications disabled");
const SLACK_WEBHOOK_PREFIX = "https://hooks.slack.com/";
const MIN_REACH = 5000;
const REV_SHARE_PCT = 30;

const CHANNELS = ["tiktok", "instagram", "youtube", "twitter", "substack"] as const;
type Channel = (typeof CHANNELS)[number];

interface SignupBody {
  name?: string;
  email?: string;
  primary_channel?: Channel;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  twitter_handle?: string;
  substack_handle?: string;
  reach_estimate?: number;
  preferred_language?: string;
  payout_email?: string;
  terms_accepted?: boolean;
  website?: string; // honeypot — must be empty
  turnstile_token?: string;
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function sanitizeHandle(h: string | undefined): string | null {
  if (!h) return null;
  const cleaned = h.trim().replace(/^@/, "").slice(0, 60);
  return cleaned || null;
}

function slugForCoupon(source: string): string {
  // Strip non-alphanumeric, uppercase, max 10 chars, append "20" for "20% off"
  const base = source.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
  return `${base}20`;
}

async function generateUniqueCoupon(
  sb: Awaited<ReturnType<typeof createSupabaseAdmin>>,
  baseSlug: string,
): Promise<string> {
  // Try baseSlug, then baseSlug + random suffix
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate =
      attempt === 0
        ? baseSlug
        : baseSlug.slice(0, 8) + Math.random().toString(36).slice(2, 5).toUpperCase() + "20";
    const { data } = await sb
      .from("affiliate_creators")
      .select("id")
      .eq("coupon_code", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("could not generate unique coupon code after 5 attempts");
}

// IP hashing handled by hashIp() from @/lib/rate-limit — shared with the rate limiter for consistency.

async function sendConfirmationEmail(opts: {
  name: string;
  email: string;
  couponCode: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("[affiliate-signup] RESEND_API_KEY not set");
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  const safeName = escapeHtml(opts.name);
  const safeCoupon = escapeHtml(opts.couponCode);
  const assetsUrl = "https://learntogpt.com/affiliates/assets";

  await resend.emails.send({
    from: "Learn to GPT <affiliates@learntogpt.com>",
    to: opts.email,
    subject: "You're in — Learn to GPT affiliate program",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1f1b14;">
  <h1 style="color: #e07a3a; font-size: 24px; margin: 0 0 8px;">Welcome to the program, ${safeName}</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #4a4238;">You're officially a Learn to GPT affiliate. Your audience gets 20% off their first month, and you earn <strong>30% of every payment they make, for as long as they stay subscribed.</strong></p>

  <div style="background: #f7f3ec; border: 2px solid #e07a3a; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
    <p style="margin: 0 0 4px; font-size: 13px; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Your unique coupon code</p>
    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #e07a3a; letter-spacing: 2px; font-family: monospace;">${safeCoupon}</p>
  </div>

  <h2 style="font-size: 18px; color: #1f1b14; margin: 32px 0 12px;">How to get paid</h2>
  <ol style="font-size: 15px; line-height: 1.7; color: #4a4238; padding-left: 20px;">
    <li>Share this link with your audience: <br><code style="background: #f7f3ec; padding: 2px 6px; border-radius: 4px;">https://learntogpt.com/?coupon=${safeCoupon}</code></li>
    <li>When someone subscribes, we automatically credit you 30% of their monthly payment</li>
    <li>We send payouts monthly via PayPal to the email you provided</li>
  </ol>

  <h2 style="font-size: 18px; color: #1f1b14; margin: 32px 0 12px;">Asset pack</h2>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4238;">
    Logos, screenshots, positioning brief, ready-to-post caption templates:<br>
    <a href="${assetsUrl}" style="color: #e07a3a; font-weight: 600;">learntogpt.com/affiliates/assets →</a>
  </p>

  <h2 style="font-size: 18px; color: #1f1b14; margin: 32px 0 12px;">Questions?</h2>
  <p style="font-size: 15px; line-height: 1.6; color: #4a4238;">Reply to this email. Reid (the founder) reads every one.</p>

  <hr style="border: none; border-top: 1px solid #e5e0d8; margin: 32px 0;">
  <p style="font-size: 12px; color: #a8a29e;">Learn to GPT — teaching non-technical people to use AI that actually works.</p>
</body>
</html>
    `.trim(),
    text: `Welcome to the program, ${opts.name}!

You're officially a Learn to GPT affiliate.

Your unique coupon code: ${opts.couponCode}
Your audience gets: 20% off first month
You earn: 30% of every payment they make, for as long as they stay subscribed

How to get paid:
1. Share: https://learntogpt.com/?coupon=${opts.couponCode}
2. When someone subscribes, you auto-earn 30% of their monthly payment
3. Monthly payouts via PayPal to the email you provided

Asset pack (logos, screenshots, templates): ${assetsUrl}

Questions? Just reply to this email.

— Reid, founder, Learn to GPT`,
  });
}

async function pingSlack(opts: {
  name: string;
  email: string;
  primaryChannel: string;
  handle: string;
  reach: number;
  couponCode: string;
  language: string;
}): Promise<void> {
  if (!SLACK_WEBHOOK_URL.startsWith(SLACK_WEBHOOK_PREFIX)) {
    console.warn("[affiliate-signup] SLACK_WEBHOOK_URL not set or invalid");
    return;
  }
  const text = `:tada: *New affiliate signup — ${opts.name}*
• Email: ${opts.email}
• Channel: *${opts.primaryChannel}* @ ${opts.handle}
• Reach: ${opts.reach.toLocaleString()}
• Language: ${opts.language}
• Coupon: \`${opts.couponCode}\` (20% off first month, 30% rev share lifetime)`;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("[affiliate-signup] slack ping failed:", e);
  }
}

// Rate limit: 5 signups per hour per IP. Abuse prevention — learned from prior
// incident on another product where an unprotected public form got hammered.
const RATE_LIMIT_PER_HOUR = 5;
const RATE_LIMIT_ENDPOINT = "affiliates_signup";

export async function POST(request: Request) {
  // Step 0 — rate limit FIRST, before parsing body or any heavy work.
  // Even bots submitting garbage should be throttled.
  const clientIp = getClientIP(request);
  const ipHashForLimit = clientIp !== "unknown" ? hashIp(clientIp) : null;
  const limitResult = await rateLimitPersistent(ipHashForLimit, RATE_LIMIT_ENDPOINT, RATE_LIMIT_PER_HOUR);
  if (!limitResult.allowed) {
    return rateLimitResponse(RATE_LIMIT_PER_HOUR);
  }

  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  // Honeypot — if any value is present, it's a bot
  if (body.website && body.website.trim().length > 0) {
    // Return success-looking response so bots don't learn anything
    return Response.json({ ok: true });
  }

  // Basic field validation
  const name = (body.name || "").trim().slice(0, 120);
  const email = (body.email || "").trim().toLowerCase().slice(0, 200);
  const primary_channel = body.primary_channel;
  const reach = Number(body.reach_estimate || 0);
  const preferred_language = (body.preferred_language || "en").trim().slice(0, 10);
  const payout_email = (body.payout_email || "").trim().toLowerCase().slice(0, 200);

  if (!name || name.length < 2) return badRequest("Name required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Valid email required");
  if (!payout_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payout_email))
    return badRequest("Valid PayPal email required for payouts");
  if (!primary_channel || !CHANNELS.includes(primary_channel))
    return badRequest("Primary channel required");
  if (!Number.isFinite(reach) || reach < MIN_REACH)
    return badRequest(`Minimum ${MIN_REACH.toLocaleString()} followers required on your primary channel`);
  if (!body.terms_accepted) return badRequest("You must accept the affiliate terms");

  const handles: Record<string, string | null> = {
    tiktok_handle: sanitizeHandle(body.tiktok_handle),
    instagram_handle: sanitizeHandle(body.instagram_handle),
    youtube_handle: sanitizeHandle(body.youtube_handle),
    twitter_handle: sanitizeHandle(body.twitter_handle),
    substack_handle: sanitizeHandle(body.substack_handle),
  };
  const primaryHandle = handles[`${primary_channel}_handle`];
  if (!primaryHandle)
    return badRequest(`Your ${primary_channel} handle is required since that's your primary channel`);

  // Turnstile verify (fail-closed in prod)
  const captchaOk = await verifyTurnstile(body.turnstile_token || "");
  if (!captchaOk) return Response.json({ error: "Verification failed. Please retry." }, { status: 403 });

  const sb = await createSupabaseAdmin();

  // Dedupe: one affiliate per email
  const { data: existing } = await sb
    .from("affiliate_creators")
    .select("id, coupon_code, outreach_status")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    // If previously pitched by Reid, upgrade status instead of blocking
    if (existing.outreach_status === "pitched" || existing.outreach_status === "not_started") {
      return Response.json({
        ok: true,
        message: "You're already in our system — we'll reach out to confirm your existing record.",
        coupon_code: existing.coupon_code,
      });
    }
    return Response.json({ error: "This email is already registered as an affiliate." }, { status: 409 });
  }

  // Generate unique coupon
  let couponCode: string;
  try {
    couponCode = await generateUniqueCoupon(sb, slugForCoupon(primaryHandle || name));
  } catch (e) {
    console.error("[affiliate-signup] coupon gen failed:", e);
    return Response.json({ error: "Could not generate a unique coupon. Please try again." }, { status: 500 });
  }

  // Create Stripe coupon: 20% off, duration=once (first month only)
  let stripeCouponId: string;
  try {
    const stripe = getStripe();
    const coupon = await stripe.coupons.create({
      id: couponCode,
      percent_off: 20,
      duration: "once",
      name: `Affiliate ${couponCode} — 20% off first month`,
      metadata: {
        affiliate_email: email,
        affiliate_name: name,
        rev_share_pct: String(REV_SHARE_PCT),
        source: "self_service_affiliate_signup",
      },
    });
    stripeCouponId = coupon.id;
    // The coupon ID (couponCode) can be passed directly to Checkout as ?prefilled_promo_code=
    // or as a `discounts: [{ coupon: stripeCouponId }]` param. No separate promotion_code needed.
  } catch (e) {
    console.error("[affiliate-signup] Stripe coupon create failed:", e);
    return Response.json({ error: "Payment setup failed. Please contact support." }, { status: 500 });
  }

  // Insert affiliate record
  const nowIso = new Date().toISOString();
  const { error: insertErr } = await sb.from("affiliate_creators").insert({
    name,
    email,
    handle: primaryHandle,
    channel: primary_channel,
    reach_estimate: reach,
    language: preferred_language,
    coupon_code: couponCode,
    stripe_coupon_id: stripeCouponId,
    rev_share_pct: REV_SHARE_PCT,
    outreach_status: "self_service_approved",
    agreement_signed: true,
    signup_source: "self_service",
    applied_at: nowIso,
    terms_accepted_at: nowIso,
    payout_method: "paypal",
    payout_email,
    application_ip_hash: ipHashForLimit,
    ...handles,
  });

  if (insertErr) {
    console.error("[affiliate-signup] DB insert failed:", insertErr);
    // Try to clean up the Stripe coupon so we don't leave a dangler
    try {
      await getStripe().coupons.del(stripeCouponId);
    } catch { /* best-effort */ }
    return Response.json({ error: "Could not save your application. Please retry." }, { status: 500 });
  }

  // Build a "channels" summary (handle list across populated platforms) for the
  // unified #signups ping. The legacy pingSlack() above continues to fire to
  // SLACK_WEBHOOK_URL (#claude-releases) — don't remove it.
  const channelSummary = (
    [
      handles.tiktok_handle ? `tiktok @${handles.tiktok_handle}` : null,
      handles.instagram_handle ? `instagram @${handles.instagram_handle}` : null,
      handles.youtube_handle ? `youtube @${handles.youtube_handle}` : null,
      handles.twitter_handle ? `twitter @${handles.twitter_handle}` : null,
      handles.substack_handle ? `substack @${handles.substack_handle}` : null,
    ].filter(Boolean) as string[]
  ).join(", ");

  // Best-effort side effects — do not fail the signup if these fail
  await Promise.allSettled([
    sendConfirmationEmail({ name, email, couponCode }),
    pingSlack({
      name,
      email,
      primaryChannel: primary_channel,
      handle: primaryHandle,
      reach,
      couponCode,
      language: preferred_language,
    }),
    pingSignupSlack({
      tag: "Academy",
      title: "affiliate signup",
      emoji: ":handshake:",
      fields: [
        ["Creator", name],
        ["Email", email],
        ["Channels", channelSummary || `${primary_channel} @${primaryHandle}`],
        ["Total reach", reach.toLocaleString()],
        ["Coupon", couponCode],
      ],
    }),
  ]);

  return Response.json({
    ok: true,
    coupon_code: couponCode,
    share_url: `https://learntogpt.com/?coupon=${couponCode}`,
  });
}
