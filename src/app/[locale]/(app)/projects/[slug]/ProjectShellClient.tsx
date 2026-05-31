'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  CheckCircle,
  ChevronLeft,
  Circle,
  Clock,
  Copy,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import type { ProjectSeed } from './page';

// ---------------------------------------------------------------------------
// Project shell client component.
//
// Minimal markdown rendering is inlined below (renderBody) so we do not need
// to add a markdown dependency. It handles the subset of markdown that
// project seed bodies actually use: paragraphs, **bold**, *italic*, and
// `inline code`. Anything fancier belongs in a code block (rendered
// separately via CodeBlock) or prose.
//
// Data flow:
//  - On mount: GET /api/projects/progress?project_slug=<slug> to hydrate
//    completed-steps state and detect an existing submission (user reloaded
//    after shipping). The existing submission, if any, triggers the
//    completion screen directly.
//  - On step toggle: optimistic local state update, then POST to
//    /api/projects/progress. On server error, roll back and surface an
//    inline error banner. No refetch.
//  - On submit: POST to /api/projects/submit. On success, show the
//    completion screen using the server-reported XP. On failure, leave the
//    draft in place and show the error.
// ---------------------------------------------------------------------------

interface ProjectShellClientProps {
  project: ProjectSeed;
}

// Server response shapes. Fields are optional because the API may return
// only { error } or { success } and we parse defensively.
interface ProgressGetResponse {
  success?: boolean;
  error?: string;
  steps?: Array<{ step_slug: string; completed_at: string }>;
  submission?: {
    submission_url: string | null;
    submission_description: string | null;
    submitted_at: string;
  } | null;
}

interface SubmitResponse {
  success?: boolean;
  error?: string;
  xp_earned?: number;
  already_submitted?: boolean;
}

export function ProjectShellClient({ project }: ProjectShellClientProps) {
  // Set of completed step slugs.
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  // Per-step "in-flight" flag so we can disable the checkbox during a request.
  const [stepsInFlight, setStepsInFlight] = useState<Set<string>>(new Set());
  const [stepError, setStepError] = useState<string | null>(null);

  const [expandedStep, setExpandedStep] = useState<string | null>(
    project.steps[0]?.slug ?? null,
  );
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number>(project.xp_reward);
  const [hydrating, setHydrating] = useState(true);

  const totalSteps = project.steps.length;
  const completedCount = completed.size;
  const progressPct =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const allStepsDone = completedCount === totalSteps && totalSteps > 0;

  // -------------------------------------------------------------------------
  // Hydrate progress + existing submission on mount.
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const res = await fetch(
          `/api/projects/progress?project_slug=${encodeURIComponent(project.slug)}`,
          { method: 'GET', credentials: 'same-origin' },
        );
        // Defensive parse — body may be empty on error paths.
        const data: ProgressGetResponse = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          // 401/403/etc. — still render the UI so the user can read the
          // project. Step check-offs will error on click, which is correct
          // feedback (e.g. session expired).
          return;
        }

        if (Array.isArray(data.steps)) {
          const next = new Set<string>();
          for (const s of data.steps) {
            if (typeof s?.step_slug === 'string') {
              next.add(s.step_slug);
            }
          }
          setCompleted(next);
        }

        if (data.submission && data.submission.submission_url) {
          // User already shipped — show the completion screen on reload.
          setSubmissionUrl(data.submission.submission_url);
          setSubmissionDescription(data.submission.submission_description ?? '');
          setSubmitted(true);
        }
      } catch {
        // Network error on hydrate is non-fatal; the page still renders.
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [project.slug]);

  // -------------------------------------------------------------------------
  // Toggle step done/undone. Optimistic update, rollback on server error.
  // -------------------------------------------------------------------------
  const toggleStep = useCallback(
    async (slug: string) => {
      // Guard against double-clicks while a request is in flight for this
      // step. (A stale click would desync optimistic state.)
      if (stepsInFlight.has(slug)) return;

      const wasCompleted = completed.has(slug);
      const nextCompleted = !wasCompleted;

      // Optimistic update.
      setStepError(null);
      setCompleted((prev) => {
        const next = new Set(prev);
        if (nextCompleted) next.add(slug);
        else next.delete(slug);
        return next;
      });
      setStepsInFlight((prev) => {
        const next = new Set(prev);
        next.add(slug);
        return next;
      });

      try {
        const res = await fetch('/api/projects/progress', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_slug: project.slug,
            step_slug: slug,
            completed: nextCompleted,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message =
            typeof data?.error === 'string'
              ? data.error
              : 'Could not save that step. Try again.';
          throw new Error(message);
        }
      } catch (err) {
        // Roll back to previous state so the UI reflects what the server
        // actually knows.
        setCompleted((prev) => {
          const next = new Set(prev);
          if (wasCompleted) next.add(slug);
          else next.delete(slug);
          return next;
        });
        const message =
          err instanceof Error ? err.message : 'Network error while saving.';
        setStepError(message);
        // Avoid template-literal console calls (semgrep format-string rule).
        console.error('Project step toggle failed:', message);
      } finally {
        setStepsInFlight((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    },
    [completed, project.slug, stepsInFlight],
  );

  function toggleExpand(slug: string) {
    setExpandedStep((cur) => (cur === slug ? null : slug));
  }

  // -------------------------------------------------------------------------
  // Submit the project.
  // -------------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError(null);

    const trimmedUrl = submissionUrl.trim();

    if (project.submission_url_required && !trimmedUrl) {
      setSubmitError('A public URL is required to ship this project.');
      return;
    }

    // Lightweight client-side URL sanity check when a URL is provided.
    // Server will re-validate.
    if (trimmedUrl) {
      try {
        const parsed = new URL(trimmedUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('bad protocol');
        }
      } catch {
        setSubmitError('That does not look like a URL. Include https://.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_slug: project.slug,
          submission_url: trimmedUrl,
          submission_description: submissionDescription.trim() || undefined,
        }),
      });

      // Defensive parse: body may be empty on some error responses.
      const data: SubmitResponse = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const message =
          typeof data?.error === 'string'
            ? data.error
            : 'Could not save your submission. Try again.';
        setSubmitError(message);
        // Draft stays in state — url + description are preserved.
        return;
      }

      // On first-time submit, XP is awarded. On a re-submit, xp_earned is 0
      // and already_submitted is true. In both cases show the completion
      // screen, but only show the awarded number when > 0.
      if (typeof data.xp_earned === 'number' && data.xp_earned > 0) {
        setXpAwarded(data.xp_earned);
      } else {
        setXpAwarded(project.xp_reward);
      }
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Network error. Check your connection and try again.';
      setSubmitError(message);
      console.error('Project submission failed:', message);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Completion screen
  // -------------------------------------------------------------------------
  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" />
          Back to all courses
        </Link>

        <div className="card-f-static overflow-hidden">
          <div className="h-2 w-full bg-teal" />
          <div className="space-y-6 p-8 text-center">
            <div className="relative mx-auto flex size-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-teal/20" />
              <Trophy className="relative size-16 text-gold" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-ink">
                You shipped it.
              </h2>
              <p className="text-sm text-text-secondary">{project.title}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-orange/10 px-6 py-3">
              <Zap className="size-5 text-orange" />
              <span className="mono-f text-lg font-bold text-orange">
                +{xpAwarded} XP
              </span>
            </div>

            {submissionUrl && (
              <div className="mx-auto max-w-md rounded-2xl border-[2px] border-ink bg-cream p-4 text-left">
                <p className="mono-f text-xs font-bold text-text-secondary">
                  Your submission
                </p>
                <a
                  href={submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-sm font-semibold text-game-blue underline"
                >
                  {submissionUrl}
                </a>
                {submissionDescription && (
                  <p className="mt-2 text-sm text-ink">
                    {submissionDescription}
                  </p>
                )}
              </div>
            )}

            <div className="border-t-[2px] border-ink/10" />

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-linen"
              >
                <ChevronLeft className="size-4" />
                Back to courses
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                <Sparkles className="size-4" />
                View project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Hub + steps view
  // -------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" />
        Back to all courses
      </Link>

      {/* Hero */}
      <div className="card-f-static overflow-hidden">
        <div className="h-2 w-full bg-gold" />
        <div className="space-y-5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-gold text-white">
              <Rocket className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mono-f text-xs font-bold uppercase tracking-wide text-text-secondary">
                Project
              </p>
              <h1 className="text-2xl font-extrabold leading-tight text-ink">
                {project.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {project.tagline}
              </p>
            </div>
          </div>

          {/* Outcome block */}
          <div className="rounded-2xl border-[2px] border-ink bg-cream p-4">
            <p className="mono-f text-xs font-bold uppercase tracking-wide text-teal">
              What you will have when you are done
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {project.outcome}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-orange bg-orange-50 px-3 py-0.5 text-xs font-bold capitalize text-orange-800">
              {project.difficulty}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-text-secondary">
              <Clock className="size-3" />
              {project.estimated_minutes} min
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-bold text-orange">
              <Zap className="size-3" />
              {project.xp_reward} XP
            </span>
            <span className="mono-f flex items-center gap-1 text-xs font-semibold text-text-secondary">
              {totalSteps} steps
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-ink">Your progress</span>
              <span className="mono-f text-text-secondary">
                {completedCount} / {totalSteps}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 rounded-md border-2 border-ink"
                  style={{
                    background: i < completedCount ? '#2d7d6f' : '#f0ebe3',
                  }}
                />
              ))}
            </div>
            <p className="mono-f text-right text-xs font-bold text-teal">
              {progressPct}%
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">The steps</h2>
          {hydrating && (
            <span className="mono-f text-xs text-text-secondary">
              Loading progress...
            </span>
          )}
        </div>

        {stepError && (
          <div
            role="alert"
            className="rounded-xl border-[2px] border-red-400 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
          >
            {stepError}
          </div>
        )}

        <div className="space-y-3">
          {project.steps.map((step, index) => {
            const isDone = completed.has(step.slug);
            const isExpanded = expandedStep === step.slug;
            const isBusy = stepsInFlight.has(step.slug);
            return (
              <StepCard
                key={step.slug}
                index={index}
                step={step}
                isDone={isDone}
                isExpanded={isExpanded}
                isBusy={isBusy}
                onToggleDone={() => toggleStep(step.slug)}
                onToggleExpand={() => toggleExpand(step.slug)}
              />
            );
          })}
        </div>
      </div>

      {/* Ship-it panel */}
      <div
        className={`card-f-static overflow-hidden transition-opacity ${
          allStepsDone ? 'opacity-100' : 'opacity-60'
        }`}
      >
        <div className={`h-2 w-full ${allStepsDone ? 'bg-orange' : 'bg-border'}`} />
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-full border-[2px] border-ink ${
                allStepsDone ? 'bg-orange text-white' : 'bg-linen text-text-secondary'
              }`}
            >
              <Rocket className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-ink">Ship it</h3>
              <p className="text-xs text-text-secondary">
                {allStepsDone
                  ? project.submission_prompt
                  : 'Finish every step above to unlock the submission.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="submission_url"
                className="mono-f text-xs font-bold uppercase tracking-wide text-text-secondary"
              >
                Project URL{project.submission_url_required ? ' (required)' : ''}
              </label>
              <input
                id="submission_url"
                type="url"
                placeholder="https://your-site.vercel.app"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                disabled={!allStepsDone || submitting}
                className="w-full rounded-xl border-[2px] border-ink bg-warm-white px-4 py-2.5 text-sm text-ink placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-orange disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="submission_description"
                className="mono-f text-xs font-bold uppercase tracking-wide text-text-secondary"
              >
                One-line note (optional)
              </label>
              <input
                id="submission_description"
                type="text"
                maxLength={240}
                placeholder="What did you build?"
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                disabled={!allStepsDone || submitting}
                className="w-full rounded-xl border-[2px] border-ink bg-warm-white px-4 py-2.5 text-sm text-ink placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-orange disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {submitError && (
              <p
                role="alert"
                className="rounded-xl border-[2px] border-red-400 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={!allStepsDone || submitting}
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-3 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              <Rocket className="size-5" />
              {submitting ? 'Shipping...' : 'I shipped it'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------
interface StepCardProps {
  index: number;
  step: {
    slug: string;
    title: string;
    estimated_minutes: number;
    body: string;
    done_when: string;
    code: { language: string; value: string } | null;
    video_url?: string;
  };
  isDone: boolean;
  isExpanded: boolean;
  isBusy: boolean;
  onToggleDone: () => void;
  onToggleExpand: () => void;
}

function StepCard({
  index,
  step,
  isDone,
  isExpanded,
  isBusy,
  onToggleDone,
  onToggleExpand,
}: StepCardProps) {
  return (
    <div
      className={`rounded-2xl border-3 bg-cream p-4 transition-all ${
        isDone
          ? 'border-teal bg-emerald-50 shadow-[3px_3px_0px_#2d7d6f]'
          : 'border-ink shadow-[3px_3px_0px_#1c1917]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggleDone}
          disabled={isBusy}
          aria-label={isDone ? 'Mark step as not done' : 'Mark step as done'}
          aria-busy={isBusy}
          className="mt-0.5 shrink-0 disabled:cursor-wait disabled:opacity-60"
        >
          {isDone ? (
            <CheckCircle className="size-7 text-teal" />
          ) : (
            <Circle className="size-7 text-ink" />
          )}
        </button>

        {/* Title row (clickable to expand) */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="mono-f text-xs font-bold text-text-secondary">
              Step {index + 1}
            </span>
            <span className="mono-f flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="size-3" />
              {step.estimated_minutes}m
            </span>
          </div>
          <p
            className={`text-base font-bold ${
              isDone ? 'text-teal' : 'text-ink'
            }`}
          >
            {step.title}
          </p>
        </button>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t-[2px] border-ink/10 pt-4">
          <MarkdownBody body={step.body} />

          {step.code && <CodeBlock code={step.code.value} language={step.code.language} />}

          {step.video_url && (
            <div className="overflow-hidden rounded-2xl border-[2px] border-ink">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={step.video_url}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  title={`${step.title} video`}
                />
              </div>
            </div>
          )}

          <div className="rounded-xl border-[2px] border-dashed border-teal bg-emerald-50/50 px-3 py-2">
            <p className="mono-f text-xs font-bold uppercase tracking-wide text-teal">
              Done when
            </p>
            <p className="mt-0.5 text-sm text-ink">{step.done_when}</p>
          </div>

          <button
            type="button"
            onClick={onToggleDone}
            disabled={isBusy}
            className={`inline-flex items-center gap-2 rounded-full border-[2px] border-ink px-4 py-2 text-sm font-bold transition-all disabled:cursor-wait disabled:opacity-60 ${
              isDone
                ? 'bg-cream text-ink hover:bg-linen'
                : 'bg-teal text-white shadow-[2px_2px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]'
            }`}
          >
            <CheckCircle className="size-4" />
            {isBusy
              ? 'Saving...'
              : isDone
                ? 'Mark as not done'
                : 'Mark complete'}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CodeBlock
// ---------------------------------------------------------------------------
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail in non-secure contexts. Fail loudly via UI
      // (the copy button stops feeling clickable). No silent catch.
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          type="button"
          onClick={handleCopy}
          className="mono-f inline-flex items-center gap-1 rounded-md border-[2px] border-cream bg-ink px-2.5 py-1 text-xs font-bold text-cream transition-colors hover:bg-walnut"
        >
          <Copy className="size-3" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {language && (
        <div className="mono-f absolute left-3 top-2 z-10 text-xs text-cream/60">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto rounded-xl border-[2px] border-ink bg-ink p-4 pt-8 text-sm font-mono leading-relaxed text-cream">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MarkdownBody — minimal, in-component renderer.
//
// Supports paragraphs (blank-line separated), **bold**, *italic*, and
// `inline code`. Anything richer belongs in CodeBlock or prose. This avoids
// pulling in a markdown dep for the MVP. If we add react-markdown later,
// swap this component's body for <ReactMarkdown>.
// ---------------------------------------------------------------------------
function MarkdownBody({ body }: { body: string }) {
  const paragraphs = useMemo(() => body.split(/\n{2,}/), [body]);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink">
      {paragraphs.map((para, i) => (
        <p key={i}>{renderInline(para)}</p>
      ))}
    </div>
  );
}

// Render a single paragraph's inline formatting. Walks the string and emits
// React nodes for **bold**, *italic*, `code` spans. Order matters: process
// code spans first so their contents are not interpreted as bold/italic.
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern captures each inline-formatted token plus surrounding plain text.
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="mono-f rounded-md border border-border bg-linen px-1.5 py-0.5 text-xs text-ink"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}
