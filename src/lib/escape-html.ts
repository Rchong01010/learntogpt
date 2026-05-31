/**
 * Escape user-controlled strings before interpolating into HTML email bodies.
 *
 * Used wherever a server-side route templates HTML with values that originated
 * from user input (signup names, affiliate handles, etc.). Prevents accidental
 * markup injection in transactional emails.
 *
 * Was previously copy-pasted into webhooks/signup, affiliates/signup, and
 * cron/streak-reminder. Consolidated 2026-04-26.
 */
export function escapeHtml(str: string): string {
  return str.replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] ?? c),
  );
}
