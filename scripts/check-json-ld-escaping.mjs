#!/usr/bin/env node
/**
 * JSON-LD injection gate.
 *
 * Guards one specific pairing: a `dangerouslySetInnerHTML` whose `__html` is a
 * bare `JSON.stringify(...)`. JSON.stringify does NOT escape `<`, `>`, or `&`,
 * so any string value reaching it that contains `</script>` closes the
 * surrounding <script type="application/ld+json"> tag early and everything
 * after it parses as executable HTML — on an origin whose CSP still carries
 * `script-src 'unsafe-inline'` and which holds the Supabase session cookie.
 *
 * The live case (fixed 2026-07-28): src/app/[locale]/curriculum/page.tsx built
 * its ItemList schema from `courses.title` / `courses.description` read out of
 * Supabase and passed the result through bare JSON.stringify. This is a
 * second-order injection, not user-input XSS — there is no public write path to
 * those columns. They are written by ops/build scripts, and
 * scripts/translate-course.mjs pipes both fields through an LLM translator on
 * the i18n cron. src/lib/json-ld.ts already classified that data as untrusted
 * in its own docstring; the curriculum page just never called the helper.
 *
 * That mismatch is why this needs a gate rather than a comment. The safe
 * helper existed, was correct, and was documented — and the one code path that
 * actually read the database was the one that skipped it. A reviewer reading
 * either file alone sees nothing wrong.
 *
 * The check: flag any `__html:` assigned a bare `JSON.stringify(`. The fix is
 * always the same — call `safeJsonLd()` from `@/lib/json-ld` instead, which
 * escapes the three HTML-significant characters. `<` parses back to `<`
 * for JSON-LD consumers, so the swap is behavior-preserving for Google.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

// Skip build output and nested agent worktrees, which carry their own copies of
// src/ and would otherwise report the same finding many times over.
const SKIP_DIRS = new Set([".next", "node_modules", ".claude", "dist", "build"]);

/** Recursively collect .tsx/.ts files under a directory. */
function collect(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collect(full));
    } else if (/\.tsx?$/.test(full)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Matches `__html: JSON.stringify(` allowing arbitrary whitespace/newlines
 * between the tokens, so reformatting by Prettier cannot slip past the gate.
 */
const BARE_STRINGIFY = /__html\s*:\s*JSON\s*\.\s*stringify\s*\(/g;

function main() {
  const files = collect(SRC);
  const problems = [];

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    BARE_STRINGIFY.lastIndex = 0;
    let match;
    while ((match = BARE_STRINGIFY.exec(src)) !== null) {
      const line = src.slice(0, match.index).split("\n").length;
      problems.push(`${relative(ROOT, file)}:${line}`);
    }
  }

  if (problems.length > 0) {
    console.error("check-json-ld-escaping: FAILED\n");
    console.error(
      `  ${problems.length} unescaped JSON-LD injection point(s):\n`
    );
    for (const p of problems) console.error(`  • ${p}`);
    console.error(
      "\nJSON.stringify does not escape < > &, so a value containing " +
        "</script> breaks out of the\nsurrounding script tag. Use " +
        "safeJsonLd() from '@/lib/json-ld' instead:\n\n" +
        "    import { safeJsonLd } from '@/lib/json-ld';\n" +
        "    ...\n" +
        "    dangerouslySetInnerHTML={{ __html: safeJsonLd({ ... }) }}\n"
    );
    process.exit(1);
  }

  console.log(
    `check-json-ld-escaping: OK — scanned ${files.length} files, ` +
      "no bare JSON.stringify in dangerouslySetInnerHTML."
  );
  process.exit(0);
}

main();
