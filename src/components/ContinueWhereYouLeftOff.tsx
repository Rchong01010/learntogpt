import { ArrowRight, BookOpen, Play } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ContinueWhereYouLeftOffProps {
  continueData: {
    courseTitle: string;
    lessonTitle: string;
    href: string;
    progress: number;
  } | null;
  /** True when user has completed every lesson across all courses */
  allComplete: boolean;
  translations: {
    continueLabel: string;
    startJourneyLabel: string;
    startJourneySubtitle: string;
    courseProgress: string;
    resumeButton: string;
    startButton: string;
  };
}

/**
 * Prominent banner shown at the very top of the dashboard.
 *
 * - Has progress: "Continue: [Lesson] in [Course]" with direct link
 * - No progress: "Start your journey: Meet ChatGPT" with link to first lesson
 * - All complete: not rendered (parent should not mount this component)
 */
export function ContinueWhereYouLeftOff({
  continueData,
  allComplete,
  translations: t,
}: ContinueWhereYouLeftOffProps) {
  if (allComplete) return null;

  // No progress — show "start your journey" banner
  if (!continueData) return null;

  const isNewStart = continueData.progress === 0;

  return (
    <Link
      href={continueData.href}
      className="group relative block overflow-hidden rounded-2xl border-[3px] border-ink bg-gradient-to-r from-orange/15 via-orange/10 to-teal/10 p-5 shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-orange/20">
            {isNewStart ? (
              <Play className="size-5 text-orange" />
            ) : (
              <BookOpen className="size-5 text-orange" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {isNewStart ? t.startJourneyLabel : t.continueLabel}
            </p>
            <p className="mt-0.5 truncate text-base font-bold text-ink">
              {continueData.lessonTitle}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {isNewStart
                ? t.startJourneySubtitle
                : `${continueData.courseTitle} \u2014 ${t.courseProgress.replace("{progress}", String(continueData.progress))}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isNewStart && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2.5 w-24 overflow-hidden rounded-full border-[2px] border-ink bg-linen">
                <div
                  className="h-full rounded-full bg-teal transition-all"
                  style={{ width: `${continueData.progress}%` }}
                />
              </div>
              <span className="mono-f text-xs font-semibold text-teal">
                {continueData.progress}%
              </span>
            </div>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border-[2px] border-ink bg-orange px-4 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0px_#1c1917] transition-all group-hover:shadow-[1px_1px_0px_#1c1917]">
            {isNewStart ? t.startButton : t.resumeButton}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
