-- 029_early_achievements.sql
-- Fill gaps in the achievement ladder so users earn badges within their first
-- session and first week. Existing achievements (First Steps, Getting Started,
-- On Fire, Perfectionist, XP Hunter, etc.) remain untouched — NET-NEW rows.
--
-- Criteria types and threshold semantics match checkAchievements() in
-- src/lib/gamification.ts (all use >= comparison).
--
-- Idempotent: ON CONFLICT (name) DO NOTHING.

INSERT INTO achievements (name, description, icon, criteria_json, xp_bonus) VALUES
  -- First session badges -------------------------------------------------------
  -- "First Lesson" already exists as "First Steps" (threshold 1). Skip.
  ('Curious Mind',      'Complete your first exercise',        '🧪', '{"type": "lessons_completed", "threshold": 1}',  15),
  ('Getting Started XP','Earn your first 50 XP',              '⚡', '{"type": "total_xp", "threshold": 50}',          10),

  -- Early momentum (first week) ------------------------------------------------
  ('On a Roll',         'Complete 3 lessons',                  '🔥', '{"type": "lessons_completed", "threshold": 3}',  20),
  ('Five Alive',        'Complete 5 lessons',                  '🖐️', '{"type": "lessons_completed", "threshold": 5}',  25),
  ('Momentum',          'Complete 10 lessons',                 '🚀', '{"type": "lessons_completed", "threshold": 10}', 50),

  -- Streak milestones -----------------------------------------------------------
  ('Day One',           'Start your first streak',             '🌱', '{"type": "streak_days", "threshold": 1}',        10),
  ('Dedicated Learner Streak', 'Maintain a 3-day streak',     '📅', '{"type": "streak_days", "threshold": 3}',        20),
  ('Committed',         'Maintain a 5-day streak',             '🗓️', '{"type": "streak_days", "threshold": 5}',        30),

  -- Perfect score milestones ----------------------------------------------------
  ('Sharp Shooter',     'Score 100% on 5 lessons',             '🎯', '{"type": "perfect_score", "threshold": 5}',      40),

  -- XP milestones (fill gaps below 500 and between 500-2000) --------------------
  ('Rising Star',       'Earn 200 XP',                         '🌟', '{"type": "total_xp", "threshold": 200}',         20),
  ('XP Machine',        'Earn 1,000 XP',                       '💫', '{"type": "total_xp", "threshold": 1000}',        75)

ON CONFLICT (name) DO NOTHING;
