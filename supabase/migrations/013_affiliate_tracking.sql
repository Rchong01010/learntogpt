-- Migration 013: Affiliate creator partnerships + attribution tracking
--
-- Two tables:
--   affiliate_creators     — creators we partner with (coupon, rev share, outreach status)
--   affiliate_attributions — subscriptions attributed to a creator via their coupon
--
-- RLS policy: service_role only. Per project convention (CLAUDE.md rule: "new
-- Supabase table = RLS policy in same commit"), these tables hold PII and
-- revenue-attribution data and must never be readable by anon/authenticated.
-- All access goes through server-side code (scripts + Stripe webhook) that
-- uses createSupabaseAdmin() (service_role key, RLS-bypass).

-- ============================================================
-- ENUMs
-- ============================================================
DO $$ BEGIN
  CREATE TYPE affiliate_outreach_status AS ENUM (
    'not_started',
    'pitched',
    'replied',
    'negotiating',
    'signed',
    'live',
    'declined',
    'dormant'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE affiliate_subscription_status AS ENUM (
    'active',
    'trialing',
    'past_due',
    'canceled',
    'churned',
    'incomplete'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- affiliate_creators
-- ============================================================
CREATE TABLE affiliate_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text,
  email text,
  channel text,                       -- 'youtube', 'twitter', 'tiktok', 'newsletter', etc.
  reach_estimate int,                 -- subs / followers / list size
  language text DEFAULT 'en',         -- ISO 639-1
  coupon_code text UNIQUE NOT NULL,   -- also used as Stripe coupon id
  rev_share_pct int NOT NULL DEFAULT 30 CHECK (rev_share_pct >= 0 AND rev_share_pct <= 100),
  stripe_coupon_id text,              -- should match coupon_code but stored separately for safety
  outreach_sent_at timestamptz,
  outreach_status affiliate_outreach_status NOT NULL DEFAULT 'not_started',
  agreement_signed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_creators_coupon_code ON affiliate_creators(coupon_code);
CREATE INDEX idx_affiliate_creators_outreach_status ON affiliate_creators(outreach_status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION affiliate_creators_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS affiliate_creators_touch_updated_at_trg ON affiliate_creators;
CREATE TRIGGER affiliate_creators_touch_updated_at_trg
  BEFORE UPDATE ON affiliate_creators
  FOR EACH ROW EXECUTE FUNCTION affiliate_creators_touch_updated_at();

ALTER TABLE affiliate_creators ENABLE ROW LEVEL SECURITY;
-- No policies created. RLS is enabled but no SELECT/INSERT/UPDATE/DELETE
-- policies exist for anon or authenticated roles, so all non-service-role
-- access is denied by default. service_role bypasses RLS.
-- Explicitly revoke to make intent clear:
REVOKE ALL ON affiliate_creators FROM anon, authenticated;

-- ============================================================
-- affiliate_attributions
-- ============================================================
CREATE TABLE affiliate_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES affiliate_creators(id) ON DELETE RESTRICT,
  coupon_code text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text,
  subscription_created_at timestamptz NOT NULL,
  subscription_status affiliate_subscription_status NOT NULL DEFAULT 'active',
  mrr_cents int NOT NULL DEFAULT 0,           -- current monthly recurring revenue contribution
  total_paid_cents bigint NOT NULL DEFAULT 0, -- cumulative amount paid by this subscriber
  last_payment_at timestamptz,
  churned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_attributions_creator_id ON affiliate_attributions(creator_id);
CREATE INDEX idx_affiliate_attributions_user_id ON affiliate_attributions(user_id);
CREATE INDEX idx_affiliate_attributions_status ON affiliate_attributions(subscription_status);
CREATE INDEX idx_affiliate_attributions_created_at ON affiliate_attributions(subscription_created_at);

-- updated_at trigger
CREATE OR REPLACE FUNCTION affiliate_attributions_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS affiliate_attributions_touch_updated_at_trg ON affiliate_attributions;
CREATE TRIGGER affiliate_attributions_touch_updated_at_trg
  BEFORE UPDATE ON affiliate_attributions
  FOR EACH ROW EXECUTE FUNCTION affiliate_attributions_touch_updated_at();

ALTER TABLE affiliate_attributions ENABLE ROW LEVEL SECURITY;
-- Same pattern: no policies = all non-service-role access denied.
REVOKE ALL ON affiliate_attributions FROM anon, authenticated;

-- ============================================================
-- Comments (for schema self-documentation)
-- ============================================================
COMMENT ON TABLE affiliate_creators IS 'Creators we partner with for Claude Academy affiliate program. RLS: service_role only.';
COMMENT ON TABLE affiliate_attributions IS 'Subscriptions attributed to a creator via their coupon code. Populated by Stripe webhook. RLS: service_role only.';
COMMENT ON COLUMN affiliate_creators.coupon_code IS 'Also used as the Stripe coupon id (Stripe coupons accept custom ids).';
COMMENT ON COLUMN affiliate_creators.rev_share_pct IS 'Percentage (0-100) of MRR paid to creator monthly. Default 30 (lifetime rev-share on every attributed subscriber).';
COMMENT ON COLUMN affiliate_attributions.mrr_cents IS 'Current MRR contribution in cents. Updated on subscription events.';
COMMENT ON COLUMN affiliate_attributions.total_paid_cents IS 'Cumulative invoice total in cents across all payments.';
