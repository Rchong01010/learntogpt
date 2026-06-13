/**
 * Abandoned cart email template.
 *
 * Sent ~24 hours after a user completes 1+ free courses but has not purchased
 * the full course unlock. Tone: encouraging progress acknowledgment, not pushy.
 * Price is intentionally omitted (locked rule: never list pricing publicly).
 *
 * Returns { subject, html, text } for use with Resend.
 */

import { escapeHtml } from "@/lib/escape-html";

const APP_URL = "https://learntogpt.com";
const UTM_BASE = "utm_source=email&utm_medium=email&utm_campaign=abandoned_cart";
const COURSES_URL = `${APP_URL}/courses?${UTM_BASE}&utm_content=nudge`;
const UNSUBSCRIBE_URL = `${APP_URL}/unsubscribe?${UTM_BASE}&utm_content=unsubscribe`;

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function wrapHtml(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #fafaf9;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1c1917;">
    ${body}
    <p style="color: #a8a29e; font-size: 12px; margin-top: 40px; line-height: 1.5; border-top: 1px solid #e7e5e4; padding-top: 16px;">
      Learn to GPT &middot; learntogpt.com<br>
      <a href="${UNSUBSCRIBE_URL}" style="color: #a8a29e; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`.trim();
}

function ctaButton(label: string, url: string): string {
  return `<a href="${url}" style="display: inline-block; background: #e07a3a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${label}</a>`;
}

/**
 * Build the abandoned cart nudge email.
 *
 * @param displayName - User's display name (nullable)
 * @param completedCount - Number of free courses/lessons they completed
 */
export function buildAbandonedCartEmail(
  displayName: string | null,
  completedCount: number,
): EmailContent {
  const safeName = displayName ? escapeHtml(displayName).split(" ")[0] : "there";
  const greeting = `Hey ${safeName},`;

  const subject = "You're making great progress on Learn to GPT";

  const progressLine =
    completedCount === 1
      ? "You've already completed your first lesson"
      : `You've already completed ${completedCount} lessons`;

  const html = wrapHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      ${progressLine} — that puts you ahead of most people who sign up.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      The full library unlocks everything: advanced workflows, real-world templates, and lifetime access to every course we ship. One purchase, nothing recurring.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      If you're ready to go deeper, it's all waiting for you.
    </p>
    ${ctaButton("See What's Included &rarr;", COURSES_URL)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);

  const text = [
    greeting,
    "",
    `${progressLine} -- that puts you ahead of most people who sign up.`,
    "",
    "The full library unlocks everything: advanced workflows, real-world templates, and lifetime access to every course we ship. One purchase, nothing recurring.",
    "",
    "If you're ready to go deeper, it's all waiting for you.",
    "",
    `See what's included: ${COURSES_URL}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${UNSUBSCRIBE_URL}`,
  ].join("\n");

  return { subject, html, text };
}
