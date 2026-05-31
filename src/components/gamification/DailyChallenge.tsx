"use client";

import { useState, useEffect } from "react";
import { getTodayChallenge } from "@/lib/daily-challenges";
import { Check, Target } from "lucide-react";
import { useTranslations } from "next-intl";

function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getStorageKey(dateStr: string): string {
  return `claude_academy_daily_challenge_${dateStr}`;
}

export function DailyChallenge({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("dashboard");
  const challenge = getTodayChallenge();
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dateStr = getDateString();
    const stored = localStorage.getItem(getStorageKey(dateStr));
    if (stored === "true") {
      setCompleted(true);
    }
  }, []);

  async function handleComplete() {
    if (completed || submitting) return;
    setSubmitting(true);

    const dateStr = getDateString();

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/daily-challenge/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId: challenge.id,
            clientDate: dateStr,
          }),
        });

        if (!res.ok) {
          const data = await res.json() as { error?: string };
          // Already completed today — treat as success
          if (res.status === 409) {
            setCompleted(true);
            localStorage.setItem(getStorageKey(dateStr), "true");
            return;
          }
          console.error("Daily challenge error:", data.error ?? "Unknown error");
          setSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Daily challenge network error:", err);
        setSubmitting(false);
        return;
      }
    }

    // Mark in localStorage (for both anon and auth users)
    localStorage.setItem(getStorageKey(dateStr), "true");
    setCompleted(true);
    setSubmitting(false);
  }

  return (
    <div className="card-f-static p-5 sm:col-span-2 lg:col-span-1">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border-[2px] border-ink bg-game-blue/10">
          {completed ? (
            <Check className="size-5 text-green-600" />
          ) : (
            <Target className="size-5 text-game-blue" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">
            <span className="mr-1.5">{challenge.icon}</span>
            {challenge.title}
          </p>
          {completed ? (
            <p className="mt-0.5 text-xs font-medium text-green-600">
              {t("dailyChallengeComplete")}
            </p>
          ) : (
            <>
              <p className="mt-0.5 text-xs text-text-secondary">
                {challenge.description}
              </p>
              <div className="mt-2.5 flex items-center gap-2.5">
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="rounded-[10px] border-[2px] border-ink bg-game-blue px-3 py-1 text-xs font-bold text-white shadow-[2px_2px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                >
                  {submitting ? "..." : t("dailyChallengeButton")}
                </button>
                <span className="text-xs font-bold text-orange">
                  {t("dailyChallengeXp", { xp: challenge.xpReward })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
