import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakCounter({
  streak,
  longestStreak,
  lastLessonToday,
}: {
  streak: number;
  longestStreak: number;
  lastLessonToday?: boolean;
}) {
  const isHot = streak >= 7;
  const atRisk = streak >= 3 && !lastLessonToday;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "badge-f bg-cream text-orange",
          isHot && "border-orange bg-orange/10 shadow-[0_0_12px_rgba(224,122,58,0.3)]",
          atRisk && "border-red-400 bg-red-50 animate-pulse",
        )}
      >
        <Flame
          className={cn(
            "size-4 text-orange",
            isHot && "drop-shadow-[0_0_6px_rgba(224,122,58,0.6)]",
            atRisk && "text-red-500",
          )}
        />
        <span className={cn("text-sm font-bold tabular-nums text-ink", atRisk && "text-red-600")}>{streak}</span>
        <span className="text-xs text-text-secondary">day streak</span>
      </div>
      {atRisk && (
        <span className="text-xs font-bold text-red-500 animate-pulse">At risk!</span>
      )}
      {longestStreak > streak && !atRisk && (
        <span className="mono-f text-xs font-semibold text-text-secondary">Best: {longestStreak}</span>
      )}
    </div>
  );
}
