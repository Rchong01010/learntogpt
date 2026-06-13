/**
 * HMAC-signed unsubscribe tokens.
 *
 * Link format: /unsubscribe?e=<base64url(email)>&t=<hmac>
 *
 * The token is HMAC-SHA256(lowercased email) keyed with CRON_SECRET, encoded
 * base64url. No auth is required to unsubscribe (industry standard — the link
 * must work from any mail client), but the HMAC means only someone holding a
 * link we generated for that exact address can flip the flag, so you cannot
 * unsubscribe other people by guessing emails.
 *
 * Secret choice: CRON_SECRET. It already exists in both Vercel projects
 * (claude-academy + learntogpt), is server-only (never shipped to the client),
 * and is exactly as sensitive as this use case requires. Rotating CRON_SECRET
 * invalidates old unsubscribe links — acceptable, since every new email
 * carries a freshly signed link.
 *
 * Verification uses crypto.timingSafeEqual (constant-time) to prevent
 * timing-oracle recovery of valid tokens.
 */

import { createHmac, timingSafeEqual } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

function getSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is required for unsubscribe tokens");
  return secret;
}

/** Compute the unsubscribe token for an email address. */
export function computeUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret())
    .update(email.trim().toLowerCase())
    .digest("base64url");
}

/** Base64url-encode an email for use in the `e` query param. */
export function encodeEmail(email: string): string {
  return Buffer.from(email.trim().toLowerCase(), "utf8").toString("base64url");
}

/**
 * Verify an (encoded email, token) pair. Returns the decoded email when the
 * token is valid, or null otherwise. Never throws on malformed input.
 */
export function verifyUnsubscribeToken(
  encodedEmail: string | undefined,
  token: string | undefined,
): string | null {
  if (!encodedEmail || !token) return null;
  if (encodedEmail.length > 512 || token.length > 128) return null;

  let email: string;
  try {
    email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  } catch {
    return null;
  }
  // Minimal sanity check — not validation, just rejects garbage early.
  if (!email || !email.includes("@") || email.length > 320) return null;

  const expected = Buffer.from(computeUnsubscribeToken(email), "utf8");
  const provided = Buffer.from(token, "utf8");
  if (expected.length !== provided.length) return null;

  return timingSafeEqual(expected, provided) ? email : null;
}

/** Build the human-facing unsubscribe page URL for an email footer. */
export function buildUnsubscribeUrl(email: string, utm?: string): string {
  const base = `${APP_URL}/unsubscribe?e=${encodeEmail(email)}&t=${computeUnsubscribeToken(email)}`;
  return utm ? `${base}&${utm}` : base;
}

/**
 * RFC 8058 one-click unsubscribe headers for Resend sends.
 * Mail clients POST `List-Unsubscribe=One-Click` to the URL in
 * List-Unsubscribe; our /api/unsubscribe route handles it.
 */
export function buildUnsubscribeHeaders(email: string): Record<string, string> {
  const url = `${APP_URL}/api/unsubscribe?e=${encodeEmail(email)}&t=${computeUnsubscribeToken(email)}`;
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/**
 * Personalize template unsubscribe links at send time.
 *
 * Templates embed generic `${APP_URL}/unsubscribe?utm...` links (they don't
 * know the recipient). This rewrites every `/unsubscribe?` occurrence in the
 * rendered html/text to carry the recipient's signed token, preserving the
 * UTM params. Applied at the resend.emails.send callsite so template builder
 * signatures stay untouched.
 */
export function personalizeUnsubscribe<T extends { html: string; text: string }>(
  content: T,
  recipientEmail: string,
): T {
  const tokenized = `/unsubscribe?e=${encodeEmail(recipientEmail)}&t=${computeUnsubscribeToken(recipientEmail)}&`;
  return {
    ...content,
    html: content.html.split("/unsubscribe?").join(tokenized),
    text: content.text.split("/unsubscribe?").join(tokenized),
  };
}
