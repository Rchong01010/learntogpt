-- Seed data for the affiliate program tables.
-- Safe to run multiple times (idempotent on coupon_code + stripe_subscription_id).
--
-- Usage:
--   psql "$DATABASE_URL" -f supabase/seed/affiliate-test.sql
--
-- Do NOT run this against production. It's intended for local / staging only.
-- The attribution rows reference auth.users by id; if no users exist they're
-- skipped silently rather than failing the whole script.

BEGIN;

-- ============================================================
-- 3 test creators — one English YouTuber, one Spanish newsletter, one German tech blogger
-- ============================================================
INSERT INTO affiliate_creators (name, handle, email, channel, reach_estimate, language, coupon_code, stripe_coupon_id, rev_share_pct, outreach_status, notes)
VALUES
  ('Test Creator One',   '@testone',   'one@example.com',   'youtube',    125000,  'en', 'TESTONE20',   'TESTONE20',   40, 'live',   'Sample English YouTuber for testing.'),
  ('Test Creator Dos',   '@testdos',   'dos@example.com',   'newsletter',  18000,  'es', 'TESTDOS20',   'TESTDOS20',   40, 'signed', 'Sample Spanish newsletter.'),
  ('Test Creator Drei',  '@testdrei',  'drei@example.com',  'twitter',     42000,  'de', 'TESTDREI20',  'TESTDREI20',  50, 'pitched','Sample German tech influencer (higher rev share as premium deal).')
ON CONFLICT (coupon_code) DO UPDATE SET
  name             = EXCLUDED.name,
  handle           = EXCLUDED.handle,
  email            = EXCLUDED.email,
  channel          = EXCLUDED.channel,
  reach_estimate   = EXCLUDED.reach_estimate,
  language         = EXCLUDED.language,
  stripe_coupon_id = EXCLUDED.stripe_coupon_id,
  rev_share_pct    = EXCLUDED.rev_share_pct,
  outreach_status  = EXCLUDED.outreach_status,
  notes            = EXCLUDED.notes;

-- ============================================================
-- Attributions — only insert if we have at least 2 auth.users rows to bind to.
-- Cycles through the first 3 auth users (if present), one attribution per creator.
-- ============================================================
DO $$
DECLARE
  v_user_ids uuid[];
  v_user_count int;
  v_creator_one  uuid;
  v_creator_dos  uuid;
  v_creator_drei uuid;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 3) INTO v_user_ids;
  v_user_count := COALESCE(array_length(v_user_ids, 1), 0);

  IF v_user_count = 0 THEN
    RAISE NOTICE 'No auth.users rows found — skipping attribution seeds.';
    RETURN;
  END IF;

  SELECT id INTO v_creator_one  FROM affiliate_creators WHERE coupon_code = 'TESTONE20';
  SELECT id INTO v_creator_dos  FROM affiliate_creators WHERE coupon_code = 'TESTDOS20';
  SELECT id INTO v_creator_drei FROM affiliate_creators WHERE coupon_code = 'TESTDREI20';

  -- Creator 1: active sub on user[0]
  INSERT INTO affiliate_attributions (
    user_id, creator_id, coupon_code, stripe_subscription_id, stripe_customer_id,
    subscription_created_at, subscription_status, mrr_cents, total_paid_cents, last_payment_at
  ) VALUES (
    v_user_ids[1], v_creator_one, 'TESTONE20', 'sub_test_one_active', 'cus_test_one_active',
    now() - INTERVAL '14 days', 'active', 1999, 1999, now() - INTERVAL '14 days'
  ) ON CONFLICT (stripe_subscription_id) DO NOTHING;

  -- Creator 2: active sub on user[1] (if present) — otherwise skip gracefully
  IF v_user_count >= 2 THEN
    INSERT INTO affiliate_attributions (
      user_id, creator_id, coupon_code, stripe_subscription_id, stripe_customer_id,
      subscription_created_at, subscription_status, mrr_cents, total_paid_cents, last_payment_at
    ) VALUES (
      v_user_ids[2], v_creator_dos, 'TESTDOS20', 'sub_test_dos_active', 'cus_test_dos_active',
      now() - INTERVAL '40 days', 'active', 1999, 3998, now() - INTERVAL '10 days'
    ) ON CONFLICT (stripe_subscription_id) DO NOTHING;
  END IF;

  -- Creator 3: churned sub on user[2] (if present)
  IF v_user_count >= 3 THEN
    INSERT INTO affiliate_attributions (
      user_id, creator_id, coupon_code, stripe_subscription_id, stripe_customer_id,
      subscription_created_at, subscription_status, mrr_cents, total_paid_cents, last_payment_at, churned_at
    ) VALUES (
      v_user_ids[3], v_creator_drei, 'TESTDREI20', 'sub_test_drei_churned', 'cus_test_drei_churned',
      now() - INTERVAL '95 days', 'churned', 0, 5997, now() - INTERVAL '35 days', now() - INTERVAL '5 days'
    ) ON CONFLICT (stripe_subscription_id) DO NOTHING;
  END IF;
END $$;

COMMIT;
