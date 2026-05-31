-- migration 025: course_unlocks
-- One-time payment table for the $19.99 "Unlock All Courses" paywall.
-- Separate from `subscriptions` (recurring) — keeps accounting clean.
-- ============================================================

create table course_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  created_at timestamptz default now()
);

alter table course_unlocks enable row level security;

-- Users can read their own unlock status
create policy "course_unlocks_select_own" on course_unlocks
  for select to authenticated using (auth.uid() = user_id);

-- Only service_role can insert/update (webhook handler uses admin client)
create policy "course_unlocks_insert_service" on course_unlocks
  for insert to service_role with check (true);

create policy "course_unlocks_update_service" on course_unlocks
  for update to service_role using (true);
