-- Add new active exercise types: prompt_lab, speed_prompt, scenario_walkthrough
-- These require typing/creating, not just clicking — higher engagement.

-- Widen the exercise type constraint
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_type_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_type_check
  CHECK (type IN (
    'multiple_choice', 'fill_blank', 'drag_drop', 'code_exercise', 'scenario',
    'matching_pairs', 'speed_round', 'bug_hunt', 'flash_cards', 'word_scramble',
    'typing_challenge', 'whack_a_mole', 'prompt_builder', 'conversation_sim',
    'spot_the_difference',
    'prompt_lab', 'speed_prompt', 'scenario_walkthrough'
  ));

-- Update v_exercises_safe to expose game_data for the new types
-- (They need game_data on the client for rendering, like flash_cards/speed_round)
DROP VIEW IF EXISTS v_exercises_safe;
CREATE VIEW v_exercises_safe AS
SELECT
  id, lesson_id, type, order_index, prompt,
  options_json, hints_json, xp_reward,
  CASE WHEN type IN (
    'flash_cards', 'speed_round', 'matching_pairs', 'word_scramble',
    'typing_challenge', 'whack_a_mole', 'prompt_builder', 'conversation_sim',
    'spot_the_difference',
    'prompt_lab', 'speed_prompt', 'scenario_walkthrough'
  ) THEN correct_answer ELSE NULL END AS game_data
FROM exercises;
