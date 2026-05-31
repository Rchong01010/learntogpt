import type { Achievement, Track } from "@/types";
import { PLATFORM } from "@/lib/config";
import { TRACK_INFO, getLevelFromXP } from "@/types";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { BookOpen, GraduationCap, Zap } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

const trackColorBar: Record<Track, string> = {
  why_claude: "bg-game-blue",
  three_levels: "bg-teal",
  essentials: "bg-game-purple",
  level_up: "bg-orange",
  build_something: "bg-gold",
  practitioner_setup: "bg-orange",
  advanced_workflows: "bg-cyan-600",
};

// ── Page ───────────────────────────────────────────────────

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createSupabaseServer();
  const t = await getTranslations("profile");
  const locale = await getLocale();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, avatar_url, total_xp, current_streak, longest_streak, level, created_at")
    .eq("user_id", user.id)
    .single();

  // Fetch all courses scoped to the user's locale
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, track, order_index")
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .order("order_index", { ascending: true });

  // Fetch all lessons scoped to the user's locale
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("locale", locale)
    .order("order_index", { ascending: true });

  // Fetch user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id, status")
    .eq("user_id", user.id);

  // Fetch all achievements
  const { data: allAchievementsData } = await supabase
    .from("achievements")
    .select("id, name, description, icon, criteria_json, xp_bonus");

  // Fetch user achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id);

  // Build data
  const displayName =
    profile?.display_name || user.email?.split("@")[0] || t("defaultLearnerName");
  const xp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const joinedAt = profile?.created_at ?? user.created_at ?? new Date().toISOString();
  const level = getLevelFromXP(xp);

  // Progress lookup
  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );

  // Count completed lessons and courses
  const completedLessons = (progress ?? []).filter((p) => p.status === "completed").length;

  // Lessons by course
  const lessonsByCourse = new Map<string, string[]>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByCourse.get(lesson.course_id) ?? [];
    list.push(lesson.id);
    lessonsByCourse.set(lesson.course_id, list);
  }

  // Count completed courses
  let completedCourses = 0;
  for (const course of courses ?? []) {
    const courseLessonIds = lessonsByCourse.get(course.id) ?? [];
    if (courseLessonIds.length > 0 && courseLessonIds.every((id) => progressMap.get(id) === "completed")) {
      completedCourses++;
    }
  }

  // Build per-track progress
  const trackLessonCounts = new Map<Track, { completed: number; total: number }>();
  for (const course of courses ?? []) {
    const track = course.track as Track;
    const current = trackLessonCounts.get(track) ?? { completed: 0, total: 0 };
    const courseLessonIds = lessonsByCourse.get(course.id) ?? [];
    current.total += courseLessonIds.length;
    current.completed += courseLessonIds.filter((id) => progressMap.get(id) === "completed").length;
    trackLessonCounts.set(track, current);
  }

  const trackProgress: Array<{ track: Track; completed: number; total: number }> = (
    ["why_claude", "three_levels", "essentials", "level_up", "build_something"] as Track[]
  )
    .map((track) => ({
      track,
      ...(trackLessonCounts.get(track) ?? { completed: 0, total: 0 }),
    }))
    .filter((tp) => tp.total > 0);

  // Build achievements list
  const unlockedMap = new Map(
    (userAchievements ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at])
  );

  const achievementsList: Array<{
    achievement: Achievement;
    unlocked: boolean;
    unlockedAt?: string;
  }> = (allAchievementsData ?? []).map((ach) => ({
    achievement: {
      id: ach.id,
      name: ach.name,
      description: ach.description ?? "",
      icon: ach.icon ?? "",
      criteria: ach.criteria_json as Achievement["criteria"],
      xp_bonus: ach.xp_bonus ?? 0,
    },
    unlocked: unlockedMap.has(ach.id),
    unlockedAt: unlockedMap.get(ach.id) ?? undefined,
  }));

  // Sort: unlocked first (by date desc), then locked
  achievementsList.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (a.unlocked && b.unlocked) {
      return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime();
    }
    return 0;
  });

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile header */}
      <div className="card-f-static flex items-center gap-4 p-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-gold text-xl font-bold text-ink shadow-[2px_2px_0px_#1c1917]">
          {displayName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink">{displayName}</h1>
          <p className="text-sm text-text-secondary">
            {t("joinedLabel", {
              date: new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
              }).format(new Date(joinedAt)),
            })}
          </p>
        </div>
        <LevelBadge level={level} size="lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t("statTotalXp"), value: xp.toLocaleString(), icon: Zap, color: "text-orange" },
          { label: t("statLevel"), value: level, icon: GraduationCap, color: "text-game-purple" },
          { label: t("statLessons"), value: completedLessons, icon: BookOpen, color: "text-teal" },
          { label: t("statCourses"), value: completedCourses, icon: GraduationCap, color: "text-game-blue" },
        ].map((stat) => (
          <div key={stat.label} className="card-f-static flex items-center gap-3 p-4">
            <stat.icon className={cn("size-5 shrink-0", stat.color)} />
            <div>
              <p className="text-lg font-extrabold tabular-nums text-ink">{stat.value}</p>
              <p className="text-xs font-semibold text-text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* XP + Streak */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card-f-static p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">{t("xpProgressHeading")}</p>
          <XPBar xp={xp} />
        </div>
        <div className="card-f-static p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">{t("streakHeading")}</p>
          <StreakCounter streak={streak} longestStreak={longestStreak} />
        </div>
      </div>

      {/* Track Progress */}
      {trackProgress.length > 0 && (
        <div className="card-f-static p-5">
          <h2 className="mb-4 text-base font-extrabold text-ink">{t("trackProgressHeading")}</h2>
          <div className="space-y-4">
            {trackProgress.map((tp) => {
              const info = TRACK_INFO[tp.track];
              const pct = tp.total > 0 ? Math.round((tp.completed / tp.total) * 100) : 0;
              return (
                <div key={tp.track} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-ink">{info.name}</span>
                    <span className="mono-f text-xs font-semibold tabular-nums text-text-secondary">
                      {t("trackProgressCaption", { done: tp.completed, total: tp.total, pct })}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border-[2px] border-ink bg-linen">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", trackColorBar[tp.track])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievementsList.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-extrabold text-ink">
            {t("achievementsHeading", { unlocked: unlockedCount, total: achievementsList.length })}
          </h2>
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
    </div>
  );
}
