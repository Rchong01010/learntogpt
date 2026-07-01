import { Resend } from "resend";
import { verifyCronAuth } from "@/lib/auth";
import { personalizeUnsubscribe, buildUnsubscribeHeaders } from "@/lib/unsubscribe-token";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import {
  buildWelcomeEmail,
  buildDay3Email,
  buildDay7Email,
  buildReengagementDay3Email,
  buildReengagementDay7Email,
  buildReengagementDay14Email,
} from "@/lib/emails/welcome-sequence";

/**
 * Daily welcome + re-engagement email cron.
 *
 * Phase 1 — Welcome sequence (xp = 0):
 *   Email 1 — ~1 hour after signup (welcome + first lesson link)
 *   Email 2 — Day 3 if XP = 0 (re-engagement)
 *   Email 3 — Day 7 if XP = 0 (social proof)
 *
 * Phase 2 — Re-engagement sequence (xp > 0, inactive):
 *   Email 10 — 3 days after last activity
 *   Email 11 — 7 days after last activity
 *   Email 12 — 14 days after last activity
 *
 * Idempotency: welcome_email_log unique constraint on (user_id, email_number)
 * prevents duplicate sends.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>.
 * Rate limit: max 50 emails per cron run (defense against runaway sends).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- In-memory rate limiting (defense-in-depth for cron endpoints) ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

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

const MAX_EMAILS_PER_RUN = 50;

// Time windows for each email (in milliseconds).
// Cron runs once daily — windows are 24h wide so no signups are missed.
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FIVE_HOURS_MS = 25 * 60 * 60 * 1000;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;
const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;

type EmailJob = {
  user_id: string;
  email_number: 1 | 2 | 3 | 10 | 11 | 12;
  display_name: string | null;
  xp?: number;
};

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
    console.error("[welcome-emails] CRON_SECRET not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (!verifyCronAuth(auth, cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const resendKey = process.env.RESEND_API_KEY;

  if (isProd && !resendKey) {
    console.error("[welcome-emails] RESEND_API_KEY required in production");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const supabase = await createSupabaseAdmin();
  const now = Date.now();
  const jobs: EmailJob[] = [];

  // --- Email 1: users created 1-25 hours ago (daily cron, 24h window) ---
  const e1Start = new Date(now - TWENTY_FIVE_HOURS_MS).toISOString();
  const e1End = new Date(now - ONE_HOUR_MS).toISOString();

  const { data: email1Users, error: e1Err } = await supabase
    .from("user_profiles")
    .select("user_id, display_name")
    .gte("created_at", e1Start)
    .lte("created_at", e1End)
    .eq("email_unsubscribed", false);

  if (e1Err) {
    console.error("[welcome-emails] email1 query failed:", e1Err.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  for (const u of email1Users ?? []) {
    jobs.push({
      user_id: u.user_id,
      email_number: 1,
      display_name: u.display_name,
    });
  }

  // --- Email 2: users created 2-4 days ago, XP = 0 ---
  const e2Start = new Date(now - FOUR_DAYS_MS).toISOString();
  const e2End = new Date(now - TWO_DAYS_MS).toISOString();

  const { data: email2Users, error: e2Err } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, xp")
    .gte("created_at", e2Start)
    .lte("created_at", e2End)
    .eq("xp", 0)
    .eq("email_unsubscribed", false);

  if (e2Err) {
    console.error("[welcome-emails] email2 query failed:", e2Err.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  for (const u of email2Users ?? []) {
    jobs.push({
      user_id: u.user_id,
      email_number: 2,
      display_name: u.display_name,
    });
  }

  // --- Email 3: users created 6-8 days ago, XP = 0 ---
  const e3Start = new Date(now - EIGHT_DAYS_MS).toISOString();
  const e3End = new Date(now - SIX_DAYS_MS).toISOString();

  const { data: email3Users, error: e3Err } = await supabase
    .from("user_profiles")
    .select("user_id, display_name, xp")
    .gte("created_at", e3Start)
    .lte("created_at", e3End)
    .eq("xp", 0)
    .eq("email_unsubscribed", false);

  if (e3Err) {
    console.error("[welcome-emails] email3 query failed:", e3Err.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  for (const u of email3Users ?? []) {
    jobs.push({
      user_id: u.user_id,
      email_number: 3,
      display_name: u.display_name,
    });
  }

  // --- Phase 2: Re-engagement emails for users with xp > 0 who went inactive ---
  const reengagementSchedule: Array<{
    days: number;
    emailNumber: 10 | 11 | 12;
  }> = [
    { days: 3, emailNumber: 10 },
    { days: 7, emailNumber: 11 },
    { days: 14, emailNumber: 12 },
  ];

  for (const { days, emailNumber } of reengagementSchedule) {
    const { data: eligible, error: reErr } = await supabase.rpc(
      "get_reengagement_eligible",
      {
        p_days_ago: days,
        p_window_hours: 12,
        p_email_number: emailNumber,
        p_limit: 20,
      },
    );

    if (reErr) {
      console.error(
        "[welcome-emails] reengagement query failed:",
        { emailNumber, error: reErr.message },
      );
      continue; // Don't fail the whole cron for re-engagement errors
    }

    for (const u of eligible ?? []) {
      jobs.push({
        user_id: u.user_id,
        email_number: emailNumber,
        display_name: u.display_name,
        xp: u.total_xp,
      });
    }
  }

  if (jobs.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      skipped: 0,
      reason: "no eligible users",
    });
  }

  // Filter out users who already received the email (dedup via welcome_email_log)
  const userIds = [...new Set(jobs.map((j) => j.user_id))];
  const { data: alreadySent, error: logErr } = await supabase
    .from("welcome_email_log")
    .select("user_id, email_number")
    .in("user_id", userIds)
    .eq("status", "sent");

  if (logErr) {
    console.error("[welcome-emails] log query failed:", logErr.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  const sentSet = new Set(
    (alreadySent ?? []).map((r) => `${r.user_id}:${r.email_number}`),
  );

  const pendingJobs = jobs.filter(
    (j) => !sentSet.has(`${j.user_id}:${j.email_number}`),
  );

  if (pendingJobs.length === 0) {
    return Response.json({
      success: true,
      sent: 0,
      skipped: jobs.length,
      reason: "all eligible users already emailed",
    });
  }

  // Cap at MAX_EMAILS_PER_RUN
  const batch = pendingJobs.slice(0, MAX_EMAILS_PER_RUN);

  const resend = isProd && resendKey ? new Resend(resendKey) : null;
  let sent = 0;
  let failed = 0;
  let skippedNoEmail = 0;

  for (const job of batch) {
    // Look up email from auth.users (not user_profiles)
    const { data: userData, error: userErr } =
      await supabase.auth.admin.getUserById(job.user_id);

    if (userErr || !userData?.user?.email) {
      skippedNoEmail++;
      continue;
    }

    const email = userData.user.email;
    const displayName =
      job.display_name ??
      (userData.user.user_metadata?.display_name as string | undefined) ??
      null;

    // Build the right email
    let content;
    switch (job.email_number) {
      case 1:
        content = buildWelcomeEmail(displayName);
        break;
      case 2:
        content = buildDay3Email(displayName);
        break;
      case 3:
        content = buildDay7Email(displayName);
        break;
      case 10:
        content = buildReengagementDay3Email(displayName, job.xp ?? 0);
        break;
      case 11:
        content = buildReengagementDay7Email(displayName, job.xp ?? 0);
        break;
      case 12:
        content = buildReengagementDay14Email(displayName, job.xp ?? 0);
        break;
    }

    if (!resend) {
      console.info("[welcome-emails] (dev) would send", {
        user_id: job.user_id,
        email_number: job.email_number,
        subject: content.subject,
      });

      // Log even in dev to test dedup
      await supabase.from("welcome_email_log").upsert(
        {
          user_id: job.user_id,
          email_number: job.email_number,
          status: "sent",
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,email_number" },
      );

      sent++;
      continue;
    }

    try {
      const personalized = personalizeUnsubscribe(content, email);
      await resend.emails.send({
        from: "Learn to GPT <notifications@learntogpt.com>",
        to: email,
        subject: personalized.subject,
        html: personalized.html,
        text: personalized.text,
        headers: buildUnsubscribeHeaders(email),
      });

      await supabase.from("welcome_email_log").upsert(
        {
          user_id: job.user_id,
          email_number: job.email_number,
          status: "sent",
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,email_number" },
      );

      sent++;
    } catch (err) {
      failed++;
      console.error("[welcome-emails] send failed", {
        user_id: job.user_id,
        email_number: job.email_number,
        error: err instanceof Error ? err.message : String(err),
      });

      // Log the failure too so we can inspect later
      await supabase
        .from("welcome_email_log")
        .upsert(
          {
            user_id: job.user_id,
            email_number: job.email_number,
            status: "failed",
            sent_at: new Date().toISOString(),
          },
          { onConflict: "user_id,email_number" },
        )
        .then(() => {});
    }
  }

  return Response.json({
    success: true,
    sent,
    failed,
    skipped_no_email: skippedNoEmail,
    skipped_already_sent: jobs.length - pendingJobs.length,
    total_eligible: jobs.length,
    capped: pendingJobs.length > MAX_EMAILS_PER_RUN,
    dev_mode: !resend,
  });
}
