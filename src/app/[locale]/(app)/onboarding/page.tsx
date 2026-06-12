"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Onboarding Quiz
//
// 3-step quiz shown to new users immediately after signup.
// Routes them to the most relevant first course based on their answers.
// ---------------------------------------------------------------------------

type Step = 0 | 1 | 2;

const QUESTIONS = [
  {
    label: "What's your experience with AI?",
    options: [
      { id: "never", label: "Never used it" },
      { id: "sometimes", label: "I chat with AI sometimes" },
      { id: "daily", label: "I use AI daily for work" },
    ],
  },
  {
    label: "What do you want to do with ChatGPT?",
    options: [
      { id: "basics", label: "Learn the basics" },
      { id: "prompting", label: "Level up my prompting" },
      { id: "code", label: "Build with ChatGPT API" },
      { id: "agents", label: "Set up agents & automation" },
    ],
  },
  {
    label: "What's your role?",
    options: [
      { id: "developer", label: "Developer" },
      { id: "business", label: "Business professional" },
      { id: "creative", label: "Creative" },
      { id: "student", label: "Student" },
      { id: "other", label: "Other" },
    ],
  },
] as const;

type Answer = {
  experience?: string;
  goal?: string;
  role?: string;
};

/**
 * Map quiz answers to the best first course path.
 * Falls back to the beginner meet-chatgpt lesson.
 */
function resolveDestination(answers: Answer): string {
  const { experience, goal } = answers;

  if (experience === "never" || goal === "basics") {
    return "/courses/why-chatgpt/meet-chatgpt";
  }
  if (experience === "sometimes" && goal === "prompting") {
    return "/courses/strategic-prompting/context-is-everything";
  }
  if (experience === "daily" && goal === "code") {
    return "/courses/practitioner-setup/claude-md-project-spine";
  }
  if (experience === "daily" && goal === "agents") {
    return "/courses/why-chatgpt/from-chatting-to-building";
  }
  // prompting for any experience level
  if (goal === "prompting") {
    return "/courses/strategic-prompting/context-is-everything";
  }
  // code or agents without "daily" experience
  if (goal === "code") {
    return "/courses/practitioner-setup/claude-md-project-spine";
  }
  if (goal === "agents") {
    return "/courses/why-chatgpt/from-chatting-to-building";
  }

  return "/courses/why-chatgpt/meet-chatgpt";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const question = QUESTIONS[step];
  const isLastStep = step === 2;

  function handleSelect(optionId: string) {
    if (animating) return;
    setSelected(optionId);
  }

  function handleNext() {
    if (!selected || animating) return;

    const keys: (keyof Answer)[] = ["experience", "goal", "role"];
    const newAnswers = { ...answers, [keys[step]]: selected };
    setAnswers(newAnswers);

    if (isLastStep) {
      const destination = resolveDestination(newAnswers);
      router.replace(destination as Parameters<typeof router.replace>[0]);
      return;
    }

    // Animate out, advance step, reset selection
    setAnimating(true);
    setTimeout(() => {
      setStep((prev) => (prev + 1) as Step);
      setSelected(null);
      setAnimating(false);
    }, 250);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-4 py-12">
      <div
        className={`w-full max-w-lg transition-all duration-250 ${
          animating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border-[3px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
          {/* Orange accent bar */}
          <div className="h-2 w-full bg-orange" />

          <div className="space-y-8 p-8">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-3">
              {([0, 1, 2] as Step[]).map((i) => (
                <div
                  key={i}
                  className={`h-3 rounded-full border-2 border-ink transition-all duration-300 ${
                    i === step
                      ? "w-8 bg-orange"
                      : i < step
                      ? "w-3 bg-teal"
                      : "w-3 bg-linen"
                  }`}
                />
              ))}
            </div>

            {/* Step label */}
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Step {step + 1} of 3
            </p>

            {/* Question */}
            <h1 className="text-center text-2xl font-extrabold leading-tight text-ink">
              {question.label}
            </h1>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isActive = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full rounded-2xl border-[3px] px-6 py-4 text-left text-base font-bold transition-all ${
                      isActive
                        ? "border-orange bg-orange text-white shadow-[3px_3px_0px_#1c1917]"
                        : "border-ink bg-warm-white text-ink shadow-[3px_3px_0px_#1c1917] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Next / Finish button */}
            <button
              type="button"
              disabled={!selected}
              onClick={handleNext}
              className="w-full rounded-full border-[3px] border-ink bg-ink px-8 py-4 text-base font-bold text-white shadow-[4px_4px_0px_#e07a3a] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#e07a3a] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {isLastStep ? "Find my first lesson →" : "Next →"}
            </button>

            {/* Skip link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.replace("/dashboard" as Parameters<typeof router.replace>[0])}
                className="text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-ink"
              >
                Skip — take me to the dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
