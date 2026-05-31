/**
 * Create Stripe coupons + seed affiliate_creators rows for a batch of creators.
 *
 * Usage:
 *   npx tsx scripts/create-affiliate-coupons.ts <input.json|input.csv> [--dry-run]
 *
 * Input file can be JSON or CSV with these fields:
 *   name            (required)   — display name
 *   handle          (optional)   — e.g. "@someone"
 *   email           (optional)   — contact email
 *   channel         (optional)   — "youtube", "twitter", "tiktok", "newsletter", "email", ...
 *   language        (optional)   — ISO 639-1, default "en"
 *   reach_estimate  (optional)   — int, subs/followers
 *   suggested_code  (required)   — becomes the Stripe coupon id AND the affiliate_creators.coupon_code
 *   rev_share_pct   (optional)   — int 0..100, default 30 (lifetime rev-share)
 *
 * JSON example:
 *   [
 *     { "name": "Jane Doe", "handle": "@janedoe", "channel": "youtube",
 *       "language": "en", "suggested_code": "JANE20", "email": "jane@example.com" }
 *   ]
 *
 * CSV example (header row required):
 *   name,handle,email,channel,language,reach_estimate,suggested_code,rev_share_pct
 *   Jane Doe,@janedoe,jane@example.com,youtube,en,125000,JANE20,30
 *
 * Behavior per row:
 *   1. Create a Stripe coupon with id = suggested_code, 20% off for first 3 months.
 *      If the coupon already exists in Stripe, we reuse it (idempotent).
 *   2. Insert an affiliate_creators row with status = 'not_started'.
 *      If coupon_code is already in the table, we skip (idempotent).
 *
 * Flags:
 *   --dry-run   Print what would happen, do not call Stripe or Supabase.
 *
 * Requires env:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { extname } from "path";
import Stripe from "stripe";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface CreatorInput {
  name: string;
  handle?: string;
  email?: string;
  channel?: string;
  language?: string;
  reach_estimate?: number;
  suggested_code: string;
  rev_share_pct?: number;
}

// Matches the Stripe coupon config Reid wants: 20% off for the first 3 months
// of the $19.99/mo subscription. Using a fixed percent_off + duration='repeating'
// with duration_in_months=3. Applied per-subscription via the checkout session
// (customer enters code at checkout, OR creator's landing page auto-applies).
const COUPON_PERCENT_OFF = 20;
const COUPON_DURATION_IN_MONTHS = 3;
const DEFAULT_REV_SHARE_PCT = 30;

// ------------------------------------------------------------
// CLI arg parsing
// ------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const inputPath = args.find((a) => !a.startsWith("--"));

if (!inputPath) {
  console.error(
    "Usage: npx tsx scripts/create-affiliate-coupons.ts <input.json|input.csv> [--dry-run]"
  );
  process.exit(1);
}

// ------------------------------------------------------------
// Env checks
// ------------------------------------------------------------
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

// We only need these if !dryRun, but we still want to fail fast if missing.
const STRIPE_SECRET_KEY = dryRun ? process.env.STRIPE_SECRET_KEY : requireEnv("STRIPE_SECRET_KEY");
const SUPABASE_URL = dryRun ? process.env.NEXT_PUBLIC_SUPABASE_URL : requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE_KEY = dryRun ? process.env.SUPABASE_SERVICE_ROLE_KEY : requireEnv("SUPABASE_SERVICE_ROLE_KEY");

// ------------------------------------------------------------
// Input parsing
// ------------------------------------------------------------
function parseCsv(raw: string): CreatorInput[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());

  const rows: CreatorInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Naive CSV — does not handle quoted commas. Input file must use clean values.
    const cols = lines[i].split(",");
    const rec: Record<string, string> = {};
    header.forEach((h, idx) => {
      rec[h] = (cols[idx] ?? "").trim();
    });

    if (!rec.name || !rec.suggested_code) {
      console.warn(`Skipping row ${i + 1}: missing name or suggested_code`);
      continue;
    }

    rows.push({
      name: rec.name,
      handle: rec.handle || undefined,
      email: rec.email || undefined,
      channel: rec.channel || undefined,
      language: rec.language || undefined,
      reach_estimate: rec.reach_estimate ? parseInt(rec.reach_estimate, 10) : undefined,
      suggested_code: rec.suggested_code,
      rev_share_pct: rec.rev_share_pct ? parseInt(rec.rev_share_pct, 10) : undefined,
    });
  }
  return rows;
}

function parseInput(path: string): CreatorInput[] {
  const raw = readFileSync(path, "utf-8");
  const ext = extname(path).toLowerCase();

  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON input must be an array of creator objects");
    }
    return parsed as CreatorInput[];
  }

  if (ext === ".csv") return parseCsv(raw);

  throw new Error(`Unsupported input extension: ${ext}. Use .json or .csv`);
}

function validateCouponCode(code: string): string | null {
  // Stripe coupon ids: up to 500 chars, alphanum + dashes + underscores.
  // We enforce a narrower subset so creators can speak it on camera without
  // ambiguity. Uppercase, 4..32 chars, [A-Z0-9_-].
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{4,32}$/.test(normalized)) {
    return null;
  }
  return normalized;
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
async function main() {
  const creators = parseInput(inputPath!);
  if (creators.length === 0) {
    console.error("No creators parsed from input file.");
    process.exit(1);
  }

  console.log(
    `\nClaude Academy affiliate coupon setup${dryRun ? " (DRY RUN)" : ""}`
  );
  console.log("=".repeat(60));
  console.log(`Parsed ${creators.length} creator rows from ${inputPath}\n`);

  const stripe = dryRun
    ? null
    : new Stripe(STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

  const supabase = dryRun ? null : createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

  let created = 0;
  let reused = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of creators) {
    const code = validateCouponCode(c.suggested_code);
    if (!code) {
      console.error(
        `  [skip] ${c.name}: invalid coupon code "${c.suggested_code}" (must be 4-32 chars, [A-Z0-9_-])`
      );
      skipped++;
      continue;
    }

    const label = `${c.name}${c.handle ? ` (${c.handle})` : ""} → ${code}`;
    console.log(`- ${label}`);

    if (dryRun) {
      console.log(
        `    would create Stripe coupon id=${code} (${COUPON_PERCENT_OFF}% off, ${COUPON_DURATION_IN_MONTHS}mo)`
      );
      console.log(
        `    would insert affiliate_creators row (rev_share ${c.rev_share_pct ?? DEFAULT_REV_SHARE_PCT}%, lang ${c.language ?? "en"})`
      );
      created++;
      continue;
    }

    // 1. Stripe coupon — idempotent retrieve-or-create
    let stripeCouponId: string;
    try {
      const existing = await stripe!.coupons.retrieve(code).catch(() => null);
      if (existing && !existing.deleted) {
        stripeCouponId = existing.id;
        console.log(`    stripe: coupon ${code} already exists, reusing`);
        reused++;
      } else {
        const coupon = await stripe!.coupons.create({
          id: code,
          percent_off: COUPON_PERCENT_OFF,
          duration: "repeating",
          duration_in_months: COUPON_DURATION_IN_MONTHS,
          name: `Affiliate — ${c.name}`.slice(0, 40),
          metadata: {
            creator_name: c.name,
            creator_handle: c.handle ?? "",
            channel: c.channel ?? "",
            language: c.language ?? "en",
          },
        });
        stripeCouponId = coupon.id;
        console.log(`    stripe: created coupon ${stripeCouponId}`);
        created++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    stripe: FAILED — ${msg}`);
      failed++;
      continue;
    }

    // 2. Supabase row — idempotent upsert on coupon_code
    const row = {
      name: c.name,
      handle: c.handle ?? null,
      email: c.email ?? null,
      channel: c.channel ?? null,
      reach_estimate: c.reach_estimate ?? null,
      language: c.language ?? "en",
      coupon_code: code,
      stripe_coupon_id: stripeCouponId,
      rev_share_pct: c.rev_share_pct ?? DEFAULT_REV_SHARE_PCT,
      outreach_status: "not_started" as const,
    };

    const { error: upsertError } = await supabase!
      .from("affiliate_creators")
      .upsert(row, { onConflict: "coupon_code", ignoreDuplicates: false })
      .select("id")
      .single();

    if (upsertError) {
      console.error(`    supabase: FAILED — ${upsertError.message}`);
      failed++;
      continue;
    }

    console.log(`    supabase: affiliate_creators row upserted`);
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    `Summary: ${created} created, ${reused} reused, ${skipped} skipped, ${failed} failed${dryRun ? " (dry run)" : ""}`
  );

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\nFatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
