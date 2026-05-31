-- Migration 014: Exercise attempt tracking for perfect-run XP bonus
--
-- Adds user_exercise_attempts so the /api/progress completion handler can
-- tell whether a user got every exercise in a lesson correct on the first
-- try (perfect-run = 1.5x base XP) and whether they are on a 7+ day streak
-- (2x base XP). The two bonuses stack multiplicatively — 3x base on a
-- perfect run while streaking.
--
-- Writes to this table are made server-side by /api/exercises/check using
-- the admin (service_role) client, so we do NOT grant INSERT/UPDATE to
-- authenticated. Reads go through server routes as well; no user-facing
-- select policy is needed, but we add one for defence-in-depth so the
-- future "attempts history" UI has a safe path.

-- ============================================================
-- user_exercise_attempts
-- ============================================================
create table if not exists user_exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  attempts int not null default 0,
  -- first_correct is TRUE iff the very first submission for this
  -- (user, exercise) pair was correct. Stays false forever if the first
  -- submission was wrong — exactly the signal we need for perfect-run XP.
  first_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

alter table user_exercise_attempts enable row level security;

-- Users can read their own attempt records (for future UI).
create policy "user_exercise_attempts_select_own" on user_exercise_attempts
  for select to authenticated
  using (auth.uid() = user_id);

-- Intentionally NO insert/update policy for authenticated.
-- All writes go through /api/exercises/check using the service_role client.

create index if not exists idx_user_exercise_attempts_user
  on user_exercise_attempts(user_id);
create index if not exists idx_user_exercise_attempts_user_exercise
  on user_exercise_attempts(user_id, exercise_id);
