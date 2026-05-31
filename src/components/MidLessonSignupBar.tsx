'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { X, Zap } from 'lucide-react';

// ---------------------------------------------------------------------------
// MidLessonSignupBar
//
// A subtle sticky bottom bar shown to anonymous visitors mid-lesson.
// Triggers after EITHER:
//   (a) 30 seconds on the page, OR
//   (b) user has scrolled past 40% of total page height
// whichever comes first.
//
// Dismissable via X button; dismissal is persisted in sessionStorage so it
// doesn't resurface if the user navigates between lessons in the same session.
//
// Design: cream bg + ink border top, not aggressive. Cookie-banner style.
// ---------------------------------------------------------------------------

const SESSION_KEY = 'ca_mid_lesson_bar_dismissed';

// Delay before showing (ms)
const SHOW_DELAY_MS = 30_000;
// Fraction of page height that triggers on scroll (0.0–1.0)
const SCROLL_THRESHOLD = 0.4;

interface MidLessonSignupBarProps {
  /** True when the visitor is not signed in. Bar only renders for anonymous users. */
  isAnonymous: boolean;
}

export function MidLessonSignupBar({ isAnonymous }: MidLessonSignupBarProps) {
  const [visible, setVisible] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Only run for anonymous visitors
    if (!isAnonymous) return;

    // Check if already dismissed this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage unavailable (private browsing edge cases) — proceed anyway
    }

    function trigger() {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setVisible(true);
    }

    // (a) 30-second timer
    const timer = setTimeout(trigger, SHOW_DELAY_MS);

    // (b) Scroll threshold: 40% of total page height
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= SCROLL_THRESHOLD) {
        trigger();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check immediately in case page is already scrolled (e.g. restored scroll position)
    onScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isAnonymous]);

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!isAnonymous || !visible) return null;

  return (
    <div
      role="complementary"
      aria-label="Sign up prompt"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t-[2px] border-ink bg-cream px-4 py-3 shadow-[0_-2px_0px_rgba(28,25,23,0.08)] sm:px-6"
    >
      {/* Icon + text */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="hidden shrink-0 sm:flex size-8 items-center justify-center rounded-full border-[2px] border-ink bg-orange/10">
          <Zap className="size-4 text-orange" />
        </div>
        <p className="truncate text-sm font-semibold text-ink">
          Save your progress{' '}
          <span className="hidden sm:inline text-text-secondary font-normal">
            — create a free account to keep your XP and streak.
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink bg-orange px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_#1c1917]"
        >
          Sign Up
        </Link>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
