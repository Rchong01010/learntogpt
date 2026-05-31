'use client';

import { useState, useMemo, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle,
  BookOpen,
  Trophy,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import { ShareModal } from '@/components/social/ShareModal';
import { BadgeUnlockedCelebration } from '@/components/gamification/BadgeUnlockedCelebration';
import { SanitizedHtml } from '@/components/SanitizedHtml';
import { SignUpPromptCta } from '@/components/SignUpPromptCta';
import { MidLessonSignupBar } from '@/components/MidLessonSignupBar';
import { fireFunnelEvent } from '@/components/FunnelTracker';
import { SocialProofCounter } from '@/components/SocialProofCounter';
import { saveLocalProgress } from '@/lib/local-progress';
import type {
  ClientExercise,
  ExerciseEventType,
  ExerciseResult,
  LessonContent,
  LessonXpBreakdown,
} from '@/types';

// ---------------------------------------------------------------------------
// Per-exercise analytics (migration 017 + /api/events/exercise).
//
// Fire-and-forget by design: a failed analytics POST must never block lesson
// flow. Uses navigator.sendBeacon for unload / visibility-change paths because
// fetch() during unload is unreliable (browsers kill pending requests); for
// in-page events we use plain fetch + silent catch.
// ---------------------------------------------------------------------------
function fireExerciseEvent(
  exerciseId: string,
  lessonId: string,
  eventType: ExerciseEventType,
  timeSpentMs?: number,
): void {
  if (typeof window === 'undefined') return;

  const payload: Record<string, unknown> = {
    exercise_id: exerciseId,
    lesson_id: lessonId,
    event_type: eventType,
  };
  if (typeof timeSpentMs === 'number' && timeSpentMs >= 0) {
    payload.time_spent_ms = Math.floor(timeSpentMs);
  }

  const body = JSON.stringify(payload);

  // For unload-style events use sendBeacon if available — fetch during unload
  // gets cancelled by most browsers. Blob + application/json because
  // sendBeacon doesn't expose a headers argument.
  if (
    eventType === 'abandoned' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/events/exercise', blob);
      return;
    } catch {
      // Fall through to fetch below — sendBeacon can throw on size limit, etc.
    }
  }

  // Fire-and-forget fetch. keepalive gives us a best-effort delivery on
  // unload for the fetch fallback path. Silent catch — analytics must never
  // surface to the user.
  fetch('/api/events/exercise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    /* swallow — analytics must never break lesson flow */
  });
}

// ---------------------------------------------------------------------------
// Client component — step-by-step game flow
// ---------------------------------------------------------------------------
interface ProgressResponse {
  success: boolean;
  new_xp: number;
  achievements: string[];
  /** Null unless this response is for a first-time lesson completion. */
  xp_breakdown: LessonXpBreakdown | null;
}

interface LessonPlayerClientProps {
  courseSlug: string;
  lessonSlug: string;
  lessonId: string;
  lessonTitle: string;
  lessonContent: LessonContent;
  exercises: ClientExercise[];
  courseLessons: { slug: string; title: string }[];
  /**
   * Optional CTA rendered on the completion screen when the lesson is the
   * last in a track that triggers it (wave 2: `level_up` + `build_something`).
   * Pre-rendered server-side so translations resolve via next-intl.
   */
  trackEndCta?: ReactNode;
  /** True when the visitor is not signed in (free preview lesson). */
  isAnonymous?: boolean;
}

export function LessonPlayerClient({
  courseSlug,
  lessonSlug,
  lessonId,
  lessonTitle,
  lessonContent,
  exercises,
  courseLessons,
  trackEndCta,
  isAnonymous,
}: LessonPlayerClientProps) {
  const t = useTranslations('lessons');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [serverXp, setServerXp] = useState<number | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const hasSentInProgress = useRef(false);

  // ---------------------------------------------------------------------------
  // Per-exercise event tracking (migration 017).
  //
  // startedAt: when this exercise first became active on screen. Used to
  //   compute time_spent_ms on completion or abandon.
  // startedFired / completedFired: dedupe so we never send the same
  //   (exercise, event_type) twice (e.g. React StrictMode double-invokes,
  //   visibility toggling, mount/unmount churn).
  // ---------------------------------------------------------------------------
  const startedAtRef = useRef<Map<string, number>>(new Map());
  const startedFiredRef = useRef<Set<string>>(new Set());
  const completedFiredRef = useRef<Set<string>>(new Set());
  const abandonedFiredRef = useRef<Set<string>>(new Set());

  // Step-by-step game state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepUnlocked, setStepUnlocked] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  // Funnel tracking: fire once per session for first-ever lesson/exercise events.
  // Deduplication is handled server-side in /api/events/funnel.
  const funnelLessonFiredRef = useRef(false);
  const funnelExerciseStartFiredRef = useRef(false);
  const funnelExerciseCompleteFiredRef = useRef(false);

  const totalSteps = lessonContent.sections.length;
  const isComplete = currentStep >= totalSteps;

  // Build a mapping: for each section index that is an exercise,
  // which exercise (by order) does it correspond to?
  const exerciseIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    for (let i = 0; i < lessonContent.sections.length; i++) {
      if (lessonContent.sections[i].type === 'exercise') {
        map.set(i, counter);
        counter++;
      }
    }
    return map;
  }, [lessonContent.sections]);

  const exerciseSections = lessonContent.sections.filter(
    (s): s is { type: 'exercise'; exercise_id: string } => s.type === 'exercise',
  );
  const totalExercises = exerciseSections.length;

  // Fire funnel_first_lesson_start on mount (deduplicated server-side)
  useEffect(() => {
    if (funnelLessonFiredRef.current || isAnonymous) return;
    funnelLessonFiredRef.current = true;
    fireFunnelEvent('funnel_first_lesson_start', {
      lesson_id: lessonId,
      course_slug: courseSlug,
      locale: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    });
  }, [lessonId, courseSlug, isAnonymous]);

  // Navigation
  const currentLessonIndex = courseLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentLessonIndex > 0 ? courseLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < courseLessons.length - 1
      ? courseLessons[currentLessonIndex + 1]
      : null;

  // Determine if current step is an exercise (locks "Continue" until completed)
  const currentSection = currentStep < totalSteps ? lessonContent.sections[currentStep] : null;
  const currentIsExercise = currentSection?.type === 'exercise';

  // For non-exercise steps, unlock immediately
  useEffect(() => {
    if (!currentIsExercise && currentStep < totalSteps) {
      setStepUnlocked(true);
    }
  }, [currentStep, currentIsExercise, totalSteps]);

  // ---------------------------------------------------------------------------
  // Fire `started` when an exercise first becomes the active step.
  // Dedup'd via startedFiredRef so back-and-forth navigation doesn't re-fire
  // (we want (completed / started) to reflect unique intent-to-attempt).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!currentIsExercise) return;
    if (!currentSection || currentSection.type !== 'exercise') return;
    const exerciseId = currentSection.exercise_id;
    if (startedFiredRef.current.has(exerciseId)) return;

    startedFiredRef.current.add(exerciseId);
    startedAtRef.current.set(exerciseId, Date.now());
    fireExerciseEvent(exerciseId, lessonId, 'started');

    // Funnel: first exercise start (deduplicated server-side)
    if (!funnelExerciseStartFiredRef.current && !isAnonymous) {
      funnelExerciseStartFiredRef.current = true;
      fireFunnelEvent('funnel_first_exercise_start', {
        exercise_id: exerciseId,
        lesson_id: lessonId,
        course_slug: courseSlug,
      });
    }
  }, [currentSection, currentIsExercise, lessonId, courseSlug, isAnonymous]);

  // ---------------------------------------------------------------------------
  // Skip escape-hatch timer.
  //
  // When an exercise step has been active for 60 seconds without completion,
  // surface a "Skip exercise" button so users are never permanently stuck
  // (e.g. if the exercise component crashes or data is malformed).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setShowSkip(false);
    if (!currentIsExercise || stepUnlocked) return;

    const timer = setTimeout(() => setShowSkip(true), 60_000);
    return () => clearTimeout(timer);
  }, [currentStep, currentIsExercise, stepUnlocked]);

  // ---------------------------------------------------------------------------
  // Abandon detection.
  //
  // Fires `abandoned` for any exercise the user started but did not complete
  // when one of the following happens:
  //   (a) the component unmounts (navigation away from the lesson page)
  //   (b) visibilitychange -> hidden (tab backgrounded / device locked)
  //   (c) beforeunload (tab close / full navigation)
  //
  // For (b) and (c) we MUST use sendBeacon — plain fetch during unload gets
  // cancelled by every major browser. fireExerciseEvent handles that branch.
  //
  // Dedup via abandonedFiredRef so we don't spam multiple abandons per
  // (tab-hide + close) sequence.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const flushAbandons = () => {
      for (const [exerciseId, startedAt] of startedAtRef.current.entries()) {
        if (completedFiredRef.current.has(exerciseId)) continue;
        if (abandonedFiredRef.current.has(exerciseId)) continue;
        abandonedFiredRef.current.add(exerciseId);
        fireExerciseEvent(
          exerciseId,
          lessonId,
          'abandoned',
          Date.now() - startedAt,
        );
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAbandons();
      }
    };

    const onBeforeUnload = () => {
      flushAbandons();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      // Unmount = SPA navigation away from the lesson page while exercises
      // remain in-flight = abandon.
      flushAbandons();
    };
  }, [lessonId]);

  const saveProgress = useCallback(
    async (status: 'in_progress' | 'completed', score: number) => {
      // Anonymous users cannot save to the server — persist locally instead.
      if (isAnonymous) {
        saveLocalProgress(courseSlug, lessonSlug, currentStep);
        return;
      }

      setSaveError(null);
      setIsSaving(true);
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: lessonId, status, score }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to save progress');
        }
        const data: ProgressResponse = await res.json();
        if (status === 'completed') {
          setServerXp(data.new_xp);
          if (data.achievements.length > 0) {
            setNewAchievements(data.achievements);
          }
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save progress');
      } finally {
        setIsSaving(false);
      }
    },
    [lessonId, isAnonymous, courseSlug, lessonSlug, currentStep],
  );

  function handleExerciseComplete(exerciseId: string, result: ExerciseResult) {
    // Fire `completed` event (dedup'd) with time-since-started.
    if (!completedFiredRef.current.has(exerciseId)) {
      completedFiredRef.current.add(exerciseId);
      const startedAt = startedAtRef.current.get(exerciseId);
      const timeSpentMs =
        typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
      fireExerciseEvent(exerciseId, lessonId, 'completed', timeSpentMs);

      // Funnel: first exercise complete (deduplicated server-side)
      if (!funnelExerciseCompleteFiredRef.current && !isAnonymous) {
        funnelExerciseCompleteFiredRef.current = true;
        fireFunnelEvent('funnel_first_exercise_complete', {
          exercise_id: exerciseId,
          lesson_id: lessonId,
          course_slug: courseSlug,
          xp_earned: result.xp_earned,
        });
      }
    }

    const nextCompleted = new Set(completedExercises);
    nextCompleted.add(exerciseId);
    setCompletedExercises(nextCompleted);
    setXpEarned((prev) => prev + result.xp_earned);

    // Show XP popup
    setXpPopup(result.xp_earned);
    setTimeout(() => setXpPopup(null), 1500);

    // Unlock the step so user can advance
    setStepUnlocked(true);

    // Mark completed when all exercises are done, otherwise send in_progress
    if (nextCompleted.size === totalExercises && totalExercises > 0) {
      saveProgress('completed', 100);
    } else {
      const score = Math.round((nextCompleted.size / totalExercises) * 100);
      saveProgress('in_progress', score);
    }
  }

  function advanceStep() {
    setFadeState('out');
    setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        // Persist step progress locally for anonymous users on every advance.
        if (isAnonymous) {
          saveLocalProgress(courseSlug, lessonSlug, next);
        }
        return next;
      });
      setStepUnlocked(false);
      setFadeState('in');
    }, 150);
  }

  // For lessons with no exercises, auto-complete when reaching the end
  useEffect(() => {
    if (isComplete && totalExercises === 0 && !hasSentInProgress.current) {
      hasSentInProgress.current = true;
      saveProgress('completed', 100);
    }
  }, [isComplete, totalExercises, saveProgress]);

  // ---------------------------------------------------------------------------
  // Render a single section
  // ---------------------------------------------------------------------------
  function renderSection(sectionIndex: number) {
    const section = lessonContent.sections[sectionIndex];
    if (!section) return null;

    if (section.type === 'text' || section.type === 'summary') {
      return (
        <SanitizedHtml
          html={section.content}
          className="prose-f text-sm leading-relaxed text-text-secondary"
        />
      );
    }

    if (section.type === 'code_example') {
      return (
        <div className="space-y-2">
          {section.caption && (
            <p className="text-xs font-semibold text-text-secondary">{section.caption}</p>
          )}
          <pre className="overflow-x-auto rounded-xl border-[2px] border-ink bg-ink p-4 text-sm font-mono leading-relaxed text-cream">
            {section.code}
          </pre>
        </div>
      );
    }

    if (section.type === 'exercise') {
      const exerciseOrder = exerciseIndexMap.get(sectionIndex);
      if (exerciseOrder === undefined) return null;
      const exercise = exercises[exerciseOrder];
      if (!exercise) return null;

      return (
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-secondary">
            Exercise {exerciseOrder + 1} of {totalExercises}
          </p>
          <ExerciseRenderer
            key={exercise.id}
            exercise={exercise}
            index={exerciseOrder}
            onComplete={(result) => handleExerciseComplete(exercise.id, result)}
          />
          {showSkip && !completedExercises.has(exercise.id) && (
            <button
              type="button"
              className="text-xs font-semibold text-text-secondary underline transition-colors hover:text-ink"
              onClick={() =>
                handleExerciseComplete(exercise.id, {
                  correct: false,
                  explanation: 'Skipped',
                  xp_earned: 0,
                })
              }
            >
              {t('skipExercise')}
            </button>
          )}
        </div>
      );
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Completion screen
  // ---------------------------------------------------------------------------
  if (isComplete) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" />
            Back to course
          </Link>
        </div>

        {/* Save error banner — only for authenticated users */}
        {!isAnonymous && saveError && (
          <div className="flex items-center gap-2 rounded-2xl border-[2px] border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>Progress could not be saved: {saveError}</span>
            <button
              className="ml-auto text-xs font-bold underline"
              onClick={() => setSaveError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Completion card */}
        <div className="card-f-static overflow-hidden">
          <div className="h-2 w-full bg-teal" />
          <div className="space-y-6 p-8 text-center">
            <div className="relative mx-auto flex size-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-teal/20" />
              <CheckCircle className="relative size-16 text-teal" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-ink">Lesson Complete!</h2>
              <p className="text-sm text-text-secondary">{lessonTitle}</p>
            </div>

            {/* Anonymous: XP loss-aversion sign-up nudge */}
            {isAnonymous && (
              <SignUpPromptCta xpEarned={xpEarned} />
            )}

            {/* XP earned — only for authenticated users */}
            {!isAnonymous && (
              <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-orange/10 px-6 py-3">
                <Zap className="size-5 text-orange" />
                <span className="mono-f text-lg font-bold text-orange">
                  {isSaving
                    ? t('savingEllipsis')
                    : serverXp != null
                      ? t('xpPlus', { xp: serverXp })
                      : t('xpPlus', { xp: xpEarned })}
                </span>
              </div>
            )}

            {/* Achievements — only for authenticated users */}
            {!isAnonymous && newAchievements.length > 0 && (
              <div className="space-y-3 pt-2">
                {newAchievements.map((name) => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border-[2px] border-gold bg-gold/10 px-4 py-2 text-sm font-bold text-walnut"
                  >
                    <Trophy className="size-4" />
                    Achievement unlocked: {name}
                  </div>
                ))}
              </div>
            )}

            {/* Share prompt — only for authenticated users */}
            {!isAnonymous && (!nextLesson || newAchievements.length > 0) && (
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 rounded-full border-[2px] border-game-blue bg-game-blue/10 px-5 py-2.5 text-sm font-bold text-game-blue transition-all hover:bg-game-blue/20"
              >
                <ArrowRight className="size-4" />
                Share your progress
              </button>
            )}

            <div className="border-t-[2px] border-ink/10" />

            {/* Navigation */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/courses/${courseSlug}`}
                className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-linen"
              >
                <ChevronLeft className="size-4" />
                Back to Course
              </Link>

              {nextLesson ? (
                <Link
                  href={`/courses/${courseSlug}/${nextLesson.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
                >
                  Next Lesson
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseSlug}`}
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
                >
                  <Sparkles className="size-4" />
                  Complete Course
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave 2 (GTM bible v2.0 §3): track-end CTA renders only when
            this is the final lesson in an Advanced Practitioner track
            (level_up / build_something). Pre-rendered server-side so the
            i18n strings come through next-intl. */}
        {!isAnonymous && !nextLesson && trackEndCta}

        {/* Share modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareType={!nextLesson ? 'course_complete' : 'badge_unlock'}
          referenceId={courseSlug}
          title={!nextLesson ? `Completed: ${lessonTitle}` : `Achievement: ${newAchievements[0] ?? lessonTitle}`}
          description={!nextLesson ? 'Just finished a course on Learn to GPT!' : undefined}
        />

        {/* Badge unlock celebration overlay */}
        {!isAnonymous && newAchievements.length > 0 && (
          <BadgeUnlockedCelebration achievements={newAchievements} />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step-by-step game view
  // ---------------------------------------------------------------------------
  const progressPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          Back to course
        </Link>

        <div className="badge-f bg-cream text-orange">
          <Zap className="size-3.5" />
          <span className="tabular-nums">{serverXp != null ? serverXp : xpEarned} XP</span>
        </div>
      </div>

      {/* Progress bar + step indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-ink sm:text-xl">{lessonTitle}</h1>
          <span className="mono-f shrink-0 text-sm font-semibold text-text-secondary">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-3 flex-1 rounded-md border-[2px] border-ink"
              style={{
                background: i < currentStep ? '#2d7d6f' : i === currentStep ? '#e07a3a' : '#f0ebe3',
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <SocialProofCounter lessonSlug={lessonSlug} />
          <p className="mono-f text-xs font-bold text-teal">{progressPercent}%</p>
        </div>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl border-[2px] border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>Progress could not be saved: {saveError}</span>
          <button
            className="ml-auto text-xs font-bold underline"
            onClick={() => setSaveError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current section with fade transition */}
      <div
        className={`min-h-[200px] transition-all duration-150 ${
          fadeState === 'in'
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="card-f-static p-6">
          {renderSection(currentStep)}
        </div>
      </div>

      {/* XP popup */}
      {xpPopup !== null && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce rounded-full border-[2px] border-ink bg-orange/20 px-6 py-3 text-lg font-bold text-orange shadow-lg backdrop-blur-sm">
            <Zap className="mr-1 inline size-5" />
            +{xpPopup} XP
          </div>
        </div>
      )}

      {/* Mid-lesson signup nudge — anonymous visitors only, appears after 30s or 40% scroll */}
      <MidLessonSignupBar isAnonymous={!!isAnonymous} />

      {/* Continue / Next button */}
      <div className="flex items-center justify-between border-t-[2px] border-border pt-4">
        {/* Back button */}
        {currentStep > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border-[2px] border-ink bg-cream px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-linen"
            onClick={() => {
              setFadeState('out');
              setTimeout(() => {
                setCurrentStep((prev) => prev - 1);
                setStepUnlocked(true);
                setFadeState('in');
              }, 150);
            }}
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Advance button */}
        {currentIsExercise ? (
          <button
            type="button"
            disabled={!stepUnlocked}
            onClick={advanceStep}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917] disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {stepUnlocked ? (
              <>
                {currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
                <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                <BookOpen className="size-4" />
                Complete exercise to continue
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={advanceStep}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
          >
            {currentStep < totalSteps - 1 ? 'Continue' : 'Finish'}
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      {/* Badge unlock celebration — only render here if NOT in completed state
          (the completed view has its own instance to avoid duplicate overlays) */}
      {!isAnonymous && newAchievements.length > 0 && !isComplete && (
        <BadgeUnlockedCelebration achievements={newAchievements} />
      )}
    </div>
  );
}
