'use client';

import { CheckCircle2, Flame, Zap } from 'lucide-react';
import type { LessonXpBreakdown } from '@/types';

interface XpBreakdownBannerProps {
  breakdown: LessonXpBreakdown;
}

/**
 * Celebrates a completed lesson's XP math.
 *
 * - If neither multiplier triggered, renders a minimal "+{final_xp} XP" chip.
 * - If perfect_multiplier > 1 or streak_multiplier > 1, renders the full
 *   banner with base -> final math and bonus badges.
 *
 * Uses existing Tailwind v4 tokens (orange/teal/ink/cream/gold) and the
 * offset-shadow, bold-black-border Duolingo-style already present in the app.
 */
export function XpBreakdownBanner({ breakdown }: XpBreakdownBannerProps) {
  const {
    base_xp,
    final_xp,
    perfect_multiplier,
    streak_multiplier,
    current_streak,
  } = breakdown;

  const hasPerfect = perfect_multiplier > 1;
  const hasStreak = streak_multiplier > 1;
  const hasAnyBonus = hasPerfect || hasStreak;

  // --- Minimal chip — no bonuses earned ---
  if (!hasAnyBonus) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-orange/10 px-6 py-3 animate-[xpChipIn_0.35s_ease-out]"
        role="status"
        aria-label={`Earned ${final_xp} XP`}
      >
        <Zap className="size-5 text-orange" />
        <span className="mono-f text-lg font-bold text-orange">+{final_xp} XP</span>
        <style>{`
          @keyframes xpChipIn {
            0% { opacity: 0; transform: scale(0.9); }
            60% { transform: scale(1.04); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // --- Full celebration banner ---
  return (
    <div
      className="relative w-full max-w-md mx-auto animate-[xpBannerIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
      role="status"
      aria-label={`Bonus XP! Earned ${final_xp} XP from ${base_xp} base`}
    >
      {/* Confetti sparkles */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-visible">
        {[
          { left: '8%', top: '10%', color: '#e07a3a', delay: '0s' },
          { left: '88%', top: '15%', color: '#2d7d6f', delay: '0.08s' },
          { left: '15%', top: '82%', color: '#d4a373', delay: '0.16s' },
          { left: '82%', top: '78%', color: '#4a8fca', delay: '0.24s' },
          { left: '50%', top: '-4%', color: '#e07a3a', delay: '0.12s' },
          { left: '50%', top: '102%', color: '#2d7d6f', delay: '0.2s' },
        ].map((c, i) => (
          <span
            key={i}
            className="absolute size-2 rounded-sm"
            style={{
              left: c.left,
              top: c.top,
              background: c.color,
              border: '1.5px solid #1c1917',
              animation: `xpConfetti 0.9s ease-out ${c.delay} both`,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
        {/* Orange accent stripe */}
        <div className="h-1.5 w-full bg-orange" />

        <div className="space-y-4 p-5 text-center">
          {/* Heading */}
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="size-5 text-orange" />
            <span className="mono-f text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">
              XP Bonus
            </span>
            <Zap className="size-5 text-orange" />
          </div>

          {/* Math: base -> final */}
          <div className="flex items-baseline justify-center gap-3">
            <span className="mono-f text-base font-semibold text-text-secondary line-through decoration-[2px]">
              {base_xp}
            </span>
            <span className="mono-f text-xl font-bold text-text-secondary">&rarr;</span>
            <span className="mono-f text-3xl font-extrabold text-orange animate-[xpNumberPop_0.6s_ease-out_0.15s_both]">
              +{final_xp} XP
            </span>
          </div>

          {/* Bonus badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {hasPerfect && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink bg-teal px-3 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_#1c1917] animate-[xpBadgePop_0.45s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_both]"
                aria-label="Perfect run bonus, plus 50 percent"
              >
                <CheckCircle2 className="size-3.5" strokeWidth={3} />
                <span className="uppercase tracking-wider">Perfect! +50%</span>
              </div>
            )}
            {hasStreak && (
              <div
                className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink bg-orange px-3 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_#1c1917] animate-[xpBadgePop_0.45s_cubic-bezier(0.34,1.56,0.64,1)_0.35s_both]"
                aria-label={`${current_streak} day streak bonus, 2x`}
              >
                <Flame className="size-3.5" strokeWidth={3} />
                <span className="uppercase tracking-wider">
                  {current_streak}-Day Streak! 2x
                </span>
              </div>
            )}
          </div>

          {/* Explainer copy */}
          <div className="space-y-0.5 pt-1">
            {hasPerfect && (
              <p className="text-[11px] font-semibold text-text-secondary">
                Every exercise first try = +50%
              </p>
            )}
            {hasStreak && (
              <p className="text-[11px] font-semibold text-text-secondary">
                7+ days in a row = 2x XP
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes xpBannerIn {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          60% { transform: scale(1.03) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes xpNumberPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes xpBadgePop {
          0% { transform: scale(0) rotate(-8deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes xpConfetti {
          0% { transform: translate(0, 0) scale(0) rotate(0); opacity: 0; }
          20% { opacity: 1; }
          100% {
            transform: translate(var(--dx, 0), var(--dy, -24px)) scale(1) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
