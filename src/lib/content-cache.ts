import { unstable_cache } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { PLATFORM } from '@/lib/config';

/**
 * Cached, request-independent reads of *content* (courses, lessons, exercises).
 *
 * Lesson/course pages are `force-dynamic` and were paying several sequential
 * Supabase round-trips per render, which — under the canary's concurrent burst —
 * tipped cold Vercel Hobby functions past its 25s ceiling. The content is
 * identical for every visitor; only the auth/paywall/progress layer is per-user.
 * So content reads are cached here and the per-user logic stays live in the page.
 *
 * Safety invariants (see claude-academy/src/lib/content-cache.ts for the full
 * rationale — this is the learntogpt fork, matching its query shapes):
 *  - `unstable_cache` is request-independent → COOKIELESS anon client. Content
 *    tables are anon-readable via RLS and carry no per-user state, so caching
 *    them never leaks or mixes users.
 *  - Row-not-found (PGRST116) → `null` → page calls `notFound()`. Any other db
 *    error THROWS → error boundary (canary catches), never cached as a fake 404.
 *  - Staleness bounded to `CONTENT_REVALIDATE`s, self-healing. Tagged `content`.
 */

const CONTENT_REVALIDATE = 300;

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

function isRealError(error: { code?: string } | null): boolean {
  return !!error && error.code !== 'PGRST116';
}

// Lesson page content: course + lesson + exercises + explanations + nav list.
// NOTE: this fork does not filter lessons by status='published' and has no
// tutor_manifest_url column — kept identical to the page's original queries.
export const getLessonContent = unstable_cache(
  async (locale: string, slug: string, lessonSlug: string) => {
    const supabase = anonClient();

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title, is_free, track')
      .eq('slug', slug)
      .eq('locale', locale)
      .eq('platform', PLATFORM)
      .single();
    if (isRealError(courseError)) {
      throw new Error(`lesson content: course query failed: ${courseError!.message}`);
    }
    if (!course) return null;

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(
        'id, course_id, title, slug, description, order_index, xp_reward, estimated_minutes, is_free, content_json, created_at'
      )
      .eq('course_id', course.id)
      .eq('slug', lessonSlug)
      .single();
    if (isRealError(lessonError)) {
      throw new Error(`lesson content: lesson query failed: ${lessonError!.message}`);
    }
    if (!lesson) return null;

    const [
      { data: exercisesRaw },
      { data: explanationsRaw },
      { data: allLessons },
    ] = await Promise.all([
      supabase
        .from('v_exercises_safe')
        .select('id, lesson_id, type, order_index, prompt, options_json, hints_json, xp_reward, game_data')
        .eq('lesson_id', lesson.id)
        .order('order_index'),
      supabase.from('exercises').select('id, explanation').eq('lesson_id', lesson.id),
      supabase
        .from('lessons')
        .select('slug, title')
        .eq('course_id', course.id)
        .order('order_index'),
    ]);

    return {
      course,
      lesson,
      exercisesRaw: exercisesRaw ?? [],
      explanationsRaw: explanationsRaw ?? [],
      allLessons: allLessons ?? [],
    };
  },
  ['lesson-content'],
  { tags: ['content'], revalidate: CONTENT_REVALIDATE }
);

// Course page content: course + lessons list (no status filter in this fork).
export const getCourseContent = unstable_cache(
  async (locale: string, slug: string) => {
    const supabase = anonClient();

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(
        'id, title, slug, description, track, difficulty, order_index, is_free, icon, lesson_count, campaign_order, level_required, prerequisite_slug, created_at'
      )
      .eq('slug', slug)
      .eq('locale', locale)
      .eq('platform', PLATFORM)
      .single();
    if (isRealError(courseError)) {
      throw new Error(`course content: course query failed: ${courseError!.message}`);
    }
    if (!course) return null;

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, course_id, title, slug, description, order_index, xp_reward, estimated_minutes, is_free, created_at')
      .eq('course_id', course.id)
      .order('order_index');

    return { course, lessons: lessons ?? [] };
  },
  ['course-content'],
  { tags: ['content'], revalidate: CONTENT_REVALIDATE }
);
