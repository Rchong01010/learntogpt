-- Claude Academy: Schema Fixes
-- 1. Missing increment_xp RPC function
-- 2. Exercise type CHECK constraint too narrow
-- 3. Missing lesson_count column on courses
-- 4. Safe view for exercises (excludes correct_answer + explanation)

-- ============================================================
-- 1. increment_xp RPC
-- ============================================================
create or replace function increment_xp(p_user_id uuid, p_amount int)
returns void language plpgsql security definer as $$
begin
  update user_profiles set total_xp = total_xp + p_amount where user_id = p_user_id;
end;
$$;

-- ============================================================
-- 2. Widen exercise type CHECK constraint
-- ============================================================
alter table exercises drop constraint if exists exercises_type_check;

alter table exercises add constraint exercises_type_check
  check (type in (
    'multiple_choice',
    'fill_blank',
    'drag_drop',
    'code_exercise',
    'scenario',
    'matching_pairs',
    'speed_round',
    'bug_hunt',
    'flash_cards',
    'word_scramble'
  ));

-- ============================================================
-- 3. Add lesson_count to courses
-- ============================================================
alter table courses add column if not exists lesson_count integer default 0;

-- ============================================================
-- 4. Safe exercises view (excludes correct_answer & explanation)
-- ============================================================
create or replace view v_exercises_safe as
select
  id,
  lesson_id,
  type,
  order_index,
  prompt,
  options_json,
  hints_json,
  xp_reward
from exercises;
