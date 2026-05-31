-- 018_signup_attribution.sql
-- First-touch UTM + referrer capture, one row per user.
-- RLS: service_role only. Ops data — no user should read it.
-- Applied to prod via Supabase MCP on 2026-04-21.

create table if not exists public.signup_attribution (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,

  referrer text,
  landing_path text,

  user_agent text,
  ip_country text,

  first_visit_at timestamptz not null default now(),
  signup_at      timestamptz not null default now()
);

create index if not exists idx_signup_attribution_user on public.signup_attribution(user_id);
create index if not exists idx_signup_attribution_utm_source on public.signup_attribution(utm_source);
create index if not exists idx_signup_attribution_signup_at on public.signup_attribution(signup_at desc);

alter table public.signup_attribution enable row level security;

drop policy if exists "signup_attribution_service_role_all" on public.signup_attribution;
create policy "signup_attribution_service_role_all"
  on public.signup_attribution
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.signup_attribution is
  'First-touch UTM + referrer capture, one row per signup. Service role only.';
