-- 012_add_locale_column.sql
-- Adds locale support to course content tables so each language gets its own
-- rows. The chosen data model is "one row per (slug, locale)" rather than a
-- separate translations table — simpler for the weekend i18n push and cheap
-- to query.
--
-- Ship: Phase 1 of the weekend international expansion (see plans/).

alter table courses add column if not exists locale text not null default 'en';
alter table lessons add column if not exists locale text not null default 'en';
alter table exercises add column if not exists locale text not null default 'en';
alter table user_profiles add column if not exists preferred_locale text not null default 'en';

-- Replace courses.slug unique with (slug, locale) so the same slug can exist
-- once per language. The auto-generated constraint name for `slug text unique`
-- is `courses_slug_key` (Postgres convention: <table>_<col>_key).
alter table courses drop constraint if exists courses_slug_key;
create unique index if not exists courses_slug_locale_idx on courses (slug, locale);

-- lessons already has unique(course_id, slug). Because courses are now
-- per-locale, course_id is naturally locale-scoped, so the existing unique
-- holds without modification. We still add the locale column on lessons
-- and exercises for fast locale-filtered queries from the app.

create index if not exists courses_locale_idx on courses (locale);
create index if not exists lessons_locale_idx on lessons (locale);
create index if not exists exercises_locale_idx on exercises (locale);

-- Sanity check: every existing row is now 'en' (the column default applied
-- retroactively via NOT NULL DEFAULT). No data migration needed.
