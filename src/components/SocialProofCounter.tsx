"use client";

import { useState, useEffect } from "react";
import { getLessonCompletionsToday } from "@/lib/social-proof";

interface SocialProofCounterProps {
  lessonSlug: string;
}

export function SocialProofCounter({ lessonSlug }: SocialProofCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getLessonCompletionsToday(lessonSlug));
  }, [lessonSlug]);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary/70">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span>
        <span className="mono-f font-semibold">{count}</span> people completed
        this lesson today
      </span>
    </div>
  );
}
