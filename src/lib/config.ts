/**
 * Platform constant — shared by auth, checkout, and webhook handlers.
 * Both claude-academy.com and learntogpt.com share one Supabase instance (legacy note);
 * this constant scopes all per-platform queries and DB rows to this product.
 */
export const PLATFORM = 'learntogpt' as const;
