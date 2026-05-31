import { getLevelFromXP, type Achievement, type LessonXpBreakdown } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM } from "@/lib/config";

const FIRST_ATTEMPT_BONUS = 1.5;
const PERFECT_SCORE_BONUS = 2.0;

// Lesson-level bonus constants (new — used by awardLessonXp).
// Perfect-run = every exercise correct on first attempt → 1.5x base XP.
// Streak-7+ = user on a 7+ day daily streak → 2x base XP.
// Both stack multiplicatively: perfect + 7-day streak = 3x base.
export const PERFECT_RUN_MULTIPLIER = 1.5;
export const STREAK_BONUS_MULTIPLIER = 2.0;
export const STREAK_BONUS_THRESHOLD_DAYS = 7;

// A/B feature flag. Read once per process so we log mode exactly once.
const USE_SCALED_XP =
  (process.env.USE_SCALED_XP ?? "false").toLowerCase() === "true";
let scaledXpModeLogged = false;

/**
 * Log the current XP-scaling mode on first use, exactly once per process.
 * Called from /api/progress so the server log shows the active mode on
 * the first lesson-completion request after boot.
 */
export function logXpModeOnce(): void {
  if (scaledXpModeLogged) return;
  scaledXpModeLogged = true;
  // eslint-disable-next-line no-console
  console.info(
    `[gamification] USE_SCALED_XP=${USE_SCALED_XP} — ` +
      (USE_SCALED_XP
        ? "computing XP from lesson.estimated_minutes (scaledXp)"
        : "using lesson.xp_reward from DB")
  );
}

/**
 * Is scaled-XP mode active? (true iff env USE_SCALED_XP === "true")
 * Exported so the progress route can branch without duplicating the env read.
 */
export function isScaledXpEnabled(): boolean {
  return USE_SCALED_XP;
}

/**
 * Scale lesson XP to difficulty by duration.
 *
 * Formula: `floor(10 * estimatedMinutes / 5) * 5` — i.e. 10 XP per minute,
 * rounded DOWN to the nearest 5 so the result is always a tidy multiple of 5.
 *
 * Examples:
 *   scaledXp(5)  → 50
 *   scaledXp(7)  → 70
 *   scaledXp(30) → 300
 *   scaledXp(0)  → 0 (guards against bad data)
 *
 * Used at award-time only when USE_SCALED_XP=true. The seed JSONs and DB
 * rows are untouched so we can A/B test cleanly.
 */
export function scaledXp(estimatedMinutes: number): number {
  if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) return 0;
  const raw = 10 * estimatedMinutes;
  return Math.floor(raw / 5) * 5;
}

/**
 * Compute the lesson-completion XP breakdown with perfect-run and streak
 * bonuses applied. Pure function — callers handle DB reads/writes.
 *
 * Bonuses stack multiplicatively:
 *   final = round(base * perfectMultiplier * streakMultiplier)
 *
 * @param params.dbXpReward     lesson.xp_reward from the DB (fallback base).
 * @param params.estimatedMinutes lesson.estimated_minutes (used when USE_SCALED_XP=true).
 * @param params.perfectRun     true iff every exercise was correct on first attempt.
 * @param params.currentStreak  user_profiles.current_streak at award time.
 */
export function computeLessonXpBreakdown(params: {
  dbXpReward: number;
  estimatedMinutes: number;
  perfectRun: boolean;
  currentStreak: number;
}): LessonXpBreakdown {
  const scaled = isScaledXpEnabled();
  const base_xp = scaled
    ? scaledXp(params.estimatedMinutes)
    : params.dbXpReward;
  const xp_source = scaled ? "scaled_minutes" : "db_xp_reward";

  const perfect_multiplier = params.perfectRun ? PERFECT_RUN_MULTIPLIER : 1.0;
  const streak_multiplier =
    params.currentStreak >= STREAK_BONUS_THRESHOLD_DAYS
      ? STREAK_BONUS_MULTIPLIER
      : 1.0;

  const final_xp = Math.round(
    base_xp * perfect_multiplier * streak_multiplier
  );

  return {
    base_xp,
    perfect_run: params.perfectRun,
    current_streak: params.currentStreak,
    streak_multiplier,
    perfect_multiplier,
    final_xp,
    xp_source,
  };
}

/**
 * Returns true iff the user got every exercise in `lessonId` correct on
 * their very first attempt. If the lesson has no exercises, returns true
 * (nothing to get wrong).
 *
 * Reads from user_exercise_attempts (migration 014). Caller should pass
 * the admin (service_role) client since RLS does not grant read-through
 * here for the API route's auth context.
 */
export async function isPerfectRun(
  userId: string,
  lessonId: string,
  adminSupabase: SupabaseClient
): Promise<boolean> {
  const { data: exercises } = await adminSupabase
    .from("exercises")
    .select("id")
    .eq("lesson_id", lessonId);

  if (!exercises || exercises.length === 0) return true;

  const exerciseIds = exercises.map((e) => e.id);

  const { data: attempts } = await adminSupabase
    .from("user_exercise_attempts")
    .select("exercise_id, first_correct")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds);

  if (!attempts || attempts.length !== exerciseIds.length) return false;
  return attempts.every((a) => a.first_correct === true);
}

/**
 * Record an exercise submission against user_exercise_attempts.
 *
 * On FIRST submission for the (user, exercise) pair: inserts with
 * attempts=1 and first_correct=`wasCorrect`. On subsequent submissions:
 * increments attempts but never flips first_correct back to true.
 *
 * Caller must pass an admin (service_role) client — the table has no
 * INSERT/UPDATE policy for authenticated (migration 014).
 */
export async function recordExerciseAttempt(
  userId: string,
  exerciseId: string,
  wasCorrect: boolean,
  adminSupabase: SupabaseClient
): Promise<void> {
  const { data: existing } = await adminSupabase
    .from("user_exercise_attempts")
    .select("id, attempts")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (!existing) {
    // First attempt — first_correct matches current result.
    await adminSupabase.from("user_exercise_attempts").insert({
      user_id: userId,
      exercise_id: exerciseId,
      attempts: 1,
      first_correct: wasCorrect,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  // Repeat attempt — never upgrade first_correct.
  await adminSupabase
    .from("user_exercise_attempts")
    .update({
      attempts: (existing.attempts ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);
}

/**
 * Calculate final XP with bonus multipliers (exercise-level, legacy).
 */
export function calculateXP(
  exerciseXP: number,
  isFirstAttempt: boolean,
  isPerfect: boolean
): number {
  let multiplier = 1.0;

  if (isFirstAttempt) {
    multiplier *= FIRST_ATTEMPT_BONUS;
  }

  if (isPerfect) {
    multiplier *= PERFECT_SCORE_BONUS;
  }

  return Math.round(exerciseXP * multiplier);
}

/**
 * Check all achievement criteria against user state, return newly unlocked ones.
 *
 * `locale` scopes course/lesson lookups so that achievement counts match the
 * content the user is actually studying — e.g. a Japanese learner counts the
 * Japanese version of a track, not English. After migration 012 the same
 * track has a row per locale; without this, totals would be inflated and
 * track_completed achievements would never trigger.
 */
export async function checkAchievements(
  userId: string,
  supabase: SupabaseClient,
  locale: string
): Promise<Achievement[]> {
  // Get all achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("id, name, description, icon, criteria_json, xp_bonus");

  if (!allAchievements || allAchievements.length === 0) {
    return [];
  }

  // Get already-unlocked achievement IDs
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((unlocked ?? []).map((u) => u.achievement_id));

  // Get user stats
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp, current_streak, longest_streak")
    .eq("user_id", userId)
    .single();

  const { data: completedLessons } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("status", "completed");

  const { data: perfectScores } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("score", 100);

  const completedCount = completedLessons?.length ?? 0;
  const perfectCount = perfectScores?.length ?? 0;
  const totalXP = profile?.total_xp ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) {
      continue;
    }

    const criteria = achievement.criteria_json as Achievement["criteria"];
    if (!criteria || !criteria.type) continue;
    let earned = false;

    switch (criteria.type) {
      case "lessons_completed":
        earned = completedCount >= criteria.threshold;
        break;
      case "streak_days":
        earned = longestStreak >= criteria.threshold;
        break;
      case "perfect_score":
        earned = perfectCount >= criteria.threshold;
        break;
      case "total_xp":
        earned = totalXP >= criteria.threshold;
        break;
      case "course_completed": {
        if (criteria.course_id) {
          const { count } = await supabase
            .from("lessons")
            .select("id", { count: "exact", head: true })
            .eq("course_id", criteria.course_id)
            .eq("locale", locale);

          const { count: completedInCourse } = await supabase
            .from("user_progress")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "completed")
            .in(
              "lesson_id",
              (
                await supabase
                  .from("lessons")
                  .select("id")
                  .eq("course_id", criteria.course_id)
                  .eq("locale", locale)
              ).data?.map((l) => l.id) ?? []
            );

          earned =
            count !== null &&
            completedInCourse !== null &&
            count > 0 &&
            completedInCourse >= count;
        }
        break;
      }
      case "track_completed": {
        if (criteria.track) {
          const { data: trackCourses } = await supabase
            .from("courses")
            .select("id")
            .eq("track", criteria.track)
            .eq("locale", locale)
            .eq("platform", PLATFORM);

          if (trackCourses && trackCourses.length > 0) {
            const courseIds = trackCourses.map((c) => c.id);
            const { data: trackLessons } = await supabase
              .from("lessons")
              .select("id")
              .in("course_id", courseIds);

            const totalLessons = trackLessons?.length ?? 0;

            if (totalLessons > 0) {
              const lessonIds = trackLessons!.map((l) => l.id);
              const { count: completedInTrack } = await supabase
                .from("user_progress")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("status", "completed")
                .in("lesson_id", lessonIds);

              earned = (completedInTrack ?? 0) >= totalLessons;
            }
          }
        }
        break;
      }
    }

    if (earned) {
      // Award achievement
      await supabase.from("user_achievements").upsert({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString(),
      }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });

      // Award bonus XP atomically via increment_xp RPC (service_role only).
      // Avoids read-modify-write race when multiple achievements unlock in
      // the same request or concurrent requests both complete lessons.
      if (achievement.xp_bonus > 0) {
        await supabase.rpc("increment_xp", {
          p_user_id: userId,
          p_amount: achievement.xp_bonus,
        });
        // Sync level after atomic XP bump
        const { data: updated } = await supabase
          .from("user_profiles")
          .select("total_xp")
          .eq("user_id", userId)
          .single();
        if (updated) {
          await supabase
            .from("user_profiles")
            .update({ level: getLevelFromXP(updated.total_xp ?? 0) })
            .eq("user_id", userId);
        }
      }

      newlyUnlocked.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description ?? "",
        icon: achievement.icon ?? "",
        criteria: achievement.criteria_json as Achievement["criteria"],
        xp_bonus: achievement.xp_bonus ?? 0,
      });
    }
  }

  return newlyUnlocked;
}

/**
 * Update daily streak for a user.
 *
 * @param clientDate  Optional "YYYY-MM-DD" from the client's local date.
 *                    Prevents timezone skew (e.g. 11 PM PST registering as
 *                    tomorrow in UTC). Validated server-side: must match format
 *                    and be within ±1 day of UTC to prevent gaming.
 */
export async function updateStreak(
  userId: string,
  supabase: SupabaseClient,
  clientDate?: string
): Promise<{ streak: number; isNew: boolean }> {
  const utcToday = new Date().toISOString().split("T")[0];

  // Use client date if provided, valid, and within ±1 day of UTC.
  let today = utcToday;
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    const clientMs = new Date(clientDate + "T00:00:00Z").getTime();
    const utcMs = new Date(utcToday + "T00:00:00Z").getTime();
    const diffDays = Math.abs(clientMs - utcMs) / 86_400_000;
    if (diffDays <= 1) {
      today = clientDate;
    }
  }

  // Check if there's already a streak entry for today
  const { data: todayStreak } = await supabase
    .from("user_streaks")
    .select("id, user_id, date, completed_lessons")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (todayStreak) {
    // Already logged today, just increment completed_lessons
    await supabase
      .from("user_streaks")
      .update({ completed_lessons: todayStreak.completed_lessons + 1 })
      .eq("user_id", userId)
      .eq("date", today);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("current_streak")
      .eq("user_id", userId)
      .single();

    return { streak: profile?.current_streak ?? 1, isNew: false };
  }

  // New day -- check if yesterday had a streak entry
  const yesterdayDate = new Date(today + "T00:00:00Z");
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const { data: yesterdayStreak } = await supabase
    .from("user_streaks")
    .select("id, user_id, date, completed_lessons")
    .eq("user_id", userId)
    .eq("date", yesterday)
    .single();

  // Upsert today's streak entry (handles race condition when two completions fire simultaneously)
  await supabase.from("user_streaks").upsert(
    {
      user_id: userId,
      date: today,
      completed_lessons: 1,
    },
    { onConflict: "user_id,date" }
  );

  // Calculate new streak
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .single();

  const currentStreak = yesterdayStreak
    ? (profile?.current_streak ?? 0) + 1
    : 1;

  const longestStreak = Math.max(
    currentStreak,
    profile?.longest_streak ?? 0
  );

  await supabase
    .from("user_profiles")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
    })
    .eq("user_id", userId);

  return { streak: currentStreak, isNew: true };
}
