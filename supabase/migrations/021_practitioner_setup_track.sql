-- ============================================
-- Wave 3: Track 6 — The Practitioner Setup
-- Adds 'practitioner_setup' to the courses.track CHECK constraint.
-- See GTM Bible v2.0 §1 (positioning) — this is the differentiator
-- that makes "Advanced Practitioner" a real curriculum, not just a label.
-- RLS already enabled on courses; no new policies needed.
-- ============================================

-- Drop and recreate track CHECK constraint to add 'practitioner_setup'.
-- Mirrors migration 010 format. Keeps all prior values for backwards compat.
alter table courses drop constraint if exists courses_track_check;
alter table courses add constraint courses_track_check
  check (track in (
    'fundamentals', 'work', 'claude_code', 'api_agents', 'architect_prep',
    'why_claude', 'three_levels', 'essentials', 'level_up', 'build_something',
    'practitioner_setup'
  ));
