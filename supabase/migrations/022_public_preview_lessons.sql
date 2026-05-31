-- 022_public_preview_lessons.sql
-- Mark the flagship "preview" lesson in the beginner and intermediate tracks
-- as is_free = true across ALL 7 locales (en, ja, ko, zh-CN, de, fr, es).
--
-- Purpose: give every visitor a taste of the curriculum without sign-up gating,
-- so the course page can render a playable first lesson per difficulty tier.
--
-- Beginner  → "How Claude Is Different" (slug: how-claude-is-different, track: why_claude)
--              First lesson: "Meet Claude" (slug: meet-claude, order_index 1)
--
-- Intermediate → "Strategic Prompting" (slug: strategic-prompting, track: three_levels)
--                 First lesson: "Context Is Everything" (slug: context-is-everything, order_index 1)
--
-- Idempotent: UPDATE … SET is_free = true is a no-op on rows already true.

-- ============================================================
-- 1. Beginner flagship course — mark course-level is_free
-- ============================================================
-- "how-claude-is-different" is already is_free in the seed data, but the
-- migration makes it authoritative across all locales (including any added
-- after initial seeding).
UPDATE courses
SET is_free = true
WHERE slug = 'how-claude-is-different'
  AND is_free IS DISTINCT FROM true;

-- ============================================================
-- 2. Beginner flagship lesson — first lesson of each locale's course
-- ============================================================
UPDATE lessons
SET is_free = true
WHERE slug = 'meet-claude'
  AND course_id IN (
    SELECT id FROM courses WHERE slug = 'how-claude-is-different'
  )
  AND is_free IS DISTINCT FROM true;

-- ============================================================
-- 3. Intermediate flagship course — mark course-level is_free
-- ============================================================
-- "strategic-prompting" was is_free = false in the seed. This opens the
-- course page so visitors can see the preview lesson.
UPDATE courses
SET is_free = true
WHERE slug = 'strategic-prompting'
  AND is_free IS DISTINCT FROM true;

-- ============================================================
-- 4. Intermediate flagship lesson — first lesson of each locale's course
-- ============================================================
UPDATE lessons
SET is_free = true
WHERE slug = 'context-is-everything'
  AND course_id IN (
    SELECT id FROM courses WHERE slug = 'strategic-prompting'
  )
  AND is_free IS DISTINCT FROM true;
