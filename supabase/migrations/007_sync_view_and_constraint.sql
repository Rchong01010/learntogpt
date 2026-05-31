-- Migration 007: Sync v_exercises_safe view and type constraint with live DB
-- These changes were applied manually via Supabase SQL editor in previous sessions.
-- This migration ensures the repo matches the live database state.

-- 1. Update v_exercises_safe to expose game_data for interactive exercise types
-- (keeps correct_answer hidden for answer-checked types like multiple_choice, fill_blank, etc.)
CREATE OR REPLACE VIEW v_exercises_safe AS
SELECT
  id, lesson_id, type, order_index, prompt,
  options_json, hints_json, xp_reward,
  CASE WHEN type IN (
    'flash_cards', 'speed_round', 'matching_pairs', 'word_scramble',
    'typing_challenge', 'whack_a_mole', 'prompt_builder',
    'conversation_sim', 'spot_the_difference'
  ) THEN correct_answer ELSE NULL END AS game_data
FROM exercises;

-- 2. Widen exercises_type_check to include all 15 exercise types
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_type_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_type_check
  CHECK (type IN (
    'multiple_choice', 'fill_blank', 'drag_drop', 'code_exercise',
    'scenario', 'matching_pairs', 'speed_round', 'bug_hunt',
    'flash_cards', 'word_scramble', 'typing_challenge', 'whack_a_mole',
    'prompt_builder', 'conversation_sim', 'spot_the_difference'
  ));
