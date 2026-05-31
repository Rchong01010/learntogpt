'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Clock, Zap, ListChecks, Sparkles } from 'lucide-react';
import type { Difficulty, Mission, UserMission } from '@/types';

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-600' },
  intermediate: { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-500' },
  advanced:     { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-500' },
  expert:       { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-600' },
};

const FILTERS: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
];

interface MissionsFilterProps {
  missions: Mission[];
  userMissionMap: Record<string, UserMission>;
}

export function MissionsFilter({ missions, userMissionMap }: MissionsFilterProps) {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const filtered = filter === 'all'
    ? missions
    : missions.filter((m) => m.difficulty === filter);

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              filter === f.value
                ? 'border-ink bg-ink text-white shadow-[2px_2px_0px_#1c1917]'
                : 'border-ink bg-cream text-ink hover:bg-linen'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mission grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mission) => {
          const um = userMissionMap[mission.id];
          const isActive = um && um.status !== 'completed';
          const isCompleted = um?.status === 'completed';
          const diffStyle = DIFFICULTY_STYLES[mission.difficulty] ?? DIFFICULTY_STYLES.beginner;
          const progressPct = um?.progress_percent ?? 0;

          return (
            <Link
              key={mission.id}
              href={`/missions/${mission.slug}`}
              className="card-f group flex flex-col overflow-hidden"
            >
              {/* Emoji hero */}
              <div className="flex items-center justify-center bg-linen py-6">
                <span className="text-6xl">{mission.cover_emoji}</span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Title */}
                <h3 className="text-base font-extrabold leading-tight text-ink">
                  {mission.title}
                </h3>

                {/* Description */}
                <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                  {mission.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold capitalize`}
                  >
                    {mission.difficulty}
                  </span>
                  {mission.is_free && (
                    <span className="rounded-full border-2 border-teal bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-teal">
                      FREE
                    </span>
                  )}
                  {isCompleted && (
                    <span className="rounded-full border-2 border-teal bg-teal px-2.5 py-0.5 text-[10px] font-bold text-white">
                      COMPLETE
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <span className="mono-f flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
                    <Clock className="size-3" />
                    ~{mission.estimated_hours}h
                  </span>
                  <span className="mono-f flex items-center gap-1 text-[10px] font-bold text-orange">
                    <Zap className="size-3" />
                    {mission.max_xp} XP
                  </span>
                  <span className="mono-f flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
                    <ListChecks className="size-3" />
                    {mission.step_count} steps
                  </span>
                </div>

                {/* Progress bar for active missions */}
                {isActive && (
                  <div className="space-y-1">
                    <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-ink bg-linen">
                      <div
                        className="h-full rounded-full bg-teal transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="mono-f text-right text-[10px] font-bold text-teal">
                      {progressPct}%
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-f-static p-8 text-center">
          <Sparkles className="mx-auto size-8 text-text-secondary" />
          <p className="mt-3 text-sm font-semibold text-text-secondary">
            No missions found for this difficulty level yet. Check back soon!
          </p>
        </div>
      )}
    </>
  );
}
