# Track 5 Project Shell — Design Spec

**Status:** Proposed
**Author:** Claude
**Last updated:** 2026-04-21

## Problem

Track 5 "Build Something" is 4 courses x 5 lessons, all project-oriented:
"Setting Up Claude Code", "Building It Together", "Going Live",
"Defining What Your Agent Does", etc. Estimated time per lesson runs
10-30 minutes and the real work happens in Claude Code or a terminal,
not in a browser tab.

The existing lesson player renders project-shaped content through a
Duolingo-style micro-exercise loop: `multiple_choice`, `prompt_lab`,
`scenario_walkthrough`, `speed_prompt`. A user who is actually building a
website is in their editor for an hour, not tapping between cards. The
mechanical mismatch is why Track 5 has the lowest completion of any
track: the UI keeps interrupting the work.

This spec defines a parallel "project shell" UX used only for Track 5,
coexisting with the existing lesson player.

## Goals

1. Let Track 5 users do the project outside the browser, while the
   Academy tracks real progress (steps checked off, project URL
   submitted, XP awarded).
2. Preserve the earned, gamified feel: clear steps, progress bar, a
   satisfying completion state, XP, a badge.
3. Ship a content migration path that reuses the existing JSON bodies as
   step text so we do not rewrite 20 lessons from scratch.
4. Keep the lesson player untouched so Tracks 1-4 are zero-risk.

## Non-goals

- Rewriting Tracks 1-4.
- Video production. Video slots are placeholders that render if present
  in the JSON and degrade gracefully when absent.
- Peer review / moderation. Submissions are self-attested URLs with a
  lightweight gallery; grading is out of scope for v1.

## User flow

1. From `/courses`, user taps a Track 5 card. Route dispatch (see below)
   detects `course.content_type = 'project'` and redirects to
   `/projects/[slug]` instead of `/courses/[slug]`.
2. Project hub loads: title, one-paragraph pitch, "what you'll have when
   you're done" outcome block, list of steps with est time, and a big
   "Start project" button.
3. Step view: steps render as a vertical checklist. Each step is a card
   with a title, markdown body, optional code block, optional embedded
   video/Loom slot, and a "Mark complete" checkbox. Users can work on
   steps in any order, or top-to-bottom. State is per-step-per-user.
4. After all required steps are checked, a "Ship it" panel unlocks. It
   asks for (a) project URL, (b) optional 1-2 sentence description, and
   has an "I shipped it" button.
5. On submit, the user gets a completion screen: confetti, XP award,
   course badge, and a prompt to share or browse the gallery of other
   people's submissions.
6. Gallery view (`/projects/[slug]/gallery`) lists recent submissions as
   cards with the submitted URL, description, and submitter's display
   name. Opt-out supported via a private flag on the submission.

## UI components

All components reuse the existing Tailwind v4 + the "card-f-static",
"badge-f", "mono-f" aesthetic from `LessonPlayerClient.tsx` so Track 5
matches the rest of the app.

- **ProjectHero** — title, description, estimated total time, XP
  reward, difficulty pill, big orange CTA button with offset shadow.
  Drop-in of the existing `card-f-static` with a colored accent bar.
- **StepList** — vertical stack of StepCards connected by a dashed
  line (mirrors the existing course detail page lesson list).
- **StepCard** — title + body (markdown) + optional code snippet with
  copy-to-clipboard button + optional video embed + "Mark complete"
  checkbox. Collapsed state shows only title + est time + status.
  Expanded state shows full body. Uses the existing offset-shadow
  border styling.
- **CodeBlock** — `<pre>` with black ink background, cream mono text
  (same as `LessonPlayerClient` code_example rendering), plus a
  floating "Copy" button that toggles to "Copied!" for 2 seconds.
- **VideoSlot** — if `step.video_url` present, render a 16:9 iframe
  (YouTube, Loom, Vimeo). If absent, render nothing.
- **ShippedPanel** — form with `submission_url` (required, URL
  validation), `submission_description` (optional, 240-char limit),
  and a primary "I shipped it" button. Success state swaps the panel
  for a completion card matching the lesson player's completion
  screen (XP badge, trophy, share button).
- **ProjectGallery** — 3-column grid of recent submissions with
  screenshot preview (auto-generated via `/api/og-preview` or falling
  back to a monogram card), description snippet, submitter handle,
  submitted date.

## Data model

### New column on `courses`

```sql
alter table courses
  add column content_type text not null default 'lesson'
  check (content_type in ('lesson', 'project'));
```

- `'lesson'` (default) preserves all existing behavior. Tracks 1-4 stay
  on the lesson player with zero code changes.
- `'project'` opts a course into the new shell. Track 5's four courses
  flip to `'project'` in the seed script.

### New table: `project_submissions`

One row per (user, project). Users can have at most one active
submission per project. Re-submission overwrites; edit history not
required for v1.

```sql
create table project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references courses(id) on delete cascade,
  submission_url text,
  submission_description text,
  is_public boolean not null default true,
  submitted_at timestamptz not null default now(),
  unique (user_id, project_id)
);

alter table project_submissions enable row level security;

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
```

Gallery query hits the public select policy; per-user reads hit the own
branch. No delete policy on purpose, submissions are append-only.

### New table: `project_step_progress`

One row per (user, project, step). Tracks which steps a user has
checked off. This is intentionally NOT `user_progress` (which is
lesson-keyed and already doing other things).

```sql
create table project_step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references courses(id) on delete cascade,
  step_slug text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, project_id, step_slug)
);

alter table project_step_progress enable row level security;

create policy "project_step_progress_select_own"
  on project_step_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "project_step_progress_insert_own"
  on project_step_progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "project_step_progress_delete_own"
  on project_step_progress for delete to authenticated
  using (auth.uid() = user_id);
```

Delete policy exists so a user can uncheck a step. Step slugs are
stable strings (e.g. `install-claude-code`), matching the seed JSON.
Not a FK to another table because steps live in course.content JSON,
not their own table. If we eventually normalize project steps into a
table, this column becomes a FK.

## Coexistence with the lesson player

Only the course entry point needs a switch. Both routes exist in
parallel and never overlap.

- `/[locale]/(app)/courses/[slug]/page.tsx` (existing): checks
  `course.content_type`. If `'project'`, `redirect('/projects/' + slug)`.
  Otherwise it renders the current lesson-list UI unchanged.
- `/[locale]/(app)/projects/[slug]/page.tsx` (new): renders the project
  hub + step view.

`/[locale]/(app)/courses/[slug]/[lesson]/page.tsx` is unchanged. Track 5
courses will no longer have lesson rows in the DB after cutover, so
nothing ever deep-links there. Until cutover, both shells are reachable
and the new one is opt-in via `/projects/build-a-website`.

## Rejected alternatives

**"Just shorten the lessons."** The problem is format, not length. A
5-minute lesson with `prompt_lab` exercises about "what should you tell
Claude Code next" still pulls the user out of Claude Code. Cutting the
word count does not close the gap. It also does not solve the
self-attestation problem, which is what actually drives the feeling of
completion for a project.

**"Make it Udemy-style video."** Video is expensive to produce, expensive
to maintain (every Claude Code UI change breaks the footage), and
strictly worse at the part users struggle with, which is their own
project context. A 10-minute video of someone else's portfolio site
does not help a user who is building a pricing page for a CRM. Video is
fine as an *optional* step artifact (see VideoSlot) but it should not
be the medium.

**"Embed Claude Code in an iframe."** Claude Code is a terminal tool
that needs local filesystem and auth. An iframe is not the right
abstraction. The correct move is to send users to their own terminal
and track progress via self-attestation.

**"Deep integrations with GitHub / Vercel to auto-detect shipping."**
Tempting, but v1 must not block on OAuth scopes with third parties.
Self-attestation with a URL field is good enough for the first cohort
and unblocks the rest of the design. Auto-detection is a follow-up.

## Migration path

Existing Track 5 content lives in
`content/seed/track5-build-something.json` as four courses x five
lessons each. Each lesson has a `content.sections` array with `text`,
`exercise`, and `summary` entries.

**Reusable as step text:** all `type: "text"` and `type: "summary"`
`content` fields. These are already HTML-light prose about what to do.
Each lesson maps to one or two project steps, where the step body is
the concatenated non-exercise prose.

**Needs rewriting:** every `type: "exercise"` section. The quiz-format
exercises do not survive the transition. The `scenario_walkthrough`
bodies have the most value and can sometimes be rewritten as prose
("common mistakes") or dropped. Exercises are where the current format
fights the user the most.

**New content needed:** for each of the four projects, we need:
- A one-paragraph "what you'll have when you're done" outcome statement.
- A per-step "done when" criterion so the user knows they can check the
  box. Usually one sentence.
- Optional 30-60 second Loom URLs for 1-2 tricky steps (not blocking).
- A single submission prompt: what does "shipped" mean for this project?
  For Course 1 it's a public URL. For Course 2 (agent) it's a short
  description of what the agent does.

**Port volume:** approximately 20 lessons worth of HTML bodies get
rewritten or concatenated into roughly 6-10 steps per project. One
content pass per project, review, ship. Course 1 "Build a Website"
ports first as the proof of concept — the seed file
`content/seed/project1-build-a-website.json` is included in the MVP.

## Rollout

1. Land migration + new route behind `content_type`. No existing course
   is flipped.
2. Port Course 1 ("Build a Website") to the project shell. Leave it
   accessible at `/projects/build-a-website`. Track 5 still visible via
   the lesson player for A/B comparison.
3. Review with Reid. If completion improves, port Courses 2-4.
4. Flip `content_type` to `'project'` for all four Track 5 courses in
   a single seed commit. The course detail page redirects to
   `/projects/[slug]` from that moment.
5. Follow-ups: OG image generation for gallery, optional GitHub/Vercel
   auto-detection, peer "first five submissions reviewed" queue.
