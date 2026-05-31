-- Migration 014: Project shell for Track 5
--
-- Adds a new content_type column to `courses` so courses can opt into the
-- project shell UX instead of the Duolingo-style lesson player. Creates two
-- new tables for project shell state: submissions and per-step progress.
--
-- Per project rule (CLAUDE.md: "new Supabase table = RLS policy in same
-- commit") both new tables enable RLS and define per-user policies. The
-- submissions table also allows authenticated reads of public rows so the
-- gallery view can render other learners' submissions.
--
-- Safe to run: this migration is additive. Existing courses default to
-- content_type='lesson' which preserves all current behavior. No Track 5
-- course is flipped to 'project' here; that happens in a seed step.

-- ============================================================
-- 1. courses.content_type
-- ============================================================
alter table courses
  add column if not exists content_type text not null default 'lesson'
  check (content_type in ('lesson', 'project'));

comment on column courses.content_type is
  'Routing discriminator. ''lesson'' renders the existing LessonPlayerClient. ''project'' routes to /projects/[slug] for the Track 5 project shell.';

create index if not exists idx_courses_content_type on courses(content_type);

-- ============================================================
-- 2. project_submissions
-- ============================================================
-- One row per (user, project). Users submit a URL (e.g. their deployed
-- website) and an optional short description. is_public gates inclusion in
-- the public gallery.
create table if not exists project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references courses(id) on delete cascade,
  submission_url text,
  submission_description text,
  is_public boolean not null default true,
  submitted_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists idx_project_submissions_project_id
  on project_submissions(project_id);
create index if not exists idx_project_submissions_user_id
  on project_submissions(user_id);
create index if not exists idx_project_submissions_submitted_at
  on project_submissions(submitted_at desc);

alter table project_submissions enable row level security;

-- Authenticated users can read their own submission OR any submission
-- flagged public. Gallery view relies on the public branch.
create policy "project_submissions_select_own_or_public"
  on project_submissions for select to authenticated
  using (auth.uid() = user_id or is_public = true);

create policy "project_submissions_insert_own"
  on project_submissions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "project_submissions_update_own"
  on project_submissions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No delete policy on purpose. Submissions are append-only from the user's
-- perspective. Admins can delete via service_role if needed.

comment on table project_submissions is
  'Self-attested project submissions for Track 5. One row per (user, project). RLS: own rows writeable, public rows readable by any authenticated user.';

-- ============================================================
-- 3. project_step_progress
-- ============================================================
-- Per-step check-off state. step_slug is a stable string defined in the
-- project seed JSON (e.g. ''install-claude-code''). We do not FK to a
-- project_steps table because steps currently live inside courses.content
-- JSON; if we normalize them later, this column becomes a FK.
create table if not exists project_step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references courses(id) on delete cascade,
  step_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, project_id, step_slug)
);

create index if not exists idx_project_step_progress_user_project
  on project_step_progress(user_id, project_id);

alter table project_step_progress enable row level security;

create policy "project_step_progress_select_own"
  on project_step_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "project_step_progress_insert_own"
  on project_step_progress for insert to authenticated
  with check (auth.uid() = user_id);

-- Delete-own so users can uncheck a step if they change their mind.
create policy "project_step_progress_delete_own"
  on project_step_progress for delete to authenticated
  using (auth.uid() = user_id);

comment on table project_step_progress is
  'Per-step completion state for the Track 5 project shell. One row per (user, project, step_slug). RLS: per-user only.';
