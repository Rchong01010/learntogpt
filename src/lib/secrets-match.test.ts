/**
 * Tests for secretsMatch (src/lib/auth.ts) — the shared constant-time secret
 * comparison used by cron auth and the signup webhook.
 *
 * No jest/vitest in this repo, so this is a self-contained tsx-runnable test:
 *   npx tsx src/lib/secrets-match.test.ts
 *
 * No network, no DB, no env required. Everything under test is pure.
 *
 * REGRESSION UNDER TEST (audit MEDIUM, webhook-signup-timingsafeequal-byte-length):
 * the signup webhook previously guarded a BYTE-length timingSafeEqual with a
 * CHARACTER-length check. `String.length` counts UTF-16 code units, so a
 * header with the right character count but any multi-byte character passed
 * the guard and then threw inside timingSafeEqual — an unhandled 500 where a
 * clean 401 was intended. The multibyte cases below fail loudly (throw) against
 * the old implementation and return false against the current one.
 */

import { secretsMatch, verifyCronAuth } from "./auth";

let failures = 0;

function check(name: string, cond: boolean) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    console.error(`  FAIL ${name}`);
    failures++;
  }
}

/** Asserts the call returns the expected boolean AND does not throw. */
function expect(name: string, fn: () => boolean, want: boolean) {
  let got: boolean;
  try {
    got = fn();
  } catch (err) {
    console.error(
      `  FAIL ${name} — threw instead of returning ${want}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    failures++;
    return;
  }
  check(`${name} => ${want}`, got === want);
}

const SECRET = "correct-horse-battery-staple";

console.log("secretsMatch: correctness");
expect("identical secrets match", () => secretsMatch(SECRET, SECRET), true);
expect("different secrets do not match", () => secretsMatch("wrong", SECRET), false);
expect(
  "same length, one char differs",
  () => secretsMatch("Correct-horse-battery-staple", SECRET),
  false,
);
expect(
  "same length, last char differs",
  () => secretsMatch("correct-horse-battery-staplX", SECRET),
  false,
);
expect("prefix of the secret does not match", () => secretsMatch(SECRET.slice(0, 10), SECRET), false);
expect("secret plus suffix does not match", () => secretsMatch(SECRET + "x", SECRET), false);

console.log("\nsecretsMatch: empty / missing inputs are never a match");
expect("empty provided", () => secretsMatch("", SECRET), false);
expect("empty expected", () => secretsMatch(SECRET, ""), false);
expect("both empty", () => secretsMatch("", ""), false);

console.log("\nsecretsMatch: multi-byte input returns false, never throws (the regression)");
// Each of these has the SAME String.length as an 8-char ASCII secret but a
// LARGER UTF-8 byte length, which is exactly the case that threw before.
const ASCII8 = "abcdefgh";
for (const attacker of [
  "abcdefgé", // 8 chars / 9 bytes — Latin-1 supplement
  "abcdefgñ", // 8 chars / 9 bytes
  "abcdefg中", // 8 chars / 10 bytes — CJK
  "abcdefgé".normalize("NFD"), // combining mark, 9 chars / 10 bytes
  "\u{1f600}bcdefg", // astral plane emoji (surrogate pair)
]) {
  expect(
    `multibyte ${JSON.stringify(attacker)} vs ascii secret`,
    () => secretsMatch(attacker, ASCII8),
    false,
  );
}
// And the symmetric direction: a multi-byte configured secret.
expect(
  "multibyte configured secret vs ascii header",
  () => secretsMatch(ASCII8, "abcdefgé"),
  false,
);
expect(
  "multibyte secret matches itself",
  () => secretsMatch("pässwörd-中文", "pässwörd-中文"),
  true,
);

console.log("\nverifyCronAuth: still behaves (built on secretsMatch)");
expect("valid bearer", () => verifyCronAuth(`Bearer ${SECRET}`, SECRET), true);
expect("wrong secret", () => verifyCronAuth("Bearer nope", SECRET), false);
expect("missing Bearer prefix", () => verifyCronAuth(SECRET, SECRET), false);
expect("null header", () => verifyCronAuth(null, SECRET), false);
expect("empty configured secret", () => verifyCronAuth(`Bearer ${SECRET}`, ""), false);
expect(
  "multibyte header does not throw",
  () => verifyCronAuth("Bearer abcdefgé", `abcdefgh`),
  false,
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll checks passed.");
