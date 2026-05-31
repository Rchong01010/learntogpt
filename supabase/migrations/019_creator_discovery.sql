-- Migration 019: Creator discovery columns on affiliate_creators
--
-- Lets the auto-discovery cron (ateam-gtm/tools/creator_discovery.py) safely
-- insert newly-found creators into the same affiliate_creators table the send
-- pipeline already reads from. New columns disambiguate auto-discovered rows
-- from manually-curated ones, and a (channel, handle) unique constraint
-- prevents double-pitching the same creator across discovery runs.
--
-- RLS: unchanged. affiliate_creators is service_role only (see migration 013).
--
-- Apply via Supabase SQL editor. Idempotent — safe to re-run.

-- ============================================================
-- 1. Discovery metadata columns
-- ============================================================
alter table public.affiliate_creators
  add column if not exists discovery_source text,
  add column if not exists discovery_score numeric,
  add column if not exists discovered_at timestamptz,
  add column if not exists email_extract_attempted_at timestamptz,
  add column if not exists email_extract_status text;

comment on column public.affiliate_creators.discovery_source is
  'Origin of this row. NULL = manually added. Values: youtube_v3, twitter_search, substack_top, referral_<creator_handle>, etc.';
comment on column public.affiliate_creators.discovery_score is
  'log10(reach_estimate) * upload_recency * topic_match. Used to rank candidates before send.';
comment on column public.affiliate_creators.discovered_at is
  'When the discovery cron first inserted this row.';
comment on column public.affiliate_creators.email_extract_status is
  'pending | found | captcha | not_found | skipped. Set by creator_email_extract.py.';

-- ============================================================
-- 2. Dedupe constraint on (channel, handle)
-- ============================================================
-- Coupon_code is already UNIQUE, but discovery generates a new coupon per
-- candidate, so coupon-level dedupe doesn't catch double-discovery. Lock at
-- the (channel, handle) tuple instead. Partial index — NULL handles allowed
-- (manual rows without a handle).
create unique index if not exists idx_affiliate_creators_channel_handle
  on public.affiliate_creators (channel, lower(handle))
  where handle is not null;

-- ============================================================
-- 3. Convenience index for the discovery → enrichment → send pipeline
-- ============================================================
create index if not exists idx_affiliate_creators_pending_extract
  on public.affiliate_creators (email_extract_status, discovered_at)
  where email is null and discovery_source is not null;

create index if not exists idx_affiliate_creators_ready_to_pitch
  on public.affiliate_creators (outreach_status, discovery_score desc)
  where email is not null and outreach_status = 'not_started';
