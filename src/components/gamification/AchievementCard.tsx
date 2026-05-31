import type { Achievement } from "@/types";
import { Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function AchievementCard({
  achievement,
  unlocked = false,
  unlockedAt,
}: {
  achievement: Achievement;
  unlocked?: boolean;
  unlockedAt?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-[16px] border-[3px] p-4 text-center transition-all",
        unlocked
          ? "border-ink bg-cream shadow-[3px_3px_0px_#1c1917]"
          : "border-ink/20 bg-linen opacity-60 grayscale",
      )}
    >
      {/* Icon */}
      <div className="relative text-3xl">
        {achievement.icon}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="size-4 text-text-secondary" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-bold text-ink">{achievement.name}</p>

      {/* Description */}
      <p className="text-xs text-text-secondary">{achievement.description}</p>

      {/* XP badge */}
      <span className="badge-f bg-gold/20 text-walnut">
        <Zap className="size-3" />+{achievement.xp_bonus} XP
      </span>

      {/* Date */}
      {unlocked && unlockedAt && (
        <p className="mono-f text-[10px] text-text-secondary">
          {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
