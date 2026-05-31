"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getLocalProgress, type LocalProgressEntry } from "@/lib/local-progress";
import { ContinueWhereYouLeftOff } from "@/components/ContinueWhereYouLeftOff";

/**
 * Client-side "Continue where you left off" banner for anonymous users.
 *
 * Reads localStorage on mount and renders the same visual banner as the
 * server-side version. Only renders when there is local progress AND
 * the user is NOT authenticated (caller is responsible for that gate).
 */
export function LocalContinueBanner() {
  const t = useTranslations("dashboard");
  const [entry, setEntry] = useState<LocalProgressEntry | null>(null);

  useEffect(() => {
    setEntry(getLocalProgress());
  }, []);

  if (!entry) return null;

  // Build the same continueData shape the server-side banner expects.
  const continueData = {
    courseTitle: formatSlug(entry.courseSlug),
    lessonTitle: formatSlug(entry.lessonSlug),
    href: `/courses/${entry.courseSlug}/${entry.lessonSlug}`,
    // We don't know overall course progress for anonymous users,
    // so show 0 which triggers the "start" variant of the banner.
    progress: 0,
  };

  return (
    <ContinueWhereYouLeftOff
      continueData={continueData}
      allComplete={false}
      translations={{
        continueLabel: t("continueHeader"),
        startJourneyLabel: t("startJourneyLabel"),
        startJourneySubtitle: t("startJourneySubtitle"),
        courseProgress: t("courseProgress"),
        resumeButton: t("resumeButton"),
        startButton: t("startButton"),
      }}
    />
  );
}

/** Converts "my-cool-slug" → "My Cool Slug" for display. */
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
