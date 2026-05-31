/**
 * Welcome email sequence templates (3 emails over 7 days)
 * + re-engagement sequence for users who earned XP then went inactive.
 *
 * Welcome (xp = 0):
 *   Email 1: Sent ~1 hour after signup — warm welcome + first lesson link.
 *   Email 2: Day 3, only if XP = 0 — gentle re-engagement.
 *   Email 3: Day 7, only if XP = 0 — social proof + final nudge.
 *
 * Re-engagement (xp > 0, inactive):
 *   Email 10: 3 days after last activity — progress reminder.
 *   Email 11: 7 days after last activity — XP + next step.
 *   Email 12: 14 days after last activity — final gentle nudge.
 *
 * All templates return { subject, html, text } for use with Resend.
 */

import { escapeHtml } from "@/lib/escape-html";

const APP_URL = "https://learntogpt.com";
const UTM_BASE = "utm_source=email&utm_medium=email&utm_campaign=welcome_sequence";
const FIRST_LESSON_URL_WELCOME = `${APP_URL}/courses/why-chatgpt?${UTM_BASE}&utm_content=welcome`;
const FIRST_LESSON_URL_DAY3 = `${APP_URL}/courses/why-chatgpt?${UTM_BASE}&utm_content=day3_reengagement`;
const FIRST_LESSON_URL_DAY7 = `${APP_URL}/courses/why-chatgpt?${UTM_BASE}&utm_content=day7_social_proof`;
const UNSUBSCRIBE_URL = `${APP_URL}/unsubscribe?${UTM_BASE}&utm_content=unsubscribe`;

// Re-engagement campaign UTMs (users with xp > 0 who went inactive)
const REENGAGEMENT_UTM_BASE = "utm_source=email&utm_medium=email&utm_campaign=reengagement";
const DASHBOARD_URL_DAY3 = `${APP_URL}/dashboard?${REENGAGEMENT_UTM_BASE}&utm_content=day3`;
const DASHBOARD_URL_DAY7 = `${APP_URL}/dashboard?${REENGAGEMENT_UTM_BASE}&utm_content=day7`;
const DASHBOARD_URL_DAY14 = `${APP_URL}/dashboard?${REENGAGEMENT_UTM_BASE}&utm_content=day14`;
const REENGAGEMENT_UNSUBSCRIBE_URL = `${APP_URL}/unsubscribe?${REENGAGEMENT_UTM_BASE}&utm_content=unsubscribe`;

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
 * Email 1: Welcome (sent ~1 hour after signup)
 */
export function buildWelcomeEmail(displayName: string | null): EmailContent {
  const safeName = displayName ? escapeHtml(displayName).split(" ")[0] : "there";
  const greeting = `Hey ${safeName},`;

  const subject = "Your ChatGPT learning path is ready";

  const html = wrapHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      Welcome to Learn to GPT. Your learning path is set up and ready to go.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      The best place to start is <strong>Track 1: Foundations</strong>. The first lesson takes about 5 minutes and walks you through how ChatGPT actually thinks.
    </p>
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin: 0 0 24px 0;">
      Join 200+ learners mastering ChatGPT.
    </p>
    ${ctaButton("Start Your First Lesson &rarr;", FIRST_LESSON_URL_WELCOME)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      See you in there.<br>
      &mdash; Learn to GPT
    </p>
  `);

  const text = [
    greeting,
    "",
    "Welcome to Learn to GPT. Your learning path is set up and ready to go.",
    "",
    "The best place to start is Track 1: Foundations. The first lesson takes about 5 minutes and walks you through how ChatGPT actually thinks.",
    "",
    "Join 200+ learners mastering ChatGPT.",
    "",
    `Start your first lesson: ${FIRST_LESSON_URL_WELCOME}`,
    "",
    "See you in there.",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${UNSUBSCRIBE_URL}`,
  ].join("\n");

  return { subject, html, text };
}

/**
 * Email 2: Day 3 re-engagement (only if XP = 0)
 */
export function buildDay3Email(displayName: string | null): EmailContent {
  const safeName = displayName ? escapeHtml(displayName).split(" ")[0] : "there";
  const greeting = `Hey ${safeName},`;

  const subject = "Still curious about ChatGPT?";

  const html = wrapHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      You signed up for Learn to GPT a few days ago but haven't started yet. No worries &mdash; your account is ready whenever you are.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      In 5 minutes, you'll know how ChatGPT thinks differently from other AI. That one concept changes everything about how you use it.
    </p>
    ${ctaButton("Jump In &rarr;", FIRST_LESSON_URL_DAY3)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);

  const text = [
    greeting,
    "",
    "You signed up for Learn to GPT a few days ago but haven't started yet. No worries -- your account is ready whenever you are.",
    "",
    "In 5 minutes, you'll know how ChatGPT thinks differently from other AI. That one concept changes everything about how you use it.",
    "",
    `Jump in: ${FIRST_LESSON_URL_DAY3}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${UNSUBSCRIBE_URL}`,
  ].join("\n");

  return { subject, html, text };
}

/**
 * Email 3: Day 7 social proof (only if XP = 0)
 */
export function buildDay7Email(displayName: string | null): EmailContent {
  const safeName = displayName ? escapeHtml(displayName).split(" ")[0] : "there";
  const greeting = `Hey ${safeName},`;

  const subject = "Here's what other learners discovered this week";

  const html = wrapHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      While your account has been waiting, other learners have been busy:
    </p>
    <ul style="font-size: 15px; line-height: 1.8; color: #44403c; margin: 0 0 12px 0; padding-left: 20px;">
      <li>Hundreds of exercises completed this week</li>
      <li>Learners across 7 languages building ChatGPT fluency</li>
      <li>New lessons dropping every week</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Your account is still ready. One lesson is all it takes to get started.
    </p>
    ${ctaButton("Start Learning &rarr;", FIRST_LESSON_URL_DAY7)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);

  const text = [
    greeting,
    "",
    "While your account has been waiting, other learners have been busy:",
    "",
    "- Hundreds of exercises completed this week",
    "- Learners across 7 languages building ChatGPT fluency",
    "- New lessons dropping every week",
    "",
    "Your account is still ready. One lesson is all it takes to get started.",
    "",
    `Start learning: ${FIRST_LESSON_URL_DAY7}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${UNSUBSCRIBE_URL}`,
  ].join("\n");

  return { subject, html, text };
}

// ============================================================
// Re-engagement emails (users with xp > 0 who went inactive)
// ============================================================

function wrapReengagementHtml(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #fafaf9;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1c1917;">
    ${body}
    <p style="color: #a8a29e; font-size: 12px; margin-top: 40px; line-height: 1.5; border-top: 1px solid #e7e5e4; padding-top: 16px;">
      Learn to GPT &middot; learntogpt.com<br>
      <a href="${REENGAGEMENT_UNSUBSCRIBE_URL}" style="color: #a8a29e; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`.trim();
}

/**
 * Re-engagement Email 10: 3 days after last activity (xp > 0)
 */
export function buildReengagementDay3Email(
  displayName: string | null,
  xp: number,
): EmailContent {
  const safeName = displayName
    ? escapeHtml(displayName).split(" ")[0]
    : "there";
  const greeting = `Hey ${safeName},`;
  const subject = "Your progress on Learn to GPT is waiting";
  const html = wrapReengagementHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      You've earned ${xp} XP so far. Your progress is saved and ready for you to pick up where you left off.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      The next lesson picks up right where you stopped.
    </p>
    ${ctaButton("Continue Learning &rarr;", DASHBOARD_URL_DAY3)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);
  const text = [
    greeting,
    "",
    `You've earned ${xp} XP so far. Your progress is saved and ready for you to pick up where you left off.`,
    "",
    "The next lesson picks up right where you stopped.",
    "",
    `Continue learning: ${DASHBOARD_URL_DAY3}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${REENGAGEMENT_UNSUBSCRIBE_URL}`,
  ].join("\n");
  return { subject, html, text };
}

/**
 * Re-engagement Email 11: 7 days after last activity (xp > 0)
 */
export function buildReengagementDay7Email(
  displayName: string | null,
  xp: number,
): EmailContent {
  const safeName = displayName
    ? escapeHtml(displayName).split(" ")[0]
    : "there";
  const greeting = `Hey ${safeName},`;
  const subject = "Still curious about ChatGPT?";
  const html = wrapReengagementHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      You've already built up ${xp} XP on Learn to GPT. That's real progress.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Your next lesson is ready whenever you are. Most lessons take 5-10 minutes.
    </p>
    ${ctaButton("Pick Up Where You Left Off &rarr;", DASHBOARD_URL_DAY7)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);
  const text = [
    greeting,
    "",
    `You've already built up ${xp} XP on Learn to GPT. That's real progress.`,
    "",
    "Your next lesson is ready whenever you are. Most lessons take 5-10 minutes.",
    "",
    `Pick up where you left off: ${DASHBOARD_URL_DAY7}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${REENGAGEMENT_UNSUBSCRIBE_URL}`,
  ].join("\n");
  return { subject, html, text };
}

/**
 * Re-engagement Email 12: 14 days after last activity (xp > 0)
 */
export function buildReengagementDay14Email(
  displayName: string | null,
  xp: number,
): EmailContent {
  const safeName = displayName
    ? escapeHtml(displayName).split(" ")[0]
    : "there";
  const greeting = `Hey ${safeName},`;
  const subject = "We saved your spot";
  const html = wrapReengagementHtml(`
    <h2 style="color: #e07a3a; margin: 0 0 16px 0; font-size: 22px;">${greeting}</h2>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
      Your ${xp} XP and all your progress are still here. Nothing's been lost.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Whenever you're ready, your dashboard has your next step queued up.
    </p>
    ${ctaButton("Jump Back In &rarr;", DASHBOARD_URL_DAY14)}
    <p style="font-size: 14px; line-height: 1.5; color: #78716c; margin-top: 24px;">
      &mdash; Learn to GPT
    </p>
  `);
  const text = [
    greeting,
    "",
    `Your ${xp} XP and all your progress are still here. Nothing's been lost.`,
    "",
    "Whenever you're ready, your dashboard has your next step queued up.",
    "",
    `Jump back in: ${DASHBOARD_URL_DAY14}`,
    "",
    "-- Learn to GPT",
    "",
    `Unsubscribe: ${REENGAGEMENT_UNSUBSCRIBE_URL}`,
  ].join("\n");
  return { subject, html, text };
}
