-- Migration 017: Per-exercise event instrumentation
--
-- We were inferring drop-off from `user_lesson_progress.score` / completion
-- flags, which is too coarse to pinpoint WHICH exercise inside a lesson
-- people bail on. This table records three explicit events per user per
-- exercise — started, completed, abandoned — so we can compute
-- (completed / started) ratios, time-spent distributions, and
-- lesson-internal drop-off curves without a third-party analytics vendor.
--
-- Writes originate from /api/events/exercise. Server route authenticates the
-- user and uses the service_role admin client to insert — mirrors the
-- pattern used by /api/exercises/check for user_exercise_attempts.
--
-- PII note: intentionally no IP, no user-agent, no answer content. Just
-- (user_id, exercise_id, lesson_id, event_type, time_spent_ms, created_at).

-- ============================================================
-- exercise_events
-- ============================================================
create table if not exists exercise_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  event_type text not null check (event_type in ('started', 'completed', 'abandoned')),
  time_spent_ms int,
  created_at timestamptz not null default now()
);

-- Recent-activity lookup per user (drop-off funnels, session reconstruction)
create index if not exists idx_exercise_events_user_created
  on exercise_events (user_id, created_at desc);

-- Aggregation per exercise by event type (completed/started ratio queries)
create index if not exists idx_exercise_events_exercise_type
  on exercise_events (exercise_id, event_type);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table exercise_events enable row level security;

-- Authenticated users can INSERT rows for themselves only. The server route
-- still performs the write via the service_role admin client, but this
-- policy is kept as defence-in-depth in case a direct anon-key insert path
-- is ever added.
create policy "exercise_events_insert_own" on exercise_events
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can SELECT their own rows (future "your activity" UI).
create policy "exercise_events_select_own" on exercise_events
  for select to authenticated
  using (auth.uid() = user_id);

-- No UPDATE or DELETE policy for authenticated — events are append-only.
-- service_role bypasses RLS and retains full access by default.
