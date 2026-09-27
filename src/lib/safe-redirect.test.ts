/**
 * Tests for safeRedirectPath (src/lib/safe-redirect.ts).
 *
 * No jest/vitest in this repo, so this is a self-contained tsx-runnable test:
 *   npx tsx src/lib/safe-redirect.test.ts
 *
 * REGRESSION UNDER TEST (pentest 2026-09-27): /auth-success and /sign-in
 * accepted any value that started with "/" but not "//". "/\evil.example" and
 * "/<TAB>/evil.example" pass that check, yet the WHATWG URL parser (used by
 * router.push / location) resolves both to https://evil.example/.
 */

import { safeRedirectPath } from "./safe-redirect";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  if (actual !== expected) {
    failures++;
    console.error(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}

const FB = "/dashboard";

// Precondition: the bypass payloads really do escape the origin when resolved
// naively. If this ever stops being true the rejection tests below would pass
// vacuously, so assert it explicitly.
check(
  "precondition: backslash payload escapes origin",
  new URL("/\\evil.example", "https://learntogpt.com").origin,
  "https://evil.example",
);
check(
  "precondition: tab payload escapes origin",
  new URL("/\t/evil.example", "https://learntogpt.com").origin,
  "https://evil.example",
);

// Allowed
check("plain allowlisted", safeRedirectPath("/dashboard", FB), "/dashboard");
check("nested allowlisted", safeRedirectPath("/courses/why-chatgpt/intro", FB), "/courses/why-chatgpt/intro");
check("with query", safeRedirectPath("/api/checkout/unlock?x=1", FB), "/api/checkout/unlock?x=1");

// Rejected: open-redirect payloads
check("absolute https", safeRedirectPath("https://evil.example", FB), FB);
check("protocol-relative", safeRedirectPath("//evil.example", FB), FB);
check("backslash", safeRedirectPath("/\\evil.example", FB), FB);
check("backslash after allowlisted prefix", safeRedirectPath("/dashboard/..\\\\evil.example", FB), FB);
check("tab", safeRedirectPath("/\t/evil.example", FB), FB);
check("newline", safeRedirectPath("/\n/evil.example", FB), FB);
check("javascript scheme", safeRedirectPath("javascript:alert(1)", FB), FB);
check("dot-segment escape from allowlist", safeRedirectPath("/dashboard/../sign-out", FB), FB);

// Rejected: not on allowlist / empty
check("not allowlisted", safeRedirectPath("/pricing", FB), FB);
check("prefix lookalike", safeRedirectPath("/dashboardevil", FB), FB);
check("null", safeRedirectPath(null, FB), FB);
check("empty", safeRedirectPath("", FB), FB);

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nall safe-redirect tests passed");
