-- 030_platform_column.sql
-- Multi-platform support: both claude-academy.com and learntogpt.com share one Supabase instance.
--
-- Design rationale:
--   - `courses.platform`       — scopes courses to a product; queries filter by platform so each
--                                 site only surfaces its own curriculum.
--   - `course_unlocks.platform` — a user may purchase on both platforms independently; the old
--                                 UNIQUE(user_id) constraint is dropped and replaced with
--                                 UNIQUE(user_id, platform) so each unlock is tracked per-product.
--   - `user_profiles.source`   — records which platform the account was created on; useful for
--                                 attribution and support, but a user_id is still shared across
--                                 both sites (same Supabase auth tenant).
--
-- Allowed platform values: 'claude-academy', 'learntogpt'
-- All existing rows belong to claude-academy, so defaults back-fill safely.
-- ============================================================


-- ============================================================
-- 1. courses — add platform column + constraint + index
-- ============================================================

alter table public.courses
  add column if not exists platform text not null default 'claude-academy';

-- Back-fill is a no-op because the column default already covers existing rows,
-- but an explicit UPDATE makes the intent clear and survives future re-runs via
-- idempotent DDL above.
update public.courses
  set platform = 'claude-academy'
  where platform is null or platform = '';

alter table public.courses
  drop constraint if exists courses_platform_check;

alter table public.courses
  add constraint courses_platform_check
  check (platform in ('claude-academy', 'learntogpt'));

create index if not exists idx_courses_platform on public.courses(platform);


-- ============================================================
-- 2. course_unlocks — add platform column, re-key unique constraint
-- ============================================================

alter table public.course_unlocks
  add column if not exists platform text not null default 'claude-academy';

update public.course_unlocks
  set platform = 'claude-academy'
  where platform is null or platform = '';

alter table public.course_unlocks
  drop constraint if exists course_unlocks_platform_check;

alter table public.course_unlocks
  add constraint course_unlocks_platform_check
  check (platform in ('claude-academy', 'learntogpt'));

-- Drop the old UNIQUE(user_id) — a user can now have one unlock per platform.
-- The constraint name in migration 025 is the Postgres auto-generated one:
-- course_unlocks_user_id_key
alter table public.course_unlocks
  drop constraint if exists course_unlocks_user_id_key;

-- New unique: one unlock record per (user, platform)
alter table public.course_unlocks
  drop constraint if exists course_unlocks_user_id_platform_key;

alter table public.course_unlocks
  add constraint course_unlocks_user_id_platform_key
  unique (user_id, platform);


-- ============================================================
-- 3. user_profiles — add source column
-- ============================================================

alter table public.user_profiles
  add column if not exists source text not null default 'claude-academy';

update public.user_profiles
  set source = 'claude-academy'
  where source is null or source = '';

-- No CHECK constraint on source — future platforms (e.g. direct API signups,
-- white-label partners) should not require a migration to add a new value here.
-- If stricter validation is needed later, add it as a separate migration.


-- ============================================================
-- 4. Update handle_new_user trigger to set source = 'learntogpt'
-- ============================================================
-- This Supabase project is shared between claude-academy.com and learntogpt.com.
-- The trigger fires on every auth.users INSERT regardless of which app the user
-- signed up through. We tag all new rows as 'learntogpt' because this migration
-- runs on the learntogpt deployment. Rows created via claude-academy were
-- already back-filled to 'claude-academy' above.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, source)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    ),
    'learntogpt'
  );
  RETURN new;
END;
$$;


-- ============================================================
-- 5. RLS — no policy changes required
-- ============================================================
-- courses: existing "courses_public_read" allows SELECT for all rows. Each app
--   must filter WHERE platform = '<its-own-platform>' in its queries — RLS does
--   not enforce platform isolation (both sites share auth and service_role, so
--   platform filtering belongs in application code, not row-security rules).
--
-- course_unlocks: policies remain service_role for writes, authenticated for
--   reads of own rows. The new (user_id, platform) unique constraint is
--   sufficient to prevent cross-platform collision; no RLS change needed.
--
-- user_profiles: read + update policies are unchanged. The source column is
--   informational and does not alter access semantics.
