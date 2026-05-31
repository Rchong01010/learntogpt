"use client";

import { getLevelFromXP, getXPForNextLevel } from "@/types";
import { LevelBadge } from "./LevelBadge";
import { Zap } from "lucide-react";

export function XPBar({ xp }: { xp: number }) {
  const level = getLevelFromXP(xp);
  const { current, next, progress } = getXPForNextLevel(xp);

  return (
    <div className="flex items-center gap-3">
      <LevelBadge level={level} size="md" />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-bold text-ink">
            <Zap className="size-3 text-orange" />
            Level {level}
          </span>
          <span className="mono-f font-semibold tabular-nums text-text-secondary">
            {xp - current} / {next - current} XP
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full border-[2px] border-ink bg-linen">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange to-gold transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
