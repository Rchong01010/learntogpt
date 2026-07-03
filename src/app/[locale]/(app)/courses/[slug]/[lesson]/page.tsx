import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { getLessonContent } from '@/lib/content-cache';
import { requireUser, getUser, isPro } from '@/lib/auth';
import { LessonPlayerClient } from './LessonPlayerClient';
import { AdvancedTrackEndCta } from '@/components/AdvancedTrackEndCta';
import { AccountGate } from '@/components/AccountGate';
import { LessonJsonLd } from '@/components/LessonJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';
import type { Exercise, ExerciseType, LessonContent, ClientExercise } from '@/types';

// Force dynamic rendering — lesson data changes and we need request context
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// SEO: generateMetadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lesson: string }>;
}): Promise<Metadata> {
  const { locale, slug, lesson: lessonSlug } = await params;

  // Reuse the cached content read — same (locale, slug, lessonSlug) as the page
  // body, so metadata and render share one cache entry instead of re-querying.
  const content = await getLessonContent(locale, slug, lessonSlug);
  if (!content) {
    return { title: 'Lesson Not Found | Learn to GPT' };
  }
  const { course, lesson } = content;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://learntogpt.com';
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? '' : `/${loc}`}/courses/${slug}/${lessonSlug}`;

  const title = `${lesson.title} — ${course.title} | Learn to GPT`;
  const description =
    lesson.description ||
    `Learn ${lesson.title} in the ${course.title} course on Learn to GPT`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: lesson.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-default.png`],
    },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, pathForLocale(loc)])
      ),
    },
  };
}

// Wave 2 (GTM bible v2.0 §3): tracks that get the soft 1:1 CTA at the end
// of the course's final lesson. `level_up` + `build_something` together
// form the Advanced Practitioner pathway.
const ADVANCED_TRACKS = new Set(['level_up', 'build_something', 'practitioner_setup']);

/** Map track key to schema.org educationalLevel */
function trackToEducationalLevel(track: string): string {
  switch (track) {
    case 'why_claude':
    case 'practitioner_setup':
      return 'Beginner';
    case 'three_levels':
    case 'essentials':
      return 'Intermediate';
    case 'level_up':
    case 'build_something':
    case 'advanced_workflows':
      return 'Advanced';
    default:
      return 'Beginner';
  }
}

// ---------------------------------------------------------------------------
// Server component -- fetches real data and passes to client island
// ---------------------------------------------------------------------------
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson: lessonSlug } = await params;
  const supabase = await createSupabaseServer();
  const locale = await getLocale();

  // Content (course + lesson + exercises + nav list) is identical for every
  // visitor → cached, cookieless read (see content-cache.ts). The per-user
  // paywall/progress logic below stays live. Real DB error throws (→ error
  // boundary, canary catches); genuine not-found → null → notFound().
  const content = await getLessonContent(locale, slug, lessonSlug);
  if (!content) {
    notFound();
  }
  const { course, lesson: lessonData, exercisesRaw, explanationsRaw, allLessons } = content;

  // Public preview: free lessons are accessible without sign-in so anonymous
  // visitors can experience the product. Non-free lessons still require auth.
  let isAnonymous = false;
  let authenticatedUser: Awaited<ReturnType<typeof getUser>> = null;
  if (lessonData.is_free) {
    authenticatedUser = await getUser();
    isAnonymous = !authenticatedUser;
  } else {
    // requireUser() redirects if not signed in, so this always returns a User
    authenticatedUser = await requireUser() as Awaited<ReturnType<typeof getUser>>;
  }

  // ── Email capture gate ───────────────────────────────────────────────────
  // Anonymous users can preview the first 2 lessons (order_index 0, 1).
  // Lesson 3+ (order_index >= 2) requires a free account so we capture their
  // email for re-engagement. This is NOT a paywall — just account creation.
  if (isAnonymous && lessonData.order_index >= 2) {
    return (
      <AccountGate
        courseSlug={slug}
        lessonSlug={lessonSlug}
        lessonTitle={lessonData.title}
      />
    );
  }

  // ── Paywall gate ─────────────────────────────────────────────────────────
  // If the user is authenticated and not pro, check whether they have any
  // existing progress in this course (grace rule). If not started → redirect
  // to the course page which shows the PaywallCta.
  if (authenticatedUser) {
    const userIsPro = await isPro(authenticatedUser.id);
    if (!userIsPro) {
      // Fetch all lesson IDs in this course to check for existing progress
      const { data: courseLessonIds } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', course.id);

      const ids = (courseLessonIds ?? []).map((l) => l.id);
      let hasProgress = false;
      if (ids.length > 0) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', authenticatedUser.id)
          .in('lesson_id', ids)
          .limit(1);
        hasProgress = (existingProgress ?? []).length > 0;
      }

      if (!hasProgress) {
        // No prior progress in this course — enforce paywall by redirecting to
        // the course overview page where PaywallCta is rendered.
        redirect(`/courses/${slug}`);
      }
    }
  }

  const explanationMap = new Map(
    (explanationsRaw ?? []).map((e) => [e.id, e.explanation ?? ''])
  );

  // Map DB exercise fields to our Exercise type
  // Handle 'question' vs 'prompt' field, and DB exercise types
  const exercises: Exercise[] = (exercisesRaw ?? []).map((ex) => {
    // Map legacy DB exercise type names to our ExerciseType union
    const typeMap: Record<string, ExerciseType> = {
      code_input: 'code_exercise',
      code_challenge: 'code_exercise',
      fill_in_blank: 'fill_blank',
      ordering: 'drag_drop',
    };
    const mappedType: ExerciseType = typeMap[ex.type] ?? (ex.type as ExerciseType);

    return {
      id: ex.id,
      lesson_id: ex.lesson_id,
      type: mappedType,
      order_index: ex.order_index,
      prompt: ex.prompt ?? '',
      options: ex.options_json ?? null,
      correct_answer: ex.game_data ?? '',
      explanation: explanationMap.get(ex.id) ?? '',
      hints: ex.hints_json ?? [],
      xp_reward: ex.xp_reward ?? 0,
    } satisfies Exercise;
  });

  const courseLessons = (allLessons ?? []).map((l) => ({
    slug: l.slug,
    title: l.title,
  }));

  // Parse lesson content - handle both content and content_json columns
  const rawContent = lessonData.content_json;
  let lessonContent: LessonContent;

  if (typeof rawContent === 'string') {
    try {
      lessonContent = JSON.parse(rawContent);
    } catch {
      lessonContent = { sections: [] };
    }
  } else if (rawContent && typeof rawContent === 'object') {
    lessonContent = rawContent as LessonContent;
  } else {
    lessonContent = { sections: [] };
  }

  // Strip correct_answer before sending to client -- answers are checked
  // server-side via /api/exercises/check.
  // For interactive game types (flash_cards, speed_round, matching_pairs),
  // pass correct_answer as game_data since it contains rendering content.
  const GAME_DATA_TYPES = new Set([
    'flash_cards', 'speed_round', 'matching_pairs', 'word_scramble',
    'typing_challenge', 'whack_a_mole', 'prompt_builder', 'conversation_sim', 'spot_the_difference',
    'prompt_lab', 'speed_prompt', 'scenario_walkthrough',
  ]);

  const clientExercises: ClientExercise[] = exercises.map(
    ({ correct_answer, ...rest }) => {
      const base = {
        ...rest,
        ...(GAME_DATA_TYPES.has(rest.type) ? { game_data: correct_answer } : {}),
      };
      // For fill_blank without explicit options, inject the correct answer into options
      // so the word bank always contains it (distractors are generated client-side)
      if (rest.type === 'fill_blank' && (!rest.options || rest.options.length === 0) && correct_answer) {
        // correct_answer may be JSON (e.g. '["word1","word2"]') or a plain string
        try {
          const parsed = JSON.parse(correct_answer);
          base.options = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          base.options = [correct_answer];
        }
      }
      return base;
    },
  );

  // Wave 2: render the soft 1:1 CTA on completion when this is the LAST
  // lesson in an Advanced Practitioner course (level_up / build_something).
  const isLastLesson =
    courseLessons.length > 0 &&
    courseLessons[courseLessons.length - 1]?.slug === lessonSlug;
  const showTrackEndCta =
    isLastLesson && ADVANCED_TRACKS.has(course.track as string);

  // Structured data for SEO / AEO
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://learntogpt.com';
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  const courseUrl = `${baseUrl}${localePrefix}/courses/${slug}`;
  const lessonUrl = `${baseUrl}${localePrefix}/courses/${slug}/${lessonSlug}`;
  const curriculumUrl = `${baseUrl}${localePrefix}/curriculum`;
  const educationalLevel = trackToEducationalLevel(course.track as string);

  return (
    <>
      <LessonJsonLd
        name={lessonData.title}
        description={lessonData.description ?? `Learn ${lessonData.title} in the ${course.title} course`}
        educationalLevel={educationalLevel}
        language={locale}
        isFree={!!lessonData.is_free}
        url={lessonUrl}
        courseName={course.title}
        courseUrl={courseUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Curriculum', url: curriculumUrl },
          { name: course.title, url: courseUrl },
          { name: lessonData.title, url: lessonUrl },
        ]}
      />
      <LessonPlayerClient
        courseSlug={slug}
        lessonSlug={lessonSlug}
        lessonId={lessonData.id}
        lessonTitle={lessonData.title}
        lessonContent={lessonContent}
        exercises={clientExercises}
        courseLessons={courseLessons}
        trackEndCta={showTrackEndCta ? <AdvancedTrackEndCta /> : undefined}
        isAnonymous={isAnonymous}
      />
    </>
  );
}
