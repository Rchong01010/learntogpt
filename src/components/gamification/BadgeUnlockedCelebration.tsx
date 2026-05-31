"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Share2, X } from "lucide-react";

// ---------------------------------------------------------------------------
// BadgeUnlockedCelebration
//
// Brief overlay shown when a new achievement badge is unlocked. Auto-dismisses
// after 6 seconds, or the user can close it manually. Includes a "Share on
// LinkedIn" button with UTM tracking to encourage viral badge shares.
//
// Renders one badge at a time. If multiple badges unlock simultaneously, they
// queue and display sequentially with a short stagger.
// ---------------------------------------------------------------------------

interface BadgeUnlockedCelebrationProps {
  /** Achievement names returned from the progress API */
  achievements: string[];
}

export function BadgeUnlockedCelebration({
  achievements,
}: BadgeUnlockedCelebrationProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Populate queue when new achievements arrive
  useEffect(() => {
    if (achievements.length > 0) {
      setQueue((prev) => {
        const existing = new Set(prev);
        const newItems = achievements.filter((a) => !existing.has(a));
        return [...prev, ...newItems];
      });
    }
  }, [achievements]);

  // Show next badge from queue
  useEffect(() => {
    if (current || queue.length === 0) return;

    const next = queue[0];
    setCurrent(next);
    setQueue((prev) => prev.slice(1));

    // Animate in after a brief delay so the DOM has time to render
    const showTimer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(showTimer);
  }, [current, queue]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible || !current) return;

    const timer = setTimeout(() => {
      dismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [visible, current]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    setVisible(false);
    // Wait for exit animation before clearing current
    setTimeout(() => {
      setCurrent(null);
    }, 300);
  }, []);

  function handleLinkedInShare() {
    if (!current) return;
    const text = encodeURIComponent(
      `Just unlocked the "${current}" badge on Learn to GPT! Building real ChatGPT fluency, one lesson at a time.`,
    );
    const url = encodeURIComponent(
      "https://learntogpt.com?utm_source=linkedin&utm_medium=social&utm_campaign=badge_share",
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (!current) return null;

  return (
    <div
      className={`fixed inset-x-0 top-6 z-50 flex justify-center px-4 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="relative flex w-full max-w-md items-center gap-4 rounded-2xl border-[3px] border-ink bg-cream p-4 shadow-[4px_4px_0px_#1c1917]">
        {/* Gold accent left bar */}
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-gold" />

        {/* Trophy icon */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-[2px] border-gold bg-gold/20">
          <Trophy className="size-6 text-walnut" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">
            Badge Unlocked!
          </p>
          <p className="truncate text-sm font-extrabold text-ink">
            {current}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleLinkedInShare}
            className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#0A66C2] bg-[#0A66C2] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#004182]"
            aria-label="Share on LinkedIn"
          >
            <Share2 className="size-3" />
            Share
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1 text-text-secondary transition-colors hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
