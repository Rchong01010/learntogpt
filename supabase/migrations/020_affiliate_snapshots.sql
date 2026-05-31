-- Migration 020: weekly affiliate snapshot history
--
-- Single table that stores one row per Hermes weekly affiliate dashboard run.
-- The Hermes script reads the most recent prior row to compute week-over-week
-- deltas, then writes a fresh row at the end of every Monday morning run.
--
-- RLS policy: service_role only. Snapshots contain aggregated revenue +
-- pipeline data. service_role bypasses RLS by design.

CREATE TABLE affiliate_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at timestamptz NOT NULL DEFAULT now(),
  totals jsonb NOT NULL,        -- { creators, attributions, mrr_cents, active_subs }
  by_status jsonb NOT NULL,     -- { not_started, pitched, replied, ... }
  total_reach bigint NOT NULL,
  warm_reach bigint NOT NULL    -- replied + negotiating + signed + live
);

CREATE INDEX idx_affiliate_snapshots_captured_at
  ON affiliate_snapshots(captured_at DESC);

ALTER TABLE affiliate_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON affiliate_snapshots FROM anon, authenticated;
