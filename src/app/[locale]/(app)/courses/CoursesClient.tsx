'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  BookOpen,
  Briefcase,
  Terminal,
  Bot,
  Award,
  Clock,
  Zap,
  Sparkles,
  Layers,
  Target,
  Rocket,
  Hammer,
} from 'lucide-react';
import type { Course, Track } from '@/types';
import { TRACK_INFO } from '@/types';

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const TRACK_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  BookOpen,
  Briefcase,
  Terminal,
  Bot,
  Award,
  Sparkles,
  Layers,
  Target,
  Rocket,
  Hammer,
};

// ---------------------------------------------------------------------------
// Design F difficulty badge colors (colorful pills)
// ---------------------------------------------------------------------------
const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-600' },
  intermediate: { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-500' },
  advanced:     { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-500' },
  expert:       { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-600' },
};

// ---------------------------------------------------------------------------
// Track accent colors — OpenAI green-anchored palette
// ---------------------------------------------------------------------------
const TRACK_ICON_BG: Record<Track, string> = {
  why_claude:         'bg-teal',
  three_levels:       'bg-orange',
  essentials:         'bg-game-purple',
  level_up:           'bg-orange',
  build_something:    'bg-teal',
  practitioner_setup: 'bg-game-blue',
  advanced_workflows: 'bg-teal',
};

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------
type FilterTab = 'all' | Track;
type FilterKey =
  | 'filterAll'
  | 'filterWhyGPT'
  | 'filterThreeLevels'
  | 'filterEssentials'
  | 'filterLevelUp'
  | 'filterBuildSomething'
  | 'filterPractitionerSetup'
  | 'filterAdvancedWorkflows';

const FILTER_TABS: { value: FilterTab; labelKey: FilterKey }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'why_claude', labelKey: 'filterWhyGPT' },
  { value: 'three_levels', labelKey: 'filterThreeLevels' },
  { value: 'essentials', labelKey: 'filterEssentials' },
  { value: 'level_up', labelKey: 'filterLevelUp' },
  { value: 'build_something', labelKey: 'filterBuildSomething' },
  { value: 'practitioner_setup', labelKey: 'filterPractitionerSetup' },
  { value: 'advanced_workflows', labelKey: 'filterAdvancedWorkflows' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface CoursesClientProps {
  courses: Course[];
  isPro?: boolean;
}

export function CoursesClient({ courses, isPro }: CoursesClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const t = useTranslations('courses');

  const filtered =
    activeTab === 'all'
      ? courses
      : courses.filter((c) => c.track === activeTab);

  const sorted = [...filtered].sort((a, b) => {
    const trackOrder = Object.keys(TRACK_INFO) as Track[];
    const ta = trackOrder.indexOf(a.track);
    const tb = trackOrder.indexOf(b.track);
    if (ta !== tb) return ta - tb;
    return a.order_index - b.order_index;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('subheading')}
        </p>
      </div>

      {/* Filter tabs -- chunky pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'border-orange bg-orange text-white shadow-sm'
                  : 'border-[#e5e7eb] bg-white text-ink hover:border-orange/40 hover:bg-[#f7f7f8]'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Course grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((course) => {
          const trackInfo = TRACK_INFO[course.track];
          const Icon = TRACK_ICONS[trackInfo.icon] ?? BookOpen;
          const estMinutes = course.lesson_count * 15;
          const diffStyle = DIFFICULTY_STYLES[course.difficulty] ?? DIFFICULTY_STYLES.beginner;

          return (
            <Link key={course.id} href={`/courses/${course.slug}`} className="group">
              <div className="card-f relative flex h-full flex-col overflow-hidden">

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  {/* Icon + badges row */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-2xl border-2 border-ink text-white ${TRACK_ICON_BG[course.track]}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPro ? (
                        <span className="badge-f border-teal bg-emerald-50 text-teal">
                          {t('badgeFree')}
                        </span>
                      ) : (
                        <span className="badge-f border-orange bg-orange/10 text-orange">
                          {t('badgePro')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold leading-tight text-ink">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  {/* Difficulty + track badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} rounded-full border-2 px-3 py-0.5 text-xs font-bold capitalize`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="rounded-full border-2 border-border bg-warm-white px-3 py-0.5 text-xs font-bold text-muted-foreground">
                      {trackInfo.name.replace('ChatGPT ', '').replace(' Mastery', '')}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {t('lessonsCount', { count: course.lesson_count })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {t('minutesShort', { minutes: estMinutes })}
                    </span>
                    <span className="mono-f flex items-center gap-1 text-orange">
                      <Zap className="size-3.5" />
                      {t('xpShort', { xp: course.lesson_count * 100 })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
