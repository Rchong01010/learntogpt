-- Migration 014: Streak reminder tracking
--
-- Adds streak_reminder_sent_at to user_profiles so the daily streak-reminder
-- cron (src/app/api/cron/streak-reminder/route.ts) can deduplicate: never
-- send two reminders to the same user within 12 hours.
--
-- Null default = "never sent"; cron fills this when it dispatches an email.
--
-- RLS: user_profiles already has RLS enabled (migration 001) and the
-- protect_profile_fields trigger (migration 009) blocks authenticated users
-- from mutating any gamification column. That trigger checks current_setting
-- ('role') != 'service_role', so the cron's createSupabaseAdmin() client
-- (service_role) can write streak_reminder_sent_at while regular users
-- cannot. No new policy needed — this column inherits the existing lockdown.
-- Public access: none. Read/write is service-role only in practice.

alter table user_profiles
  add column if not exists streak_reminder_sent_at timestamptz;

-- Index: cron filters on (current_streak > 0) and compares
-- streak_reminder_sent_at against a 12h window. Partial index on active
-- streakers keeps it small.
create index if not exists idx_user_profiles_active_streak_reminder
  on user_profiles (streak_reminder_sent_at)
  where current_streak > 0;

comment on column user_profiles.streak_reminder_sent_at is
  'Last time the 20-hour streak-reminder email was sent. Used to prevent double-sends within 12h. Updated only by the cron route with service_role.';
