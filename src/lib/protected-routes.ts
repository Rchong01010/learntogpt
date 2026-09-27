/**
 * Pure path-protection logic for src/proxy.ts, split out so it can be tested
 * without the Next/next-intl runtime (npx tsx src/lib/protected-routes.test.ts).
 *
 * SECURITY (pentest 2026-09-27): the proxy matched the RAW request pathname,
 * but Next decodes percent-escapes before routing. `/%64ashboard` therefore
 * failed the "/dashboard" prefix match (proxy: public) yet rendered the
 * dashboard page (router: decoded). We now decode until stable (max 3 passes,
 * so double-encoding like `/%2564ashboard` can't slip through either) and
 * FAIL CLOSED — treat the path as protected — on malformed escapes or if it
 * is still changing after the last pass.
 */

// Protected routes matched AFTER stripping any locale prefix.
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/courses",
  "/profile",
  "/leaderboard",
  "/settings",
  "/missions",
  "/api/progress",
  "/api/exercises",
  "/api/leaderboard",
  "/api/missions",
  "/api/account",
  "/api/portal",
];

// Public carve-outs: routes that match a PROTECTED_ROUTES prefix but are
// intentionally accessible without auth. Used for lead-magnet courses whose
// lessons act as the top-of-funnel for Learn to GPT. Lesson-level `is_free`
// on the course/lesson rows is still the authoritative paywall inside the
// page render; this just lets guests through the proxy gate.
export const PUBLIC_ROUTE_PREFIXES = [
  "/courses/whats-new-in-claude",
  "/courses/why-chatgpt",
  "/courses/three-levels",
  "/courses/strategic-prompting",
  "/courses/essentials",
  "/courses/practitioner-setup",
];

const MAX_DECODE_PASSES = 3;

/**
 * Percent-decode until the value stops changing. Returns null (caller must
 * fail closed) on a malformed escape or if still changing after the cap.
 */
export function decodePathStable(pathname: string): string | null {
  let current = pathname;
  for (let i = 0; i < MAX_DECODE_PASSES; i++) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (next === current) return current;
    current = next;
  }
  // Still changing after the cap → one more decode would differ → reject.
  try {
    return decodeURIComponent(current) === current ? current : null;
  } catch {
    return null;
  }
}

/**
 * Match the first path segment to a known locale case-insensitively. Locales
 * like "zh-CN" must still match "/zh-cn/..." or "/ZH-CN/..." — otherwise the
 * locale-stripped protection check can be bypassed with a case variant.
 */
export function matchLocale<L extends string>(
  segment: string | undefined,
  locales: readonly L[],
): L | null {
  if (!segment) return null;
  const lower = segment.toLowerCase();
  return locales.find((l) => l.toLowerCase() === lower) ?? null;
}

export function stripLocale(pathname: string, locales: readonly string[]): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (matchLocale(segments[0], locales)) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

export function isProtectedRoute(pathname: string, locales: readonly string[]): boolean {
  // Encoded "/" or "\" can smuggle segment boundaries past the prefix match;
  // no legitimate route uses them, so fail closed.
  if (/%(25)*(2f|5c)/i.test(pathname)) return true;
  const decoded = decodePathStable(pathname);
  if (decoded === null) return true; // fail closed
  // Collapse duplicate slashes and resolve dot segments, then match
  // case-insensitively: "//dashboard", "/x/../dashboard" and "/Dashboard"
  // must not be treated differently from "/dashboard".
  let normalized: string;
  try {
    normalized = new URL(decoded.replace(/\/{2,}/g, "/"), "http://proxy.invalid").pathname;
  } catch {
    return true;
  }
  const stripped = stripLocale(normalized, locales).toLowerCase();
  const publicCarveOut = PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
  if (publicCarveOut) return false;
  return PROTECTED_ROUTES.some(
    (route) => stripped === route || stripped.startsWith(`${route}/`),
  );
}
