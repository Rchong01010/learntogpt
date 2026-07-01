/**
 * Privacy-preserving display name for the PUBLIC leaderboard.
 *
 * The leaderboard is visible to every logged-in user, so it must never expose a
 * member's full real name. display_name can be a handle, an email, or a real
 * name pulled from OAuth (~a few % of users). This normalizes all three to an
 * alias-safe form:
 *   - email   "javier@gmail.com"   → "jav***"
 *   - real name "Дмитрий Морозов"  → "Дмитрий М."   (first name + last initial)
 *   - handle   "promptpro"          → "promptpro"    (already an alias)
 *
 * It NEVER returns a full multi-word real name. Apply on every leaderboard read
 * path (page + API) before the value leaves the server.
 */
export function maskDisplayName(name: string): string {
  const n = (name || "").trim();
  if (!n) return "";

  // Email → local-part prefix
  if (n.includes("@")) {
    const local = n.split("@")[0];
    return (local.length <= 2 ? local[0] : local.slice(0, 3)) + "***";
  }

  // Multi-word (likely a real name) → first name + last initial
  const parts = n.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0];
    // [...str][0] takes the first code point so non-Latin initials survive.
    const lastInitial = [...parts[parts.length - 1]][0] ?? "";
    return `${first} ${lastInitial}.`;
  }

  // Single-token handle → already an alias, leave as-is
  return n;
}
