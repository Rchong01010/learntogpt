'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Zap, ArrowRight, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// SignUpPromptCta
//
// Shown to anonymous visitors after completing a free preview lesson.
// Loss-aversion framing: "you earned XP, sign up to keep it."
// Dismissable: X button hides it and sessionStorage prevents re-show.
// ---------------------------------------------------------------------------

const SESSION_KEY = 'ca_signup_prompt_dismissed';

interface SignUpPromptCtaProps {
  xpEarned?: number;
}

export function SignUpPromptCta({ xpEarned }: SignUpPromptCtaProps) {
  const [visible, setVisible] = useState(false);

  // Only show if not dismissed this session
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(SESSION_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      // sessionStorage unavailable (private browsing edge case) — show anyway
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  const xpLabel = xpEarned && xpEarned > 0 ? `${xpEarned} XP` : 'XP';

  return (
    <div className="relative card-f-static overflow-hidden shadow-[4px_4px_0px_#1c1917]">
      <div className="h-2 w-full bg-orange" />

      {/* Dismiss button */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute right-4 top-5 rounded-full p-1 text-text-secondary transition-colors hover:bg-ink/10 hover:text-ink"
      >
        <X className="size-4" />
      </button>

      <div className="space-y-4 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border-[2px] border-ink bg-orange/10">
          <Zap className="size-6 text-orange" />
        </div>

        <h3 className="text-xl font-extrabold text-ink">
          You earned {xpLabel} — sign up to keep it
        </h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
          Create a free account to save your progress, unlock all courses, and
          start building your streak.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
          >
            Sign Up Free
            <ArrowRight className="size-4" />
          </Link>

          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-linen"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
