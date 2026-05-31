-- ============================================
-- V3 Curriculum Overhaul
-- Replaces 5-track model with new 5-track structure:
--   why_claude, three_levels, essentials, level_up, build_something
-- Adds shares table for social sharing features.
-- Refreshes v_campaign_map view for 14-course layout.
-- ============================================

-- 1. Drop and recreate track CHECK constraint to accept both old and new values
alter table courses drop constraint if exists courses_track_check;
alter table courses add constraint courses_track_check
  check (track in (
    'fundamentals', 'work', 'claude_code', 'api_agents', 'architect_prep',
    'why_claude', 'three_levels', 'essentials', 'level_up', 'build_something'
  ));

-- 2. Add shares table for social sharing
create table shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  share_type text not null check (share_type in ('course_complete', 'track_complete', 'badge_unlock', 'level_up', 'streak_milestone')),
  reference_id text,
  title text not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);
alter table shares enable row level security;
create policy "shares_public_read" on shares for select using (true);
create policy "shares_insert_own" on shares for insert to authenticated with check (auth.uid() = user_id);

-- 3. Recreate v_campaign_map view (drop first to allow column changes)
drop view if exists v_campaign_map;
create view v_campaign_map as
select
  c.id, c.title, c.slug, c.track, c.difficulty,
  c.campaign_order, c.level_required, c.is_free,
  c.prerequisite_slug, c.lesson_count, c.icon,
  prereq.title as prerequisite_title
from courses c
left join courses prereq on prereq.slug = c.prerequisite_slug
order by c.campaign_order;
