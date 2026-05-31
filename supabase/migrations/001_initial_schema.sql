-- Claude Academy: Initial Schema
-- All tables have RLS enabled with appropriate policies.

-- ============================================================
-- 1. courses
-- ============================================================
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  track text not null check (track in ('fundamentals', 'work', 'claude_code', 'api_agents', 'architect_prep')),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  order_index int not null,
  is_free boolean default false,
  icon text,
  created_at timestamptz default now()
);

alter table courses enable row level security;

create policy "courses_public_read" on courses
  for select using (true);

-- ============================================================
-- 2. lessons
-- ============================================================
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  order_index int not null,
  xp_reward int default 10,
  estimated_minutes int default 5,
  content_json jsonb,
  created_at timestamptz default now(),
  unique (course_id, slug)
);

alter table lessons enable row level security;

create policy "lessons_public_read" on lessons
  for select using (true);

create index idx_lessons_course_id on lessons(course_id);

-- ============================================================
-- 3. exercises
-- ============================================================
create table exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  type text not null check (type in ('multiple_choice', 'fill_blank', 'drag_drop', 'code_exercise', 'scenario')),
  order_index int not null,
  prompt text not null,
  options_json jsonb,
  correct_answer text,
  explanation text,
  hints_json jsonb default '[]'::jsonb,
  xp_reward int default 5
);

alter table exercises enable row level security;

create policy "exercises_public_read" on exercises
  for select using (true);

create index idx_exercises_lesson_id on exercises(lesson_id);

-- ============================================================
-- 4. achievements
-- ============================================================
create table achievements (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  icon text,
  criteria_json jsonb,
  xp_bonus int default 0
);

alter table achievements enable row level security;

create policy "achievements_public_read" on achievements
  for select using (true);

-- ============================================================
-- 5. user_profiles
-- ============================================================
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  total_xp int default 0,
  current_streak int default 0,
  longest_streak int default 0,
  level int default 1,
  created_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "user_profiles_authenticated_read" on user_profiles
  for select to authenticated using (true);

create policy "user_profiles_update_own" on user_profiles
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 6. user_progress
-- ============================================================
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text default 'available' check (status in ('locked', 'available', 'in_progress', 'completed')),
  score int default 0,
  xp_earned int default 0,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

alter table user_progress enable row level security;

create policy "user_progress_select_own" on user_progress
  for select to authenticated using (auth.uid() = user_id);

create policy "user_progress_insert_own" on user_progress
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_progress_update_own" on user_progress
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_user_progress_user_id on user_progress(user_id);

-- ============================================================
-- 7. user_achievements
-- ============================================================
create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique (user_id, achievement_id)
);

alter table user_achievements enable row level security;

create policy "user_achievements_select_own" on user_achievements
  for select to authenticated using (auth.uid() = user_id);

create policy "user_achievements_insert_own" on user_achievements
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_achievements_update_own" on user_achievements
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 8. user_streaks
-- ============================================================
create table user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed_lessons int default 0,
  unique (user_id, date)
);

alter table user_streaks enable row level security;

create policy "user_streaks_select_own" on user_streaks
  for select to authenticated using (auth.uid() = user_id);

create policy "user_streaks_insert_own" on user_streaks
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_streaks_update_own" on user_streaks
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_user_streaks_user_id_date on user_streaks(user_id, date);

-- ============================================================
-- 9. subscriptions
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'free' check (status in ('free', 'active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "subscriptions_select_own" on subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create user_profile on auth.users insert
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- View: leaderboard
-- ============================================================
create view v_leaderboard as
select
  user_id,
  display_name,
  avatar_url,
  total_xp,
  level,
  current_streak
from user_profiles
order by total_xp desc
limit 100;
