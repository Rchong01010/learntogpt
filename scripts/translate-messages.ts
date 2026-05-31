/**
 * Translate the UI message catalog from English to target locales via the
 * Gemini API. Writes one file per locale: messages/<locale>.json.
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/translate-messages.ts
 *   GEMINI_API_KEY=... npx tsx scripts/translate-messages.ts ja es  # subset
 *
 * Reads: messages/en.json
 * Writes: messages/<locale>.json for each target locale
 *
 * NOTE: This was originally written against the Anthropic SDK but was pivoted
 * to Gemini 2.5 Pro on 2026-04-11 because Reid's Anthropic credits ran out
 * mid-weekend. Re-running with Claude is a straightforward swap — keep the
 * Anthropic version in git history if/when credits are topped up.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY env var");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gemini 2.5 Flash — switched from Pro on 2026-04-11 because Pro was
// returning 503 Service Unavailable mid-run. Flash has better availability +
// higher rate limits and the quality drop for UI string translation is
// small.
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    // Large enough to return the whole catalog in one response.
    maxOutputTokens: 32000,
    temperature: 0.3, // low but not 0 — keeps phrasing natural
    responseMimeType: "application/json",
  },
});

// Simple retry wrapper for transient 5xx errors.
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 3
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number }).status;
      const retryable = status === 503 || status === 429 || status === 500;
      if (!retryable || attempt === maxAttempts) throw err;
      const delayMs = attempt * 10_000; // 10s, 20s
      console.log(`    ${label} ${status} on attempt ${attempt}; retrying in ${delayMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

const SOURCE = path.join(process.cwd(), "messages", "en.json");

const ALL_TARGETS = ["ja", "ko", "zh-CN", "de", "fr", "es"] as const;
type Target = (typeof ALL_TARGETS)[number];

const LOCALE_LABELS: Record<Target, string> = {
  ja: "Japanese (日本語) — natural, conversational, polite but not overly formal (です/ます-level)",
  ko: "Korean (한국어) — natural, conversational, professional (합니다-level)",
  "zh-CN":
    "Simplified Chinese (简体中文) — natural, conversational, modern mainland usage",
  de: "German (Deutsch) — natural, conversational, use informal 'du' for this consumer-learning context",
  fr: "French (français) — natural, conversational, use informal 'tu' for this consumer-learning context",
  es: "Spanish (español) — natural, conversational, use informal 'tú' for this consumer-learning context, Latin-America-neutral",
};

const SYSTEM = `You are a professional software localization translator. You translate JSON message catalogs for a modern SaaS learning product (Claude Academy — a gamified learning platform for Anthropic's Claude AI).

Rules:
- Preserve ALL keys EXACTLY. Only translate string values.
- Preserve ICU placeholders exactly like {name}, {count}, {price}, {current}, {total}.
- Preserve XML/HTML tags exactly like <strong>, <em>, <link>, <br/>.
- Keep these product names in Latin script and DO NOT translate them:
  - "Claude"
  - "Claude Academy"
  - "Anthropic"
  - "Architect" (when it refers to the certification name)
- Keep price tokens like "$19.99" exactly as written.
- Match the tone of the English source: friendly, competent, modern, slightly playful, not stiff.
- For languages with formality registers (ja/ko/de/fr/es), use the formality level specified in the locale instructions.
- Return ONLY the translated JSON. No markdown fences. No commentary. No preamble. Just valid JSON that parses.`;

// Target locales from CLI args, or all if none specified.
const cliTargets = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const targets: Target[] =
  cliTargets.length > 0
    ? (cliTargets.filter((t) =>
        ALL_TARGETS.includes(t as Target)
      ) as Target[])
    : [...ALL_TARGETS];

async function translate(targetLocale: Target): Promise<void> {
  const source = await fs.readFile(SOURCE, "utf8");
  JSON.parse(source); // validate source parses

  console.log(`→ translating to ${targetLocale}...`);
  const started = Date.now();

  const prompt = `${SYSTEM}\n\nTarget locale: ${LOCALE_LABELS[targetLocale]}\n\nSource JSON (English):\n${source}`;

  const result = await withRetry(
    () =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    `messages/${targetLocale}`
  );

  let text = result.response.text().trim();

  // Strip accidental markdown fences if Gemini slips up
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `${targetLocale}: returned JSON did not parse — ${(err as Error).message}\n\nFirst 500 chars:\n${text.slice(0, 500)}`
    );
  }

  // Namespace parity check
  const sourceKeys = new Set(Object.keys(JSON.parse(source)));
  const targetKeys = new Set(Object.keys(parsed as object));
  const missing = [...sourceKeys].filter((k) => !targetKeys.has(k));
  const extra = [...targetKeys].filter((k) => !sourceKeys.has(k));
  if (missing.length > 0 || extra.length > 0) {
    console.warn(
      `  ⚠ ${targetLocale}: namespace drift — missing:[${missing.join(",")}] extra:[${extra.join(",")}]`
    );
  }

  const outPath = path.join(
    process.cwd(),
    "messages",
    `${targetLocale}.json`
  );
  await fs.writeFile(outPath, JSON.stringify(parsed, null, 2) + "\n");
  const elapsed = Math.round((Date.now() - started) / 100) / 10;
  console.log(
    `  ✓ ${targetLocale} → messages/${targetLocale}.json (${elapsed}s)`
  );
}

async function main() {
  console.log(
    `Translating ${targets.length} locale(s): ${targets.join(", ")}\n`
  );
  const failures: string[] = [];
  for (const locale of targets) {
    try {
      await translate(locale);
    } catch (err) {
      console.error(`  ✗ ${locale}: ${(err as Error).message}`);
      failures.push(locale);
    }
  }
  console.log("\nDone.");
  if (failures.length > 0) {
    console.error(`Failed: ${failures.join(", ")}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
