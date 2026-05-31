-- ============================================
-- Wave 3: Track 7 — Advanced Workflows
-- Adds 'advanced_workflows' to the courses.track CHECK constraint.
-- Covers slash commands, memory architecture, agent design, hooks/bridges.
-- RLS already enabled on courses; no new policies needed.
-- ============================================

-- Drop and recreate track CHECK constraint to add 'advanced_workflows'.
-- Mirrors migration 021 format. Keeps all prior values for backwards compat.
alter table courses drop constraint if exists courses_track_check;
alter table courses add constraint courses_track_check
  check (track in (
    'fundamentals', 'work', 'claude_code', 'api_agents', 'architect_prep',
    'why_claude', 'three_levels', 'essentials', 'level_up', 'build_something',
    'practitioner_setup', 'advanced_workflows'
  ));
