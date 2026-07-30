/**
 * Platform scoping for the shared Supabase project (M-D2, audit #21).
 *
 * learntogpt and claude-academy are two separate Vercel deployments that share
 * ONE Supabase project (mazngjrfjvjxsufjrscv), ONE `user_profiles` table, and
 * ONE `welcome_email_log` dedup table — on overlapping cron schedules.
 *
 * Any cron here that selects or updates `user_profiles` without filtering on
 * `source` will read, email, and in the case of streak-reminder WRITE TO rows
 * belonging to Claude Academy users. Measured 2026-07-29: 100% of the 2,762
 * rows in `user_profiles` carry source='claude-academy'. An unscoped query in
 * this app therefore targets exclusively other-brand users.
 *
 * Always filter: .eq("source", PLATFORM_SOURCE)
 *
 * Note the `.trim()`: as of 2026-07-29 the production value of
 * NEXT_PUBLIC_PLATFORM in the learntogpt Vercel project carries a trailing
 * newline ("learntogpt\n"). Comparing that raw against `source` matches nothing,
 * which would look like a working, silent cron forever. Normalize before use.
 */
export const PLATFORM_SOURCE = process.env.NEXT_PUBLIC_PLATFORM?.trim() || undefined;

/**
 * Fail closed. Returns an error Response when the platform discriminator is
 * missing, so a misconfigured deploy aborts instead of silently falling back to
 * an unscoped query against the shared table — the unscoped query is the bug.
 */
export function assertPlatformScope(cronName: string): Response | null {
  if (!PLATFORM_SOURCE) {
    console.error(
      `[${cronName}] NEXT_PUBLIC_PLATFORM is not set; refusing to run an ` +
        "unscoped query against the shared user_profiles table",
    );
    return Response.json({ error: "Not configured" }, { status: 500 });
  }
  return null;
}
