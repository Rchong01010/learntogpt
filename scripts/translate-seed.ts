/**
 * Translate a course seed JSON file from English to a target locale via the
 * Gemini API. Preserves all structural keys and only translates prose fields.
 *
 * Usage:
 *   GEMINI_API_KEY=... npx tsx scripts/translate-seed.ts <track-base> <locale>
 *
 * Example:
 *   npx tsx scripts/translate-seed.ts track1-why-claude ja
 *
 * Reads: content/seed/<track-base>.json
 * Writes: content/seed/<track-base>.<locale>.json
 *
 * Slugs are NEVER translated — URLs stay stable across locales.
 * HTML inside content.sections[].content is preserved (tags stay, text translates).
 *
 * NOTE: Pivoted from Anthropic SDK to Gemini on 2026-04-11 because of
 * Anthropic credit exhaustion. Quality is lower than Claude Opus would
 * produce but acceptable for weekend MVP.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY env var");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gemini 2.5 Flash — switched from 2.5 Pro mid-run on 2026-04-11 because the
// Pro endpoint kept returning 503 Service Unavailable. Flash has better
// availability + higher rate limits + faster response, and the quality drop
// for translation work is small. Switch back to Pro for re-runs once the
// outage clears.
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    maxOutputTokens: 65000, // seed files can be very large after translation
    temperature: 0.3,
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

const LOCALE_LABELS: Record<string, string> = {
  ja: "Japanese (日本語) — natural, conversational, polite but not overly formal (です/ます-level)",
  ko: "Korean (한국어) — natural, conversational, professional (합니다-level)",
  "zh-CN":
    "Simplified Chinese (简体中文) — natural, conversational, modern mainland usage",
  de: "German (Deutsch) — natural, conversational, informal 'du' for consumer learning",
  fr: "French (français) — natural, conversational, informal 'tu' for consumer learning",
  es: "Spanish (español) — natural, conversational, informal 'tú', Latin-America-neutral",
};

const SYSTEM = `You are a professional software localization translator. You translate course content JSON for Claude Academy — a gamified learning platform for Anthropic's Claude AI.

The JSON describes a track containing courses, each with lessons, each with exercises. You must:

TRANSLATE these fields:
- track-level: description (if present)
- course.title
- course.description
- lesson.title
- lesson.description
- lesson.content — this is a rich content object with a "sections" array. Each section has a "type" (preserve) and "content" (which may contain HTML string or markdown; translate the text inside, preserve tags exactly)
- exercise.prompt
- exercise.question (if present)
- exercise.explanation
- exercise.options — if it's an array of strings, translate each string; if objects with a "text" field, translate "text" only
- exercise.hints — translate each string in the array
- Any other prose fields

PRESERVE EXACTLY (never translate):
- All JSON keys (title, slug, description, prompt, etc.)
- Every "slug" value at every level — slugs are URL paths and must be byte-for-byte stable
- track field value (it's an enum like "why_claude", "three_levels")
- exercise.type values (multiple_choice, fill_blank, code_exercise, etc.)
- exercise.correct_answer values — letters like "A"/"B", numeric indexes, or code strings
- exercise.order_index, xp_reward, estimated_minutes, lesson_count, and all numeric fields
- course.difficulty, course.icon, course.is_free
- HTML/XML tags inside content fields (<p>, <strong>, <em>, <code>, <ul>, <li>, <h2>, <h3>, etc.)
- Code blocks inside <pre> or <code> — preserve literal code
- URLs and link targets inside href attributes
- Placeholders like {variable}, {{variable}}
- "Claude", "Claude Academy", "Anthropic", "Architect" (brand/product/cert names in Latin script)
- Exact price tokens like "$19.99"

CRITICAL for exercises:
- For code_exercise and fill_blank types, translate the explanation but KEEP code keywords and variable names untouched
- For multiple_choice, translate the option TEXT but never change correct_answer letter/value

Tone: encouraging, clear, slightly playful. Match the English source register.

Return ONLY valid JSON. No markdown fences. No commentary. The returned JSON MUST parse and MUST have the same structural shape as the source.`;

async function translate(trackBase: string, locale: string): Promise<void> {
  if (!LOCALE_LABELS[locale]) {
    throw new Error(
      `Unknown locale: ${locale}. Known: ${Object.keys(LOCALE_LABELS).join(", ")}`
    );
  }

  const sourcePath = path.join(
    process.cwd(),
    "content",
    "seed",
    `${trackBase}.json`
  );
  const source = await fs.readFile(sourcePath, "utf8");
  JSON.parse(source); // validate source parses

  console.log(`→ ${trackBase} → ${locale}...`);
  const started = Date.now();

  const prompt = `${SYSTEM}\n\nTarget locale: ${LOCALE_LABELS[locale]}\n\nSource JSON:\n${source}`;

  const result = await withRetry(
    () =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    `${trackBase}/${locale}`
  );

  let text = result.response.text().trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `${trackBase}/${locale}: JSON parse error — ${(err as Error).message}\n\nLast 500 chars:\n${text.slice(-500)}`
    );
  }

  const outPath = path.join(
    process.cwd(),
    "content",
    "seed",
    `${trackBase}.${locale}.json`
  );
  await fs.writeFile(outPath, JSON.stringify(parsed, null, 2) + "\n");
  const elapsed = Math.round((Date.now() - started) / 100) / 10;
  console.log(`  ✓ ${trackBase}.${locale}.json (${elapsed}s)`);
}

async function main() {
  const [trackBase, locale] = process.argv.slice(2);
  if (!trackBase || !locale) {
    console.error(
      "Usage: npx tsx scripts/translate-seed.ts <track-base> <locale>"
    );
    console.error("Example: npx tsx scripts/translate-seed.ts track1-why-claude ja");
    process.exit(1);
  }
  await translate(trackBase, locale);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
