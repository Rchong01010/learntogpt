import { Resend } from "resend";
import { verifyCronAuth } from "@/lib/auth";
import { personalizeUnsubscribe, buildUnsubscribeHeaders } from "@/lib/unsubscribe-token";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { escapeHtml } from "@/lib/escape-html";

/**
 * Daily streak-reminder cron.
 *
 * Fires once a day (02:00 UTC per vercel.json). For every user whose most
 * recent lesson completion is 20–28 hours old AND who still has an active
 * streak, we email them a "your N-day streak ends soon" nudge. The 20h lower
 * bound means we do not spam users who just finished a lesson; the 28h upper
 * bound catches late-night learners across timezones (cron runs once a day,
 * so the window must cover a full day of "about to break" cases).
 *
 * Idempotency: streak_reminder_sent_at (migration 014) prevents a second
 * reminder within 12 hours. Dev environments log only — the email send is
 * gated on NODE_ENV === 'production'.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>. Vercel Cron sets this header
 * automatically when CRON_SECRET is in project env. Manual curl works too.
 */

// --- In-memory rate limiting (defense-in-depth for cron endpoints) ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests
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

// This is a Node.js-only route (uses @supabase/supabase-js service-role client
// and Resend SDK). Force node runtime to be explicit.
export const runtime = "nodejs";

// Never cache — always fetch live user state when the cron fires.
export const dynamic = "force-dynamic";

const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;
const TWENTY_EIGHT_HOURS_MS = 28 * 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

type Candidate = {
  user_id: string;
  current_streak: number;
  email: string;
  display_name: string | null;
  last_completed_at: string;
};

function buildEmail(displayName: string | null, streak: number, appUrl: string) {
  const safeName = displayName ? escapeHtml(displayName).split(" ")[0] : "there";
  const subject = `Your ${streak}-day streak ends in 4 hours`;
  const dashboardUrl = `${appUrl}/dashboard`;

  const text = [
    `Hey ${displayName ? displayName.split(" ")[0] : "there"},`,
    "",
    `Your ${streak}-day Learn to GPT streak is about to break.`,
    "One short lesson keeps it alive.",
    "",
    `Jump back in: ${dashboardUrl}`,
    "",
    "See you in there.",
    "— Learn to GPT",
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1c1917;">
      <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">Hey ${safeName},</h2>
      <p style="font-size: 16px; line-height: 1.5; margin: 0 0 12px 0;">
        Your <strong>${streak}-day</strong> Learn to GPT streak is about to break.
      </p>
      <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
        One short lesson keeps it alive.
      </p>
      <a href="${dashboardUrl}"
         style="display: inline-block; background: #e07a3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Save my streak
      </a>
      <p style="color: #78716c; font-size: 13px; margin-top: 32px; line-height: 1.5;">
        You are getting this because you have an active streak. Miss a day and it resets to zero.
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}

export async function GET(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Auth — Vercel Cron sets Authorization: Bearer $CRON_SECRET automatically.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[streak-reminder] CRON_SECRET not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (!verifyCronAuth(auth, cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const resendKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

  if (isProd && !resendKey) {
    console.error("[streak-reminder] RESEND_API_KEY required in production");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const now = Date.now();
  const windowStart = new Date(now - TWENTY_EIGHT_HOURS_MS).toISOString();
  const windowEnd = new Date(now - TWENTY_HOURS_MS).toISOString();
  const reminderCutoff = new Date(now - TWELVE_HOURS_MS).toISOString();

  const supabase = await createSupabaseAdmin();

  // 0. Reset stale streaks — if a user's last entry in user_streaks is older
  //    than yesterday, their streak already broke and current_streak is stale.
  //    We zero it out before sending reminders so we never email a wrong number.
  //    Uses service_role (admin) to bypass migration 009's trigger that blocks
  //    authenticated writes to streak fields.
  const yesterday = new Date(now - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD (date only, matches user_streaks.date column)

  const { data: staleUsers, error: staleErr } = await supabase
    .from("user_profiles")
    .select("user_id")
    .gt("current_streak", 0);

  if (staleErr) {
    console.error("[streak-reminder] stale-streak query failed:", staleErr.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  let resetCount = 0;
  for (const u of staleUsers ?? []) {
    // Find the most recent streak date for this user
    const { data: latestStreak } = await supabase
      .from("user_streaks")
      .select("date")
      .eq("user_id", u.user_id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    // If no streak rows at all, or last date is before yesterday → reset
    if (!latestStreak?.date || latestStreak.date < yesterday) {
      const { error: resetErr } = await supabase
        .from("user_profiles")
        .update({ current_streak: 0 })
        .eq("user_id", u.user_id);

      if (resetErr) {
        console.error("[streak-reminder] reset failed for user", {
          user_id: u.user_id,
          error: resetErr.message,
        });
      } else {
        resetCount += 1;
      }
    }
  }

  if (resetCount > 0) {
    console.info(`[streak-reminder] reset ${resetCount} stale streak(s)`);
  }

  // 1. Pull all users with an active streak who have not been reminded in 12h.
  //    RLS is bypassed (service_role), so we see every row.
  //    After the reset above, only genuinely active streaks remain.
  const { data: profiles, error: profileErr } = await supabase
    .from("user_profiles")
    .select("user_id, current_streak, streak_reminder_sent_at")
    .gt("current_streak", 0)
    .eq("email_unsubscribed", false);

  if (profileErr) {
    console.error("[streak-reminder] profile query failed:", profileErr.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  const eligibleProfiles = (profiles ?? []).filter(
    (p) => !p.streak_reminder_sent_at || p.streak_reminder_sent_at < reminderCutoff,
  );

  if (eligibleProfiles.length === 0) {
    return Response.json({ success: true, sent: 0, skipped: 0, reset: resetCount, reason: "no active streaks" });
  }

  // 2. For each, find max(completed_at) from user_progress and filter the
  //    20–28h window. We do this per-user rather than as a single join because
  //    the Supabase JS client does not easily express "max grouped by user_id
  //    with having clause" — per-user is fine for the scale we are at.
  const candidates: Candidate[] = [];

  for (const profile of eligibleProfiles) {
    const { data: lastCompletion } = await supabase
      .from("user_progress")
      .select("completed_at")
      .eq("user_id", profile.user_id)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastCompletion?.completed_at) continue;

    const completedAt = lastCompletion.completed_at;
    if (completedAt < windowStart || completedAt > windowEnd) continue;

    // 3. Look up email + display_name via auth.admin.getUserById (auth.users
    //    is not queryable from the client; service_role gives us the admin API).
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(
      profile.user_id,
    );
    if (userErr || !userData?.user?.email) continue;

    candidates.push({
      user_id: profile.user_id,
      current_streak: profile.current_streak,
      email: userData.user.email,
      display_name:
        (userData.user.user_metadata?.display_name as string | undefined) ?? null,
      last_completed_at: completedAt,
    });
  }

  if (candidates.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      skipped: eligibleProfiles.length,
      reset: resetCount,
      reason: "no users in 20-28h window",
    });
  }

  // 4. Send (prod) or log (dev). Update streak_reminder_sent_at on success.
  const resend = isProd && resendKey ? new Resend(resendKey) : null;
  let sent = 0;
  let failed = 0;

  for (const c of candidates) {
    const { subject, html, text } = buildEmail(c.display_name, c.current_streak, appUrl);

    if (!resend) {
      console.info("[streak-reminder] (dev) would email", {
        email: c.email,
        streak: c.current_streak,
        last_completed_at: c.last_completed_at,
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

      await supabase
        .from("user_profiles")
        .update({ streak_reminder_sent_at: new Date().toISOString() })
        .eq("user_id", c.user_id);

      sent += 1;
    } catch (err) {
      failed += 1;
      // Constant format string — pass dynamic values as separate args so an
      // attacker-controlled error message cannot forge log lines.
      console.error(
        "[streak-reminder] send failed",
        { user_id: c.user_id, error: err instanceof Error ? err.message : String(err) },
      );
    }
  }

  return Response.json({
    success: true,
    sent,
    failed,
    reset: resetCount,
    scanned: eligibleProfiles.length,
    candidates: candidates.length,
    dev_mode: !resend,
  });
}
