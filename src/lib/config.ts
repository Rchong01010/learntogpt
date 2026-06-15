/**
 * Platform constant — shared by auth, checkout, and webhook handlers.
 * Both claude-academy.com and learntogpt.com share one Supabase instance (legacy note);
 * this constant scopes all per-platform queries and DB rows to this product.
 */
export const PLATFORM = 'learntogpt' as const;

/**
 * Missions are NOT platform-scoped in the DB (the `missions` table has no
 * `platform` column) and the seeded missions are Claude-branded (why-claude,
 * meet-claude, etc.). LearnToGPT must not surface them, so missions are
 * disabled on this platform until GPT-specific missions exist + the table is
 * platform-scoped. Reversible: flip to true to restore the missions surface.
 */
export const MISSIONS_ENABLED = false;
