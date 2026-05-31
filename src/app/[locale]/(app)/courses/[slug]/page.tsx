import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import {
  BookOpen,
  Clock,
  Zap,
  CheckCircle,
  ChevronLeft,
  Play,
} from 'lucide-react';
import { TRACK_INFO } from '@/types';
import type { Track, LessonStatus } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import { getUser, isPro, getCompletedCourseCount } from '@/lib/auth';
import { PLATFORM } from '@/lib/config';
import { PaywallCta } from '@/components/PaywallCta';
import { CompletionCertificate } from '@/components/CompletionCertificate';
import { CourseJsonLd } from '@/components/CourseJsonLd';
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd';

// Force dynamic rendering — course data changes and we need request context
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// SEO: generateMetadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: course } = await supabase
    .from('courses')
    .select('title, description, track, difficulty')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('platform', PLATFORM)
    .single();

  if (!course) {
    return { title: 'Course Not Found | Learn to GPT' };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://learntogpt.com';
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? '' : `/${loc}`}/courses/${slug}`;

  const title = `${course.title} | Learn to GPT`;
  const description =
    course.description || `Learn ${course.title} on Learn to GPT`;

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
          alt: course.title,
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

// ---------------------------------------------------------------------------
// Design F difficulty badge colors (colorful pills)
// ---------------------------------------------------------------------------
const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-600' },
  intermediate: { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-500' },
  advanced:     { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-500' },
  expert:       { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-600' },
};

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

const TRACK_ICON_BG: Record<Track, string> = {
  why_claude:         'bg-game-blue',
  three_levels:       'bg-teal',
  essentials:         'bg-game-purple',
  level_up:           'bg-orange',
  build_something:    'bg-gold',
  practitioner_setup: 'bg-orange',
  advanced_workflows: 'bg-cyan-600',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const t = await getTranslations('courses');
  const locale = await getLocale();

  // Fetch course by slug, scoped to the user's locale.
  // DB has (slug, locale) composite unique after migration 012, so the same
  // slug can have multiple rows (one per translated locale). Filtering by
  // locale here ensures .single() returns exactly one row.
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, slug, description, track, difficulty, order_index, is_free, icon, lesson_count, campaign_order, level_required, prerequisite_slug, created_at')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('platform', PLATFORM)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // Fetch lessons for this course
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, course_id, title, slug, description, order_index, xp_reward, estimated_minutes, is_free, created_at')
    .eq('course_id', course.id)
    .order('order_index');

  const lessonList = lessons ?? [];

  // ── Auth + paywall ────────────────────────────────────────────────────────
  // Paywall v1: first 2 completed courses are free; 3rd+ requires one-time
  // payment. Grace rule: if the user has *any* progress in this course
  // (started ≥ 1 lesson) they are never blocked — they can always finish.

  const currentUser = await getUser();
  let userIsPro = false;
  let showPaywall = false;
  let completedCourseCount = 0;

  if (currentUser) {
    userIsPro = await isPro(currentUser.id);
  }

  // Fetch user progress if authenticated
  let progressMap = new Map<string, LessonStatus>();
  // Track completion timestamps so we can show the latest completion date
  // on the certificate.
  let completionDateMap = new Map<string, string>();
  let userDisplayName = "Learner";

  if (currentUser) {
    // Fetch display name for certificate
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    if (profileData?.display_name) {
      userDisplayName = profileData.display_name;
    } else {
      userDisplayName = currentUser.email?.split('@')[0] ?? 'Learner';
    }

    const lessonIds = lessonList.map((l) => l.id);
    if (lessonIds.length > 0) {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id, status, completed_at')
        .eq('user_id', currentUser.id)
        .in('lesson_id', lessonIds);

      if (progressData) {
        for (const p of progressData) {
          progressMap.set(p.lesson_id, p.status as LessonStatus);
          if (p.completed_at) {
            completionDateMap.set(p.lesson_id, p.completed_at as string);
          }
        }
      }
    }

    // Determine if this course is paywalled for this user.
    // Block only when: not pro AND user has NO progress in this course yet.
    if (!userIsPro) {
      const hasStartedThisCourse = lessonList.some((l) => progressMap.has(l.id));
      if (!hasStartedThisCourse) {
        completedCourseCount = await getCompletedCourseCount(currentUser.id);
        showPaywall = completedCourseCount >= 2;
      }
    }
  }

  // Determine lesson statuses — Wave 2: no locked state, every lesson is accessible
  const lessonsWithStatus = lessonList.map((lesson) => {
    const userStatus = progressMap.get(lesson.id);
    const lessonIsFree = !!lesson.is_free;
    const status: LessonStatus = userStatus ?? 'available';

    return { ...lesson, status, is_free: lessonIsFree };
  });

  const trackInfo = TRACK_INFO[course.track as Track];
  const completedCount = lessonsWithStatus.filter((l) => l.status === 'completed').length;
  const totalLessons = lessonsWithStatus.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Certificate: show when ALL lessons in the course are completed and user is logged in
  const isCourseComplete =
    currentUser !== null && totalLessons > 0 && completedCount === totalLessons;

  // Use the latest completion timestamp among all lessons in this course
  const latestCompletionDate = (() => {
    if (!isCourseComplete) return new Date().toISOString();
    const dates = lessonsWithStatus
      .map((l) => completionDateMap.get(l.id))
      .filter((d): d is string => Boolean(d));
    if (dates.length === 0) return new Date().toISOString();
    return dates.sort().at(-1)!;
  })();
  const totalMinutes = lessonsWithStatus.reduce((sum, l) => sum + (l.estimated_minutes ?? 0), 0);
  const totalXP = lessonsWithStatus.reduce((sum, l) => sum + (l.xp_reward ?? 0), 0);
  const diffStyle = DIFFICULTY_STYLES[course.difficulty] ?? DIFFICULTY_STYLES.beginner;

  // Determine CTA
  const inProgressLesson = lessonsWithStatus.find((l) => l.status === 'in_progress');
  const firstAvailable = lessonsWithStatus.find((l) => l.status === 'available');
  const continueLesson = inProgressLesson ?? firstAvailable ?? lessonsWithStatus[0];
  const ctaLabel = completedCount > 0 ? t('ctaContinue') : t('ctaStart');

  // Chunky segmented progress bar
  const segments = totalLessons;

  // Structured data
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://learntogpt.com';
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  const courseUrl = `${baseUrl}${localePrefix}/courses/${course.slug}`;
  const curriculumUrl = `${baseUrl}${localePrefix}/curriculum`;
  const educationalLevel = trackToEducationalLevel(course.track);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* JSON-LD structured data */}
      <CourseJsonLd
        name={course.title}
        description={course.description ?? ''}
        educationalLevel={educationalLevel}
        language={locale}
        lessonCount={totalLessons}
        isFree={!!course.is_free}
        url={courseUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Curriculum', url: curriculumUrl },
          { name: course.title, url: courseUrl },
        ]}
      />

      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" />
        {t('backAll')}
      </Link>

      {/* Hero card */}
      <div className="card-f-static overflow-hidden">
        {/* Accent bar */}
        <div className={`h-2 w-full ${TRACK_ICON_BG[course.track as Track]}`} />

        <div className="space-y-5 p-6">
          {/* Icon + title row */}
          <div className="flex items-start gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-ink text-white ${TRACK_ICON_BG[course.track as Track]}`}
            >
              <BookOpen className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold leading-tight text-ink">
                {course.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} rounded-full border-2 px-3 py-0.5 text-xs font-bold capitalize`}
            >
              {course.difficulty}
            </span>
            <span className="rounded-full border-2 border-border bg-warm-white px-3 py-0.5 text-xs font-bold text-muted-foreground">
              {trackInfo.name}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <BookOpen className="size-3" />
              {t('lessonsCount', { count: totalLessons })}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Clock className="size-3" />
              {t('minutesShort', { minutes: totalMinutes })}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-bold text-orange">
              <Zap className="size-3" />
              {t('xpShort', { xp: totalXP })}
            </span>
            {course.is_free && (
              <span className="badge-f border-teal bg-emerald-50 text-teal">
                {t('badgeFree')}
              </span>
            )}
          </div>

          {/* Chunky segmented progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-ink">{t('progressLabel')}</span>
              <span className="mono-f text-muted-foreground">
                {t('progressLessons', { done: completedCount, total: totalLessons })}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: segments }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 rounded-md border-2 border-ink"
                  style={{
                    background: i < completedCount ? '#2d7d6f' : '#f0ebe3',
                  }}
                />
              ))}
            </div>
            <p className="mono-f text-right text-xs font-bold text-teal">
              {progressPct}%
            </p>
          </div>

          {/* CTA button */}
          {continueLesson && (
            <Link href={`/courses/${course.slug}/${continueLesson.slug}`}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-8 py-3.5 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#1c1917]"
              >
                <Play className="size-5" />
                {ctaLabel}
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Paywall CTA — shown when user has 2+ completed courses and hasn't paid */}
      {showPaywall && (
        <PaywallCta completedCount={completedCourseCount} />
      )}

      {/* Lesson list -- level progression */}
      {!showPaywall && (
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-ink">
          {t('levelProgressionHeading')}
        </h2>

        <div className="relative">
          {/* Dashed connector line */}
          <div
            className="absolute left-6 top-6 bottom-6 w-0 border-l-2 border-dashed border-border"
            aria-hidden="true"
          />

          <div className="space-y-0">
            {lessonsWithStatus.map((lesson, index) => {
              // Wave 2: no `locked` state — every lesson is accessible.
              const isCompleted = lesson.status === 'completed';
              const isInProgress = lesson.status === 'in_progress';
              const isLast = index === lessonsWithStatus.length - 1;

              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/${lesson.slug}`}
                  className="group relative block"
                >
                  <div
                    className={`relative flex items-center gap-4 rounded-2xl border-3 p-4 transition-all ${
                      isCompleted
                        ? 'border-teal bg-emerald-50 shadow-[3px_3px_0px_#2d7d6f]'
                        : isInProgress
                        ? 'border-orange bg-orange-50 shadow-[3px_3px_0px_#e07a3a]'
                        : 'border-ink bg-cream shadow-[3px_3px_0px_#1c1917] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917]'
                    } ${isLast ? '' : 'mb-3'}`}
                  >
                    {/* Node circle */}
                    <div className="relative z-10 flex size-12 shrink-0 items-center justify-center">
                      {isCompleted ? (
                        <div className="flex size-12 items-center justify-center rounded-full border-3 border-teal bg-teal text-white">
                          <CheckCircle className="size-6" />
                        </div>
                      ) : isInProgress ? (
                        <div className="flex size-12 items-center justify-center rounded-full border-3 border-orange bg-orange text-white">
                          <Play className="size-5" />
                        </div>
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-full border-3 border-ink bg-cream text-ink">
                          <span className="mono-f text-lg font-bold">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate text-ink">
                        {lesson.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {lesson.description}
                      </p>
                    </div>

                    {/* Meta badges */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="mono-f flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {lesson.estimated_minutes ?? 0}m
                      </span>
                      <span className="mono-f flex items-center gap-1 text-xs font-bold text-orange">
                        <Zap className="size-3" />
                        {lesson.xp_reward ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Completion Certificate — shown when every lesson in the course is done */}
      {isCourseComplete && (
        <CompletionCertificate
          courseName={course.title}
          userName={userDisplayName}
          completedDate={latestCompletionDate}
        />
      )}
    </div>
  );
}
