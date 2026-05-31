/**
 * Critical-path alerting for revenue-bearing flows.
 *
 * Used wherever a silent failure means customer-facing breakage Reid wouldn't
 * otherwise see (Stripe webhook drops, subscription upsert failures, affiliate
 * attribution losses, etc.). Console logs alone aren't enough because Reid
 * doesn't tail Vercel logs hourly.
 *
 * Env vars validated at module load — crash early if misconfigured.
 * Both Slack and email send in parallel; neither will throw at runtime.
 * The point is to surface the *original* failure, not to introduce a
 * new one in the alert path itself.
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

const SLACK_WEBHOOK_URL = (process.env.SLACK_WEBHOOK_URL ?? "").trim();
if (!SLACK_WEBHOOK_URL) throw new Error("Missing SLACK_WEBHOOK_URL");
const SLACK_WEBHOOK_PREFIX = "https://hooks.slack.com/";

if (!process.env.ALERT_EMAIL) {
  throw new Error("Missing ALERT_EMAIL environment variable");
}
const ALERT_TO_EMAIL = process.env.ALERT_EMAIL.trim();

export type AlertSeverity = "critical" | "high" | "warning";

export interface AlertOptions {
  severity: AlertSeverity;
  source: string;
  message: string;
  context?: Record<string, unknown>;
}

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  critical: ":rotating_light:",
  high: ":warning:",
  warning: ":eyes:",
};

const SEVERITY_TAG: Record<AlertSeverity, string> = {
  critical: "[CRITICAL]",
  high: "[HIGH]",
  warning: "[WARNING]",
};

function formatContext(ctx?: Record<string, unknown>): string {
  if (!ctx) return "";
  return Object.entries(ctx)
    .map(([k, v]) => {
      const formatted = typeof v === "string" ? v : JSON.stringify(v);
      return `• ${k}: ${formatted}`;
    })
    .join("\n");
}

async function sendSlack(opts: AlertOptions): Promise<void> {
  if (!SLACK_WEBHOOK_URL.startsWith(SLACK_WEBHOOK_PREFIX)) {
    console.warn("[alert] SLACK_WEBHOOK_URL does not start with expected prefix — Slack alert skipped");
    return;
  }
  const ctx = formatContext(opts.context);
  const text = `${SEVERITY_EMOJI[opts.severity]} *${SEVERITY_TAG[opts.severity]} ${opts.source}*
${opts.message}${ctx ? `\n${ctx}` : ""}`;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("[alert] slack send failed:", e);
  }
}

async function sendEmail(opts: AlertOptions): Promise<void> {
  const resend = new Resend(RESEND_API_KEY);
  const subject = `${SEVERITY_TAG[opts.severity]} ${opts.source} — ${opts.message.slice(0, 80)}`;
  const ctx = formatContext(opts.context);
  try {
    // Reuse the already-verified notifications@ sender. A dedicated alerts@
    // sender would need its own Resend domain verification, which we haven't
    // done — using a verified sender is the difference between "alert lands"
    // and "alert silently bounces."
    await resend.emails.send({
      from: "Learn to GPT Alerts <notifications@learntogpt.com>",
      to: ALERT_TO_EMAIL,
      subject,
      text: `${SEVERITY_TAG[opts.severity]} ${opts.source}

${opts.message}${ctx ? `\n\nContext:\n${ctx}` : ""}

Timestamp: ${new Date().toISOString()}`,
    });
  } catch (e) {
    console.error("[alert] email send failed:", e);
  }
}

export async function alertReid(opts: AlertOptions): Promise<void> {
  // Log first so the failure is recorded even if both channels are down.
  // Pass values as separate args (constant format string) to avoid format-string
  // injection if any of the user-controlled fields contain `%s` etc.
  console.error("[alert]", opts.severity, opts.source, opts.message, opts.context ?? "");
  await Promise.allSettled([sendSlack(opts), sendEmail(opts)]);
}
