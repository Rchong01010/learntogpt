import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  ChevronLeft,
  Rocket,
  Clock,
  Zap,
  ListChecks,
  CheckCircle,
  BookOpen,
  Hammer,
  Upload,
  ClipboardCheck,
} from 'lucide-react';
import type { Mission, MissionStep, UserMission, MissionStepType } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import { getUser } from '@/lib/auth';
import { MISSIONS_ENABLED } from '@/lib/config';
import { MissionPlayerClient } from './MissionPlayerClient';
import { StartMissionButton } from './StartMissionButton';

// ---------------------------------------------------------------------------
// Design F difficulty badge colors
// ---------------------------------------------------------------------------
const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-600' },
  intermediate: { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-500' },
  advanced:     { bg: 'bg-red-100',     text: 'text-red-800',     border: 'border-red-500' },
  expert:       { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-600' },
};

const STEP_TYPE_META: Record<MissionStepType, { icon: typeof BookOpen; label: string; color: string }> = {
  learn:      { icon: BookOpen,        label: 'Learn',      color: 'text-teal' },
  build:      { icon: Hammer,          label: 'Build',      color: 'text-orange' },
  deploy:     { icon: Upload,          label: 'Deploy',     color: 'text-game-purple' },
  checkpoint: { icon: ClipboardCheck,  label: 'Checkpoint', color: 'text-gold' },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Missions are Claude-branded and not platform-scoped — hidden on LearnToGPT.
  if (!MISSIONS_ENABLED) notFound();

  const { slug } = await params;
  const supabase = await createSupabaseServer();

  // Fetch mission by slug
  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .select('id, title, slug, description, difficulty, project_type, project_brief, learning_outcomes, estimated_hours, max_xp, is_free, cover_emoji, step_count, created_at')
    .eq('slug', slug)
    .single();

  if (missionError || !mission) {
    notFound();
  }

  const m = mission as Mission;

  // Fetch steps ordered by step_number
  const { data: steps } = await supabase
    .from('mission_steps')
    .select('id, mission_id, step_number, title, description, step_type, course_slug, lesson_slug, instructions, xp_reward, estimated_minutes')
    .eq('mission_id', m.id)
    .order('step_number', { ascending: true });

  const stepList = (steps ?? []) as MissionStep[];

  // Fetch user mission progress if authenticated
  const user = await getUser();
  let userMission: UserMission | null = null;

  if (user) {
    const { data: um } = await supabase
      .from('user_missions')
      .select('id, user_id, mission_id, status, current_step, progress_percent, project_data, xp_earned, started_at, completed_at')
      .eq('user_id', user.id)
      .eq('mission_id', m.id)
      .single();

    userMission = um as UserMission | null;
  }

  const diffStyle = DIFFICULTY_STYLES[m.difficulty] ?? DIFFICULTY_STYLES.beginner;
  const isStarted = !!userMission;
  const isCompleted = userMission?.status === 'completed';

  // ---------------------------------------------------------------------------
  // If mission is started (and not completed), show the player
  // ---------------------------------------------------------------------------
  if (isStarted && !isCompleted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <MissionPlayerClient
          mission={m}
          steps={stepList}
          userMission={userMission!}
          missionSlug={slug}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // If completed, show completion state with brief
  // ---------------------------------------------------------------------------
  if (isCompleted) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <Link
          href="/missions"
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          All Missions
        </Link>

        <div className="card-f-static overflow-hidden">
          <div className="h-2 w-full bg-teal" />
          <div className="space-y-5 p-6 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full border-[3px] border-teal bg-emerald-50">
              <CheckCircle className="size-10 text-teal" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink">Mission Complete!</h1>
            <p className="text-sm text-text-secondary">{m.title}</p>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange/10 px-5 py-2">
              <Zap className="size-4 text-orange" />
              <span className="mono-f text-sm font-bold text-orange">
                +{userMission!.xp_earned} XP earned
              </span>
            </div>
            <div className="pt-4">
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#1c1917]"
              >
                Back to Missions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Mission Brief (not started)
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Back link */}
      <Link
        href="/missions"
        className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" />
        All Missions
      </Link>

      {/* Hero card */}
      <div className="card-f-static overflow-hidden">
        <div className="h-2 w-full bg-orange" />
        <div className="space-y-5 p-6">
          {/* Emoji + title */}
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-3 border-ink bg-linen text-4xl">
              {m.cover_emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold leading-tight text-ink">
                {m.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {m.description}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} rounded-full border-2 px-3 py-0.5 text-xs font-bold capitalize`}
            >
              {m.difficulty}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-text-secondary">
              <Clock className="size-3" />
              ~{m.estimated_hours}h
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-bold text-orange">
              <Zap className="size-3" />
              {m.max_xp} XP
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-text-secondary">
              <ListChecks className="size-3" />
              {stepList.length} steps
            </span>
            {m.is_free && (
              <span className="badge-f border-teal bg-emerald-50 text-teal">
                FREE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Project Brief */}
      <div className="card-f-static p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Rocket className="size-5 text-orange" />
          Project Brief
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          {m.project_brief}
        </p>
      </div>

      {/* Learning Outcomes */}
      {m.learning_outcomes && m.learning_outcomes.length > 0 && (
        <div className="card-f-static p-6">
          <h2 className="mb-3 text-lg font-extrabold text-ink">
            What You'll Learn
          </h2>
          <ul className="space-y-2">
            {m.learning_outcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-teal" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Overview */}
      <div className="card-f-static p-6">
        <h2 className="mb-4 text-lg font-extrabold text-ink">
          Mission Steps
        </h2>
        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute left-5 top-5 bottom-5 w-0 border-l-2 border-dashed border-border"
            aria-hidden="true"
          />
          <div className="space-y-3">
            {stepList.map((step) => {
              const meta = STEP_TYPE_META[step.step_type];
              const StepIcon = meta.icon;

              return (
                <div
                  key={step.id}
                  className="relative flex items-center gap-4 rounded-2xl border-2 border-border bg-linen p-3"
                >
                  <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cream ${meta.color}`}>
                    <StepIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{step.title}</p>
                    <p className="text-xs text-text-secondary">{step.description}</p>
                  </div>
                  <span className={`mono-f text-[10px] font-bold uppercase ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start CTA */}
      {user ? (
        <StartMissionButton slug={slug} />
      ) : (
        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-10 py-4 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#1c1917]"
          >
            Sign In to Start
          </Link>
        </div>
      )}
    </div>
  );
}
