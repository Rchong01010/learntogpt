/**
 * Post-auth redirect validation, shared by the server auth callback and the
 * client pages that navigate to a `next=` / `redirect=` query param
 * (/auth-success, /sign-in). Pure — safe to import from client components.
 *
 * WHY a single helper: the previous checks were `startsWith("/") &&
 * !startsWith("//") && no scheme`. That passes "/\evil.example" and
 * "/<TAB>/evil.example", which the WHATWG URL parser (and therefore
 * router.push / location) resolves to https://evil.example/ — an open
 * redirect on our origin. We now reject backslashes and control characters
 * outright AND confirm the resolved URL stays on a fixed dummy origin.
 */

/** Allowed post-auth redirect destinations (prefix match for nested routes). */
export const REDIRECT_ALLOWLIST = [
  "/dashboard",
  "/settings",
  "/courses",
  "/profile",
  "/leaderboard",
  "/missions",
  "/api/checkout",
  "/auth-success",
  "/onboarding",
] as const;

const PROBE_ORIGIN = "https://redirect-check.invalid";

/**
 * Returns `path` when it is a same-origin, relative, allowlisted path, and
 * `fallback` otherwise.
 */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback: string,
): string {
  if (typeof path !== "string" || path.length === 0 || path.length > 2048) {
    return fallback;
  }
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  // Backslashes are treated as "/" by the URL parser for http(s) URLs, and
  // tabs/newlines are stripped — both turn "/x" into "//host".
  if (/[\\\u0000-\u001F\u007F]/.test(path)) return fallback;

  let resolved: URL;
  try {
    resolved = new URL(path, PROBE_ORIGIN);
  } catch {
    return fallback;
  }
  if (resolved.origin !== PROBE_ORIGIN) return fallback;

  const pathname = resolved.pathname;
  const allowed = REDIRECT_ALLOWLIST.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!allowed) return fallback;

  return path;
}
