'use client';

import { useState, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import {
  ChevronLeft,
  ArrowRight,
  Zap,
  CheckCircle,
  BookOpen,
  Hammer,
  Upload,
  ClipboardCheck,
  Trophy,
  Rocket,
  AlertCircle,
  ExternalLink,
  Save,
} from 'lucide-react';
import type { Mission, MissionStep, UserMission, MissionStepType } from '@/types';
import { SanitizedHtml } from '@/components/SanitizedHtml';

// ---------------------------------------------------------------------------
// Step type styling
// ---------------------------------------------------------------------------
const STEP_TYPE_META: Record<
  MissionStepType,
  { icon: typeof BookOpen; label: string; emoji: string; bg: string; border: string; text: string }
> = {
  learn: {
    icon: BookOpen,
    label: 'Learn',
    emoji: '\uD83D\uDCD6',
    bg: 'bg-emerald-50',
    border: 'border-teal',
    text: 'text-teal',
  },
  build: {
    icon: Hammer,
    label: 'Build',
    emoji: '\uD83D\uDD28',
    bg: 'bg-orange-50',
    border: 'border-orange',
    text: 'text-orange',
  },
  deploy: {
    icon: Upload,
    label: 'Deploy',
    emoji: '\uD83D\uDE80',
    bg: 'bg-purple-50',
    border: 'border-game-purple',
    text: 'text-game-purple',
  },
  checkpoint: {
    icon: ClipboardCheck,
    label: 'Checkpoint',
    emoji: '\u2705',
    bg: 'bg-yellow-50',
    border: 'border-gold',
    text: 'text-gold',
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MissionPlayerClientProps {
  mission: Mission;
  steps: MissionStep[];
  userMission: UserMission;
  missionSlug: string;
}

export function MissionPlayerClient({
  mission,
  steps,
  userMission,
  missionSlug,
}: MissionPlayerClientProps) {
  // current_step in DB is 1-based; convert to 0-based index for array access
  const [stepIndex, setStepIndex] = useState(Math.max(0, userMission.current_step - 1));
  const [projectData, setProjectData] = useState<Record<string, unknown>>(
    userMission.project_data ?? {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [completedMission, setCompletedMission] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(userMission.xp_earned ?? 0);

  // Text inputs for build / deploy steps
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const totalSteps = steps.length;
  const step = steps[stepIndex] ?? null;
  const isLastStep = stepIndex === totalSteps - 1;
  const progressPct = totalSteps > 0 ? Math.round((stepIndex / totalSteps) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Save progress to API
  // ---------------------------------------------------------------------------
  const saveProgress = useCallback(
    async (stepNumber: number, data: Record<string, unknown>, isComplete: boolean) => {
      setSaveError(null);
      setIsSaving(true);
      try {
        const res = await fetch(`/api/missions/${missionSlug}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step_number: stepNumber,
            project_data: data,
            is_complete: isComplete,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? 'Failed to save progress');
        }
        const result = await res.json();
        if (result.xp_earned) {
          setTotalXpEarned((prev) => prev + result.xp_earned);
          setXpPopup(result.xp_earned);
          setTimeout(() => setXpPopup(null), 1500);
        }
        return result;
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save progress');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [missionSlug],
  );

  // ---------------------------------------------------------------------------
  // Advance to next step
  // ---------------------------------------------------------------------------
  async function handleAdvance() {
    if (!step) return;

    // Gather step-specific data
    const stepData: Record<string, unknown> = { ...projectData };
    if (step.step_type === 'build' && textInput.trim()) {
      stepData[`step_${stepIndex + 1}_notes`] = textInput.trim();
    }
    if (step.step_type === 'deploy' && urlInput.trim()) {
      stepData[`step_${stepIndex + 1}_url`] = urlInput.trim();
    }

    setProjectData(stepData);

    // API expects 1-based step_number (the step being completed)
    const result = await saveProgress(stepIndex + 1, stepData, isLastStep);

    if (!result) return; // save failed

    if (isLastStep) {
      setCompletedMission(true);
      return;
    }

    // Animate to next step
    setFadeState('out');
    setTimeout(() => {
      setStepIndex((prev) => prev + 1);
      setTextInput('');
      setUrlInput('');
      setFadeState('in');
    }, 150);
  }

  // ---------------------------------------------------------------------------
  // Go back
  // ---------------------------------------------------------------------------
  function handleBack() {
    if (stepIndex <= 0) return;
    setFadeState('out');
    setTimeout(() => {
      setStepIndex((prev) => prev - 1);
      setTextInput('');
      setUrlInput('');
      setFadeState('in');
    }, 150);
  }

  // ---------------------------------------------------------------------------
  // Mission Complete screen
  // ---------------------------------------------------------------------------
  if (completedMission) {
    return (
      <div className="space-y-6">
        <Link
          href="/missions"
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          All Missions
        </Link>

        <div className="card-f-static overflow-hidden">
          <div className="h-2 w-full bg-teal" />
          <div className="space-y-6 p-8 text-center">
            <div className="relative mx-auto flex size-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-teal/20" />
              <Trophy className="relative size-12 text-gold" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-ink">Mission Complete!</h2>
              <p className="text-sm text-text-secondary">{mission.title}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-orange/10 px-6 py-3">
              <Zap className="size-5 text-orange" />
              <span className="mono-f text-lg font-bold text-orange">
                +{totalXpEarned} XP
              </span>
            </div>

            <div className="pt-4">
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-8 py-3.5 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#1c1917]"
              >
                <Rocket className="size-5" />
                Back to Missions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step view
  // ---------------------------------------------------------------------------
  if (!step) return null;

  const meta = STEP_TYPE_META[step.step_type];
  const StepIcon = meta.icon;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/missions/${missionSlug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          Mission Brief
        </Link>
        <div className="badge-f bg-cream text-orange">
          <Zap className="size-3.5" />
          <span className="tabular-nums">{totalXpEarned} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-ink">{mission.title}</h1>
          <span className="mono-f shrink-0 text-sm font-semibold text-text-secondary">
            Step {stepIndex + 1} of {totalSteps}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-3 flex-1 rounded-md border-2 border-ink"
              style={{
                background: i < stepIndex ? '#2d7d6f' : i === stepIndex ? '#e07a3a' : '#f0ebe3',
              }}
            />
          ))}
        </div>
        <p className="mono-f text-right text-xs font-bold text-teal">{progressPct}%</p>
      </div>

      {/* Error banner */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{saveError}</span>
          <button
            className="ml-auto text-xs font-bold underline"
            onClick={() => setSaveError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step type badge */}
      <div className={`inline-flex items-center gap-2 rounded-full border-2 ${meta.border} ${meta.bg} px-4 py-1.5`}>
        <StepIcon className={`size-4 ${meta.text}`} />
        <span className={`text-xs font-bold ${meta.text}`}>{meta.emoji} {meta.label}</span>
      </div>

      {/* XP popup */}
      {xpPopup !== null && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce rounded-full border-2 border-ink bg-orange/20 px-6 py-3 text-lg font-bold text-orange shadow-lg backdrop-blur-sm">
            <Zap className="mr-1 inline size-5" />
            +{xpPopup} XP
          </div>
        </div>
      )}

      {/* Step content with fade transition */}
      <div
        className={`min-h-[200px] transition-all duration-150 ${
          fadeState === 'in' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="card-f-static space-y-5 p-6">
          <h2 className="text-xl font-extrabold text-ink">{step.title}</h2>
          <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>

          {/* --- Learn step --- */}
          {step.step_type === 'learn' && step.course_slug && step.lesson_slug && (
            <div className="space-y-4">
              <Link
                href={`/courses/${step.course_slug}/${step.lesson_slug}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-teal bg-emerald-50 px-5 py-2.5 text-sm font-bold text-teal transition-all hover:bg-emerald-100"
              >
                <ExternalLink className="size-4" />
                Go to Lesson
              </Link>
              <p className="text-xs text-text-secondary">
                Complete the lesson above, then come back and continue.
              </p>
            </div>
          )}

          {/* --- Build step instructions --- */}
          {step.step_type === 'build' && step.instructions && (
            <div className="space-y-4">
              {step.instructions.sections.map((section, i) => {
                if (section.type === 'text' || section.type === 'summary') {
                  return (
                    <SanitizedHtml
                      key={i}
                      html={section.content}
                      className="prose-f text-sm leading-relaxed text-text-secondary"
                    />
                  );
                }
                if (section.type === 'code_example') {
                  return (
                    <div key={i} className="space-y-1">
                      {section.caption && (
                        <p className="text-xs font-medium text-text-secondary">{section.caption}</p>
                      )}
                      <pre className="overflow-x-auto rounded-xl border-2 border-ink bg-ink p-4 text-sm font-mono leading-relaxed text-cream">
                        {section.code}
                      </pre>
                    </div>
                  );
                }
                return null;
              })}

              {/* Text input for notes / code */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  Your Work / Notes
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink bg-cream p-3 text-sm font-mono text-ink placeholder:text-text-secondary focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
                  rows={6}
                  placeholder="Paste your code, notes, or work here..."
                />
              </div>
            </div>
          )}

          {/* --- Deploy step --- */}
          {step.step_type === 'deploy' && (
            <div className="space-y-4">
              {step.instructions && step.instructions.sections.map((section, i) => {
                if (section.type === 'text' || section.type === 'summary') {
                  return (
                    <SanitizedHtml
                      key={i}
                      html={section.content}
                      className="prose-f text-sm leading-relaxed text-text-secondary"
                    />
                  );
                }
                if (section.type === 'code_example') {
                  return (
                    <div key={i} className="space-y-1">
                      {section.caption && (
                        <p className="text-xs font-medium text-text-secondary">{section.caption}</p>
                      )}
                      <pre className="overflow-x-auto rounded-xl border-2 border-ink bg-ink p-4 text-sm font-mono leading-relaxed text-cream">
                        {section.code}
                      </pre>
                    </div>
                  );
                }
                return null;
              })}

              {/* URL input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  Paste your deployed URL here
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl border-2 border-ink bg-cream p-3 text-sm text-ink placeholder:text-text-secondary focus:border-game-purple focus:outline-none focus:ring-2 focus:ring-game-purple/20"
                  placeholder="https://your-project.vercel.app"
                />
              </div>
            </div>
          )}

          {/* --- Checkpoint step --- */}
          {step.step_type === 'checkpoint' && (
            <div className="rounded-2xl border-2 border-gold bg-yellow-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <CheckCircle className="size-4 text-gold" />
                Review Your Progress
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Take a moment to review what you've built so far. Make sure everything works as expected before continuing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between border-t-2 border-border pt-4">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-linen"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleAdvance}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917] disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Save className="size-4 animate-pulse" />
              Saving...
            </>
          ) : isLastStep ? (
            <>
              <Trophy className="size-4" />
              Complete Mission
            </>
          ) : step.step_type === 'build' ? (
            <>
              Save &amp; Continue
              <ArrowRight className="size-4" />
            </>
          ) : step.step_type === 'deploy' ? (
            <>
              I've deployed it!
              <ArrowRight className="size-4" />
            </>
          ) : step.step_type === 'learn' ? (
            <>
              I've completed this lesson
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
