"use client";

import { useState, useEffect } from "react";
import { getActiveLearners } from "@/lib/social-proof";

export function SocialProofBanner() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getActiveLearners());

    // Refresh every 5 minutes to match the window key
    const interval = setInterval(() => {
      setCount(getActiveLearners());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <span className="inline-block size-2 rounded-full bg-teal animate-pulse" />
      <span>
        <span className="mono-f font-semibold text-ink">{count}</span>{" "}
        learners active right now
      </span>
    </div>
  );
}
