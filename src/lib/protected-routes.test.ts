/**
 * Tests for the proxy path-protection check (src/lib/protected-routes.ts).
 *
 *   npx tsx src/lib/protected-routes.test.ts
 *
 * REGRESSION UNDER TEST (pentest 2026-09-27): the proxy matched the raw
 * pathname while Next routes the percent-decoded one, so `/%64ashboard` and
 * `/%6Ceaderboard` skipped the auth redirect.
 */

import { isProtectedRoute, decodePathStable } from "./protected-routes";

const LOCALES = ["en", "ja", "ko", "zh-CN", "de", "fr", "es", "pt-BR"] as const;
let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  if (actual !== expected) {
    failures++;
    console.error(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}
const prot = (p: string) => isProtectedRoute(p, LOCALES);

// Precondition: the encoded forms really do decode to the protected route.
check("precondition: /%64ashboard decodes to /dashboard", decodeURIComponent("/%64ashboard"), "/dashboard");

// Plain behaviour unchanged
check("/dashboard protected", prot("/dashboard"), true);
check("/ja/dashboard protected", prot("/ja/dashboard"), true);
check("/ZH-CN/settings protected", prot("/ZH-CN/settings"), true);
check("/api/progress protected", prot("/api/progress"), true);
check("/ public", prot("/"), false);
check("/pricing public", prot("/pricing"), false);
check("carve-out lesson public", prot("/courses/why-chatgpt/intro"), false);
check("carve-out localized public", prot("/ja/courses/essentials"), false);
check("non-carve-out course protected", prot("/courses/some-paid-course"), true);

// Encoded bypasses
check("/%6Ceaderboard protected", prot("/%6Ceaderboard"), true);
check("/%64ashboard protected", prot("/%64ashboard"), true);
check("/%2564ashboard (double) protected", prot("/%2564ashboard"), true);
check("/%252564ashboard (triple) protected", prot("/%252564ashboard"), true);
check("/ja/%64ashboard protected", prot("/ja/%64ashboard"), true);
check("/%6Aa/dashboard (encoded locale) protected", prot("/%6Aa/dashboard"), true);
check("/api/%70rogress protected", prot("/api/%70rogress"), true);
check("//dashboard protected", prot("//dashboard"), true);
check("/Dashboard protected", prot("/Dashboard"), true);
check("dot-segment out of carve-out", prot("/courses/why-chatgpt/%2e%2e/%2e%2e/dashboard"), true);
check("encoded slash fails closed", prot("/courses%2Fpaid"), true);
check("malformed escape fails closed", prot("/%E0%A4%A"), true);
check("decodePathStable malformed -> null", decodePathStable("/%zz"), null);
check("deeply nested encoding fails closed", decodePathStable("/%2525252564"), null);

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nall protected-routes tests passed");
