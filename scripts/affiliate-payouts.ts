/**
 * Generate a monthly affiliate payout CSV.
 *
 * Per creator, computes:
 *   payout = SUM(active_attribution.mrr_cents) * rev_share_pct / 100
 *
 * "Active" = subscription_status IN ('active', 'trialing') at report time.
 * We also surface total paid cumulatively and churned-sub counts so Reid can
 * sanity-check before wiring money.
 *
 * Usage:
 *   npx tsx scripts/affiliate-payouts.ts [--month YYYY-MM] [--out path.csv]
 *
 * Flags:
 *   --month YYYY-MM   The payout period label (defaults to the current month).
 *                     Does NOT filter rows — payout is always computed off the
 *                     live active attributions. Label only. If you want to
 *                     restrict to signups in that month, pass --signup-month.
 *   --signup-month    Filter to subscriptions created in the given YYYY-MM.
 *   --out path.csv    Write CSV to this path. Default: stdout.
 *
 * Reid then manually pays each creator via Wise / PayPal / Stripe Connect.
 *
 * Requires env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

// ------------------------------------------------------------
// Env + args
// ------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env"
  );
  process.exit(1);
}

const args = process.argv.slice(2);

function flag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function currentMonth(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const monthLabel = flag("--month") ?? currentMonth();
const signupMonth = flag("--signup-month");
const outPath = flag("--out");

if (!/^\d{4}-\d{2}$/.test(monthLabel)) {
  console.error(`Invalid --month: ${monthLabel} (expected YYYY-MM)`);
  process.exit(1);
}

if (signupMonth && !/^\d{4}-\d{2}$/.test(signupMonth)) {
  console.error(`Invalid --signup-month: ${signupMonth} (expected YYYY-MM)`);
  process.exit(1);
}

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface CreatorRow {
  id: string;
  name: string;
  handle: string | null;
  email: string | null;
  channel: string | null;
  language: string | null;
  rev_share_pct: number;
  coupon_code: string;
}

interface AttributionRow {
  creator_id: string;
  mrr_cents: number;
  total_paid_cents: number;
  subscription_status: string;
  subscription_created_at: string;
  churned_at: string | null;
}

interface PayoutRow {
  creator_id: string;
  creator_name: string;
  handle: string;
  email: string;
  channel: string;
  language: string;
  coupon_code: string;
  rev_share_pct: number;
  active_subs: number;
  churned_subs: number;
  total_mrr_usd: string;
  payout_usd: string;
  lifetime_paid_usd: string;
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

  console.error(`\nAffiliate payout report — month label: ${monthLabel}`);
  if (signupMonth) console.error(`Signup-month filter: ${signupMonth}`);
  console.error("Pulling creators + attributions from Supabase...\n");

  const { data: creators, error: cErr } = await supabase
    .from("affiliate_creators")
    .select("id, name, handle, email, channel, language, rev_share_pct, coupon_code")
    .in("outreach_status", ["signed", "live", "pitched", "replied", "negotiating"]);

  if (cErr) {
    console.error("Failed to fetch creators:", cErr.message);
    process.exit(1);
  }

  const creatorRows = (creators ?? []) as CreatorRow[];
  if (creatorRows.length === 0) {
    console.error("No creators in active outreach states — nothing to report.");
    process.exit(0);
  }

  let attrQuery = supabase
    .from("affiliate_attributions")
    .select(
      "creator_id, mrr_cents, total_paid_cents, subscription_status, subscription_created_at, churned_at"
    );

  if (signupMonth) {
    const [y, m] = signupMonth.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 1)).toISOString();
    attrQuery = attrQuery.gte("subscription_created_at", start).lt("subscription_created_at", end);
  }

  const { data: attributions, error: aErr } = await attrQuery;
  if (aErr) {
    console.error("Failed to fetch attributions:", aErr.message);
    process.exit(1);
  }

  const attrRows = (attributions ?? []) as AttributionRow[];

  // Aggregate per creator
  const byCreator = new Map<string, PayoutRow>();

  for (const c of creatorRows) {
    byCreator.set(c.id, {
      creator_id: c.id,
      creator_name: c.name,
      handle: c.handle ?? "",
      email: c.email ?? "",
      channel: c.channel ?? "",
      language: c.language ?? "",
      coupon_code: c.coupon_code,
      rev_share_pct: c.rev_share_pct,
      active_subs: 0,
      churned_subs: 0,
      total_mrr_usd: "0.00",
      payout_usd: "0.00",
      lifetime_paid_usd: "0.00",
    });
  }

  const mrrCentsTotals = new Map<string, number>();
  const lifetimeCentsTotals = new Map<string, number>();

  for (const a of attrRows) {
    const row = byCreator.get(a.creator_id);
    if (!row) continue; // attribution for creator not in active outreach states — skip

    const isActive = a.subscription_status === "active" || a.subscription_status === "trialing";
    if (isActive) {
      row.active_subs += 1;
      mrrCentsTotals.set(
        a.creator_id,
        (mrrCentsTotals.get(a.creator_id) ?? 0) + (a.mrr_cents ?? 0)
      );
    } else if (a.subscription_status === "canceled" || a.subscription_status === "churned") {
      row.churned_subs += 1;
    }

    lifetimeCentsTotals.set(
      a.creator_id,
      (lifetimeCentsTotals.get(a.creator_id) ?? 0) + (a.total_paid_cents ?? 0)
    );
  }

  // Compute payout
  for (const row of byCreator.values()) {
    const mrrCents = mrrCentsTotals.get(row.creator_id) ?? 0;
    const lifetimeCents = lifetimeCentsTotals.get(row.creator_id) ?? 0;
    const payoutCents = Math.round((mrrCents * row.rev_share_pct) / 100);

    row.total_mrr_usd = (mrrCents / 100).toFixed(2);
    row.payout_usd = (payoutCents / 100).toFixed(2);
    row.lifetime_paid_usd = (lifetimeCents / 100).toFixed(2);
  }

  // Sort by payout desc, then name
  const sorted = Array.from(byCreator.values()).sort(
    (a, b) => parseFloat(b.payout_usd) - parseFloat(a.payout_usd) || a.creator_name.localeCompare(b.creator_name)
  );

  // CSV output
  const header = [
    "month",
    "creator_name",
    "handle",
    "email",
    "channel",
    "language",
    "coupon_code",
    "rev_share_pct",
    "active_subs",
    "churned_subs",
    "total_mrr_usd",
    "payout_usd",
    "lifetime_paid_usd",
  ];

  const lines = [header.join(",")];
  for (const r of sorted) {
    lines.push(
      [
        monthLabel,
        csvEscape(r.creator_name),
        csvEscape(r.handle),
        csvEscape(r.email),
        csvEscape(r.channel),
        csvEscape(r.language),
        csvEscape(r.coupon_code),
        String(r.rev_share_pct),
        String(r.active_subs),
        String(r.churned_subs),
        r.total_mrr_usd,
        r.payout_usd,
        r.lifetime_paid_usd,
      ].join(",")
    );
  }

  const csv = lines.join("\n") + "\n";

  if (outPath) {
    writeFileSync(outPath, csv, "utf-8");
    console.error(`Wrote ${sorted.length} rows to ${outPath}`);
  } else {
    // Print to stdout so you can pipe / redirect
    process.stdout.write(csv);
  }

  const totalPayout = sorted.reduce((sum, r) => sum + parseFloat(r.payout_usd), 0);
  console.error(`\nTotal payout this run: $${totalPayout.toFixed(2)} across ${sorted.length} creators`);
}

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
