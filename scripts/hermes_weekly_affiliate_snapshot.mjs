#!/usr/bin/env node
/**
 * Hermes weekly affiliate snapshot — runs Mondays at 8am PT on the Hetzner VPS.
 *
 *   1. Snapshots affiliate_creators (counts, status breakdown, reach).
 *   2. Reads affiliate_attributions for active subs + weekly new attributions.
 *   3. Pulls top-5 lifetime-paid creator leaderboard.
 *   4. Diffs against the prior snapshot (week-over-week).
 *   5. Persists this week's row to affiliate_snapshots (table per migration 020).
 *   6. Posts a single tight summary line to the Slack #signups webhook.
 *
 * Idempotent: snapshot row is always written even if Slack post fails, so the
 * next run still has a baseline to diff against.
 *
 * Required env vars (set via Hermes .env, never via this file):
 *   ACADEMY_SUPABASE_URL
 *   ACADEMY_SUPABASE_SERVICE_ROLE_KEY
 *   ACADEMY_STRIPE_SECRET_KEY                    (optional; only used if attributions exist)
 *   ACADEMY_SLACK_SIGNUPS_WEBHOOK
 *
 * Runtime: Node 20+ (uses built-in fetch + top-level await).
 * Deps:    @supabase/supabase-js
 */

import { createClient } from "@supabase/supabase-js";

const REQUIRED = [
  "ACADEMY_SUPABASE_URL",
  "ACADEMY_SUPABASE_SERVICE_ROLE_KEY",
  "ACADEMY_SLACK_SIGNUPS_WEBHOOK",
];
for (const k of REQUIRED) {
  if (!process.env[k]) {
    console.error(`[snapshot] missing env: ${k}`);
    process.exit(1);
  }
}

const sb = createClient(
  process.env.ACADEMY_SUPABASE_URL,
  process.env.ACADEMY_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const STATUS_KEYS = [
  "not_started",
  "pitched",
  "replied",
  "negotiating",
  "signed",
  "live",
  "declined",
  "dormant",
];
const WARM = new Set(["replied", "negotiating", "signed", "live"]);

function fmtMillions(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtDollars(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function signed(n) {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : String(n);
}

// ---------- pull current state ----------

const { data: creators, error: creatorsErr } = await sb
  .from("affiliate_creators")
  .select("outreach_status, reach_estimate, coupon_code, name");
if (creatorsErr) throw creatorsErr;

const byStatus = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0]));
let totalReach = 0;
let warmReach = 0;
for (const c of creators) {
  const s = c.outreach_status;
  if (s in byStatus) byStatus[s] += 1;
  totalReach += c.reach_estimate || 0;
  if (WARM.has(s)) warmReach += c.reach_estimate || 0;
}

const { data: atts, error: attsErr } = await sb
  .from("affiliate_attributions")
  .select("coupon_code, mrr_cents, total_paid_cents, subscription_status, subscription_created_at, creator_id");
if (attsErr) throw attsErr;

const oneWeekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const newThisWeek = atts.filter((a) => a.subscription_created_at >= oneWeekAgoIso).length;
const activeAtts = atts.filter((a) => a.subscription_status === "active");
const mrrCents = activeAtts.reduce((s, a) => s + (a.mrr_cents || 0), 0);

// Per-creator leaderboard (top 5 by lifetime paid, only if any revenue exists).
let leaderboard = [];
if (atts.length > 0) {
  const byCreator = new Map();
  for (const a of atts) {
    const cur = byCreator.get(a.creator_id) || { paid: 0, code: a.coupon_code };
    cur.paid += a.total_paid_cents || 0;
    byCreator.set(a.creator_id, cur);
  }
  const codeToName = new Map(creators.map((c) => [c.coupon_code, c.name]));
  leaderboard = [...byCreator.entries()]
    .map(([, v]) => ({ name: codeToName.get(v.code) || v.code, code: v.code, paid: v.paid }))
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 5);
}

// ---------- read prior snapshot for week-over-week diff ----------

const { data: priorRows } = await sb
  .from("affiliate_snapshots")
  .select("totals, by_status, total_reach, warm_reach, captured_at")
  .order("captured_at", { ascending: false })
  .limit(1);
const prior = priorRows?.[0] || null;

const dCreators = prior ? creators.length - prior.totals.creators : 0;
const dMrrCents = prior ? mrrCents - (prior.totals.mrr_cents || 0) : 0;
const dWarmReach = prior ? warmReach - prior.warm_reach : 0;
const dWarmPct =
  prior && prior.warm_reach > 0
    ? `${((dWarmReach / prior.warm_reach) * 100).toFixed(0)}%`
    : "—";

// ---------- write this week's snapshot first (so we never lose continuity) ----------

const totals = {
  creators: creators.length,
  attributions: atts.length,
  active_subs: activeAtts.length,
  mrr_cents: mrrCents,
};
const { error: insertErr } = await sb.from("affiliate_snapshots").insert({
  totals,
  by_status: byStatus,
  total_reach: totalReach,
  warm_reach: warmReach,
});
if (insertErr) {
  console.error("[snapshot] failed to write snapshot row:", insertErr.message);
  // Still try to post Slack — operator visibility matters more than the row.
}

// ---------- compose Slack message ----------

const today = new Date().toISOString().slice(0, 10);
const firstDollar = mrrCents > 0 && (!prior || prior.totals.mrr_cents === 0);
const prefix = firstDollar ? "🎉 FIRST DOLLAR — " : "";

const driver =
  leaderboard.length > 0
    ? `${leaderboard[0].name} (${leaderboard[0].code}) ${fmtDollars(leaderboard[0].paid)} lifetime`
    : "—";

const lines = [
  `${prefix}📊 Academy Affiliate Snapshot — Mon ${today}`,
  `Roster: ${creators.length} (${signed(dCreators)} wow) · ${byStatus.pitched} pitched · ${byStatus.replied} replied · ${byStatus.live} live · ${atts.length} attributions`,
  `Reach: ${fmtMillions(totalReach)} total · ${fmtMillions(warmReach)} warm pipeline (${dWarmPct} wow)`,
  `MRR: ${fmtDollars(mrrCents)} (${dMrrCents >= 0 ? "+" : "-"}${fmtDollars(Math.abs(dMrrCents))} wow) · ${activeAtts.length} active subs`,
  `New this week: ${newThisWeek} attributions`,
  `Top driver: ${driver}`,
];
if (leaderboard.length > 1) {
  lines.push(
    `Leaderboard: ${leaderboard
      .map((l) => `${l.name} ${fmtDollars(l.paid)}`)
      .join(" · ")}`
  );
}
const text = lines.join("\n");

// ---------- post to Slack ----------

try {
  const res = await fetch(process.env.ACADEMY_SLACK_SIGNUPS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Slack ${res.status}: ${body.slice(0, 200)}`);
  }
  console.log("[snapshot] posted to Slack");
} catch (e) {
  console.error("[snapshot] Slack post failed:", e.message);
  console.error("[snapshot] payload was:\n" + text);
  process.exit(2);
}

console.log("[snapshot] done");
