import type { Achievement, Track, Mission } from "@/types";
import { PLATFORM } from "@/lib/config";
import { getLocale, getTranslations } from "next-intl/server";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { DailyChallenge } from "@/components/gamification/DailyChallenge";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { SkillTree, type TrackProgress } from "@/components/gamification/SkillTree";
import { ContinueWhereYouLeftOff } from "@/components/ContinueWhereYouLeftOff";
import { FunnelTracker } from "@/components/FunnelTracker";
import { BookOpen, ArrowRight, Sparkles, Rocket, Clock, Zap, ListChecks } from "lucide-react";
import { TipOfTheDay } from "@/components/TipOfTheDay";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { SocialProofBanner } from "@/components/social/SocialProofBanner";
import { ActivityFeed } from "@/components/social/ActivityFeed";

// ── Page ───────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServer();
  const t = await getTranslations("dashboard");
  const tProfile = await getTranslations("profile");
  const locale = await getLocale();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, total_xp, current_streak, longest_streak, created_at")
    .eq("user_id", user.id)
    .single();

  // Fetch all courses with their lessons counted, scoped to the user's locale
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, track, order_index, is_free")
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .order("order_index", { ascending: true });

  // Fetch lesson counts per course, scoped to the user's locale
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id, title, slug, order_index")
    .eq("locale", locale)
    .order("order_index", { ascending: true });

  // Fetch user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id, status, completed_at")
    .eq("user_id", user.id);

  // Fetch recent achievements
  const { data: recentAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at, achievements(id, name, description, icon, criteria_json, xp_bonus)")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false })
    .limit(5);

  // Fetch all achievements for display (to show locked ones too).
  // Order by xp_bonus ascending so the easiest badges appear first for new users.
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("id, name, description, icon, criteria_json, xp_bonus")
    .order("xp_bonus", { ascending: true });

  // Build data structures
  const displayName = profile?.display_name || user.email?.split("@")[0] || tProfile("defaultLearnerName");
  const xp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const isNewUser = !profile || xp === 0;

  // Fetch missions + user's missions for onboarding display
  const { data: allMissions } = await supabase
    .from("missions")
    .select("id, title, slug, description, difficulty, cover_emoji, estimated_hours, max_xp, step_count, is_free")
    .order("created_at", { ascending: true })
    .limit(4);

  const { data: userMissionsData } = await supabase
    .from("user_missions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const missionsList = (allMissions ?? []) as Mission[];
  const hasNoMissions = !userMissionsData || userMissionsData.length === 0;
  const showMissionPicker = isNewUser && hasNoMissions;

  // Build progress lookup: lesson_id -> status
  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );

  // Build lesson counts per course
  const lessonsByCourse = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByCourse.get(lesson.course_id) ?? [];
    list.push(lesson);
    lessonsByCourse.set(lesson.course_id, list);
  }

  // Build skill tree tracks
  const trackMap = new Map<Track, TrackProgress>();
  for (const course of courses ?? []) {
    const track = course.track as Track;
    if (!trackMap.has(track)) {
      trackMap.set(track, { track, courses: [] });
    }
    const courseLessons = lessonsByCourse.get(course.id) ?? [];
    const completedCount = courseLessons.filter(
      (l) => progressMap.get(l.id) === "completed"
    ).length;

    const trackData = trackMap.get(track)!;
    trackData.courses.push({
      id: course.id,
      title: course.title,
      slug: course.slug,
      lessonsCompleted: completedCount,
      lessonsTotal: courseLessons.length,
    });
  }

  const tracks: TrackProgress[] = [
    trackMap.get("why_claude"),
    trackMap.get("three_levels"),
    trackMap.get("essentials"),
    trackMap.get("level_up"),
    trackMap.get("build_something"),
    trackMap.get("practitioner_setup"),
    trackMap.get("advanced_workflows"),
  ].filter((t): t is TrackProgress => t != null);

  // Fetch all user achievements (not just recent) for the unlocked set below
  const { data: allUserAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);
  const allUnlockedIds = new Set(
    (allUserAchievements ?? []).map((ua) => ua.achievement_id)
  );

  // Build achievements display (recent unlocked + some locked)
  const achievementsList: Array<{
    achievement: Achievement;
    unlocked: boolean;
    unlockedAt?: string;
  }> = [];

  // Add unlocked achievements (recent)
  for (const ua of recentAchievements ?? []) {
    // Supabase returns a single object for many-to-one joins, but TS infers an array
    const ach = ua.achievements as unknown as { id: string; name: string; description: string | null; icon: string | null; criteria_json: unknown; xp_bonus: number | null } | null;
    if (ach) {
      achievementsList.push({
        achievement: {
          id: ach.id,
          name: ach.name,
          description: ach.description ?? "",
          icon: ach.icon ?? "",
          criteria: ach.criteria_json as Achievement["criteria"],
          xp_bonus: ach.xp_bonus ?? 0,
        },
        unlocked: true,
        unlockedAt: ua.unlocked_at,
      });
    }
  }

  // Add a couple locked achievements if space
  for (const ach of allAchievements ?? []) {
    if (achievementsList.length >= 8) break;
    if (!allUnlockedIds.has(ach.id)) {
      achievementsList.push({
        achievement: {
          id: ach.id,
          name: ach.name,
          description: ach.description ?? "",
          icon: ach.icon ?? "",
          criteria: ach.criteria_json as Achievement["criteria"],
          xp_bonus: ach.xp_bonus ?? 0,
        },
        unlocked: false,
      });
    }
  }

  // Find continue lesson
  let continueData: {
    courseTitle: string;
    lessonTitle: string;
    href: string;
    progress: number;
  } | null = null;

  // Find first in-progress or available lesson
  for (const course of courses ?? []) {
    const courseLessons = lessonsByCourse.get(course.id) ?? [];
    const completedCount = courseLessons.filter(
      (l) => progressMap.get(l.id) === "completed"
    ).length;

    if (completedCount > 0 && completedCount < courseLessons.length) {
      // This course is partially complete — find the next incomplete lesson
      const nextLesson = courseLessons.find(
        (l) => progressMap.get(l.id) !== "completed"
      );
      if (nextLesson) {
        continueData = {
          courseTitle: course.title,
          lessonTitle: nextLesson.title,
          href: `/courses/${course.slug}/${nextLesson.slug}`,
          progress: Math.round((completedCount / courseLessons.length) * 100),
        };
        break;
      }
    }
  }

  // If no in-progress course found, find the first course with 0 progress
  if (!continueData) {
    for (const course of courses ?? []) {
      const courseLessons = lessonsByCourse.get(course.id) ?? [];
      if (courseLessons.length > 0) {
        const completedCount = courseLessons.filter(
          (l) => progressMap.get(l.id) === "completed"
        ).length;
        if (completedCount === 0) {
          continueData = {
            courseTitle: course.title,
            lessonTitle: courseLessons[0].title,
            href: `/courses/${course.slug}/${courseLessons[0].slug}`,
            progress: 0,
          };
          break;
        }
      }
    }
  }

  // Check if ALL lessons across all courses are complete
  const totalLessonCount = (lessons ?? []).length;
  const completedLessonCount = (progress ?? []).filter(
    (p) => p.status === "completed"
  ).length;
  const allComplete = totalLessonCount > 0 && completedLessonCount >= totalLessonCount;

  // Fetch last activity timestamp for funnel_24hr_return detection
  const lastCompletedAt = (progress ?? [])
    .filter((p) => p.completed_at)
    .map((p) => new Date(p.completed_at).getTime())
    .sort((a, b) => b - a)[0];
  const lastActivityAt = lastCompletedAt
    ? new Date(lastCompletedAt).toISOString()
    : null;

  // Has any lesson progress at all (for funnel_signup_complete detection)
  const hasAnyProgress = (progress ?? []).length > 0;

  // ── New user welcome state ──
  if (isNewUser) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <FunnelTracker
          isNewSignup={!hasAnyProgress}
          hasXp={false}
          lastActivityAt={null}
          locale={locale}
        />
        <div className="card-f-static p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border-[3px] border-ink bg-orange/10">
            <Sparkles className="size-7 text-orange" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            {t("welcomeNewTitle", { name: displayName })}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-text-secondary">
            {showMissionPicker
              ? t("welcomeNewSubtitleMissions")
              : t("welcomeNewSubtitleDefault")}
          </p>
          <div className="mx-auto mt-3 flex justify-center">
            <SocialProofBanner />
          </div>
          {!showMissionPicker && continueData && (
            <Link
              href={continueData.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              {t("startLearning")}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {/* Mission Picker for brand new users */}
        {showMissionPicker && missionsList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-extrabold text-ink">
              <Rocket className="mr-2 inline size-5 text-orange" />
              {t("whatBuildHeading")}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {missionsList.map((m) => (
                <Link
                  key={m.id}
                  href={`/missions/${m.slug}`}
                  className="card-f group flex items-start gap-4 p-5"
                >
                  <span className="text-4xl">{m.cover_emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold text-ink">{m.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{m.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="mono-f flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
                        <Clock className="size-3" />
                        {t("missionHoursShort", { hours: m.estimated_hours })}
                      </span>
                      <span className="mono-f flex items-center gap-1 text-[10px] font-bold text-orange">
                        <Zap className="size-3" />
                        {t("missionXp", { xp: m.max_xp })}
                      </span>
                      <span className="mono-f flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
                        <ListChecks className="size-3" />
                        {t("missionSteps", { count: m.step_count })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 size-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-orange" />
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/courses"
                className="text-sm font-semibold text-text-secondary underline transition-colors hover:text-ink"
              >
                {t("justExploreCourses")}
              </Link>
            </div>
          </div>
        )}

        {/* Tip of the Day */}
        <TipOfTheDay />

        {/* Skill Tree */}
        {tracks.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-ink">{t("skillTreeHeading")}</h2>
            <SkillTree tracks={tracks} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <FunnelTracker
        isNewSignup={false}
        hasXp={xp > 0}
        lastActivityAt={lastActivityAt}
        locale={locale}
      />

      {/* Continue Where You Left Off Banner */}
      {!allComplete && continueData && (
        <ContinueWhereYouLeftOff
          continueData={continueData}
          allComplete={allComplete}
          translations={{
            continueLabel: t("continueHeader"),
            startJourneyLabel: t("startJourneyLabel"),
            startJourneySubtitle: t("startJourneySubtitle"),
            courseProgress: t("courseProgress"),
            resumeButton: t("resumeButton"),
            startButton: t("startButton"),
          }}
        />
      )}

      {/* Welcome */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-ink">
          {t("welcomeBack", { name: displayName })}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {streak > 0
            ? t("streakMessage", { streak })
            : t("noStreakMessage")}
        </p>
        <SocialProofBanner />
      </div>

      {/* Top row: XP + Streak + Daily Challenge */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* XP Card */}
        <div className="card-f-static p-5">
          <XPBar xp={xp} />
        </div>

        {/* Streak Card */}
        <div className="card-f-static flex items-center p-5">
          <StreakCounter streak={streak} longestStreak={longestStreak} />
        </div>

        {/* Daily Challenge */}
        <DailyChallenge isAuthenticated={true} />
      </div>

      {/* Tip of the Day */}
      <TipOfTheDay />

      {/* Continue where you left off */}
      {continueData && (
        <div className="card-f-static overflow-hidden">
          <div className="border-b-[2px] border-ink/10 px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
              <BookOpen className="size-4 text-orange" />
              {t("continueHeader")}
            </h3>
          </div>
          <div className="p-5">
            <Link
              href={continueData.href}
              className="group flex items-center justify-between rounded-[14px] border-[3px] border-ink bg-linen p-4 transition-all hover:bg-cream hover:shadow-[3px_3px_0px_#1c1917]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{continueData.courseTitle}</p>
                <p className="mt-1 font-bold text-ink">{continueData.lessonTitle}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-2.5 w-32 overflow-hidden rounded-full border-[2px] border-ink bg-linen">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${continueData.progress}%` }}
                    />
                  </div>
                  <span className="mono-f text-xs font-semibold text-teal">{continueData.progress}%</span>
                </div>
              </div>
              <ArrowRight className="size-5 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-orange" />
            </Link>
          </div>
        </div>
      )}

      {/* Skill Tree */}
      {tracks.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-ink">{t("skillTreeHeading")}</h2>
          <SkillTree tracks={tracks} />
        </div>
      )}

      {/* Recent Achievements */}
      {achievementsList.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-ink">{t("achievementsHeading")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {achievementsList.map((a) => (
              <AchievementCard
                key={a.achievement.id}
                achievement={a.achievement}
                unlocked={a.unlocked}
                unlockedAt={a.unlockedAt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed — social proof */}
      <ActivityFeed />
    </div>
  );
}
