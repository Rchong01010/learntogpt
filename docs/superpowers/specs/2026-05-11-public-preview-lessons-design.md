# Public Preview Lessons — Design Spec

**Date:** 2026-05-11
**Goal:** Let visitors experience flagship lessons without signing up, then convert via "save your progress" XP loss aversion.

## Problem

GA data (Apr 11 - May 8): 196 active users, 195 new (99.5%). 40% EN bounce. Only 8/196 reach pricing. Only 5 view courses. Nobody comes back. The signup wall blocks visitors from ever experiencing the product.

## Design

### 1. Public Lesson Access

**Lesson page** (`src/app/[locale]/(app)/courses/[slug]/[lesson]/page.tsx`):
- Before calling `requireUser()`, fetch the lesson and check `is_free`.
- If `is_free === true`, skip `requireUser()` — render the lesson for anonymous visitors.
- If `is_free === false`, call `requireUser()` as today (redirect to sign-in).
- All other data fetching (exercises via `v_exercises_safe`, content, etc.) stays the same — it uses `createSupabaseServer()` which works without auth for public-read RLS tables.

**Exercise check endpoint** (`src/app/api/exercises/check/route.ts`):
- Currently requires auth (`user` check on line 19).
- For anonymous users on free lessons: allow exercise checks without auth.
- Rate limit by IP instead of user ID for anonymous requests.
- Skip `recordExerciseAttempt()` for anonymous users (no user_id to record against).
- Security: exercise answers are only disclosed on correct submission, same as today.

**Progress endpoint** (`src/app/api/progress/route.ts`):
- No changes. Still requires auth. Anonymous users don't write progress.

### 2. Flagship Lessons (2 per locale, 14 total)

SQL migration sets `is_free = true` on:
- **Beginner:** First lesson in `what-is-claude` course (each locale)
- **Intermediate:** First lesson in an intermediate-level course (each locale)

The migration queries by course slug + locale to hit exactly the right rows.

### 3. XP Animations (Cosmetic, Anonymous)

The `LessonPlayerClient` already shows XP animations on exercise completion. For anonymous users:
- Animations fire as normal ("+25 XP" etc.) — purely visual.
- No server-side XP writes (no user_id).
- No localStorage persistence needed — it's cosmetic per-session only.

### 4. Conversion CTA on Lesson Completion

After an anonymous user completes a free lesson, show an inline CTA:
- **Headline:** "You just earned [X] XP — sign up to keep it"
- **Subtext:** "Create a free account to save your progress, unlock all courses, and start building your streak"
- **Primary CTA:** "Sign Up Free" → `/sign-up`
- **Secondary:** "Continue Exploring" → `/courses`

This replaces/augments whatever the current lesson-complete state shows for anonymous users.

Implementation: Add a `SignUpPromptCta` component rendered in `LessonPlayerClient` when user is anonymous and lesson is complete. Pass `isAnonymous` prop from the server component (based on whether `getUser()` returned null).

### 5. XP Credit on Signup

When a new user signs up and lands on the dashboard for the first time (XP = 0):
- Check which free lessons exist.
- Don't auto-credit — we have no proof they completed them.
- Instead, the "save your progress" framing is aspirational. When they re-do the lesson signed in, they earn real XP.
- This is simpler than replay logic and avoids gaming.

**Alternative (if we want auto-credit later):** Store completed lesson slugs in a cookie or URL param during the anonymous session, pass through signup flow, credit on first dashboard load. But skip this for v1.

### 6. Homepage CTA Updates

Update homepage CTAs to link directly to flagship lessons instead of `/sign-up`:
- "Get Started" (Beginner path) → first free beginner lesson URL
- "Try a Lesson" or equivalent → first free intermediate lesson URL
- Keep existing "Sign Up" link in nav for users who want to go direct.

### 7. Files Changed

| File | Change |
|------|--------|
| `src/app/[locale]/(app)/courses/[slug]/[lesson]/page.tsx` | Conditional `requireUser()` based on `is_free` |
| `src/app/api/exercises/check/route.ts` | Allow anonymous checks on free lessons, IP rate limit |
| `src/components/SignUpPromptCta.tsx` | NEW — conversion CTA component |
| `src/app/[locale]/(app)/courses/[slug]/[lesson]/LessonPlayerClient.tsx` | Render `SignUpPromptCta` when anonymous + lesson complete |
| Homepage component(s) | Update CTAs to point to free lessons |
| `supabase/migrations/022_public_preview_lessons.sql` | NEW — mark flagship lessons as `is_free = true` |

### 8. What Does NOT Change

- Dashboard, profile, progress tracking — all still require auth
- Non-free lessons — still require auth
- XP/streak/achievement server writes — still require auth
- Course listing page — already works without auth
- RLS policies — lessons and exercises already have public read
