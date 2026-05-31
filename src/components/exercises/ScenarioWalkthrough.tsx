'use client';

import { useState, useMemo, useCallback } from 'react';
import { MessageCircle, ChevronRight, Check, X, Trophy, Sparkles } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface ScenarioWalkthroughProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface ScoringCriterion {
  keyword_group: string[];
  label: string;
  points: number;
}

type WalkthroughStep =
  | { type: 'context'; text: string }
  | {
      type: 'choice';
      claude_response: string;
      question: string;
      options: string[];
      correct: number;
      feedback: string;
    }
  | {
      type: 'prompt';
      context: string;
      placeholder?: string;
      scoring_criteria: ScoringCriterion[];
      ideal: string;
      max_points: number;
      pass_threshold: number;
    };

interface WalkthroughData {
  title: string;
  steps: WalkthroughStep[];
}

interface StepScore {
  type: 'choice' | 'prompt';
  earned: number;
  max: number;
  passed: boolean;
}

export function ScenarioWalkthrough({ exercise, onComplete }: ScenarioWalkthroughProps) {
  const gameData: WalkthroughData = useMemo(() => {
    try {
      return JSON.parse(exercise.game_data ?? '{}');
    } catch {
      return { title: '', steps: [] };
    }
  }, [exercise.game_data]);

  const steps = gameData.steps ?? [];
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Choice state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [choiceSubmitted, setChoiceSubmitted] = useState(false);

  // Prompt state
  const [promptText, setPromptText] = useState('');
  const [promptSubmitted, setPromptSubmitted] = useState(false);
  const [criteriaResults, setCriteriaResults] = useState<boolean[]>([]);
  const [promptScore, setPromptScore] = useState(0);

  // Running scores
  const [scores, setScores] = useState<StepScore[]>([]);
  const [finished, setFinished] = useState(false);

  const step = currentStep < totalSteps ? steps[currentStep] : null;

  // Count scored steps for the final summary
  const scoredSteps = useMemo(
    () => steps.filter((s) => s.type === 'choice' || s.type === 'prompt'),
    [steps],
  );

  const advanceStep = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      const nextIdx = currentStep + 1;
      if (nextIdx >= totalSteps) {
        // Done
        setFinished(true);

        const totalEarned = scores.reduce((s, sc) => s + sc.earned, 0);
        const totalMax = scores.reduce((s, sc) => s + sc.max, 0);
        const passedCount = scores.filter((sc) => sc.passed).length;
        const allPassed = passedCount === scores.length && scores.length > 0;
        const ratio = totalMax > 0 ? totalEarned / totalMax : 1;

        onComplete({
          correct: allPassed || ratio >= 0.6,
          explanation: `You scored ${totalEarned} out of ${totalMax} points across ${scores.length} challenges.`,
          xp_earned: Math.round(exercise.xp_reward * ratio),
        });
      } else {
        setCurrentStep(nextIdx);
        setSelectedOption(null);
        setChoiceSubmitted(false);
        setPromptText('');
        setPromptSubmitted(false);
        setCriteriaResults([]);
        setPromptScore(0);
      }
      setTransitioning(false);
    }, 300);
  }, [currentStep, totalSteps, scores, exercise.xp_reward, onComplete]);

  // --- Choice handlers ---
  function handleChoiceSelect(idx: number) {
    if (choiceSubmitted) return;
    setSelectedOption(idx);
  }

  function handleChoiceSubmit() {
    if (selectedOption === null || !step || step.type !== 'choice') return;
    setChoiceSubmitted(true);

    const isCorrect = selectedOption === step.correct;
    setScores((prev) => [
      ...prev,
      { type: 'choice', earned: isCorrect ? 1 : 0, max: 1, passed: isCorrect },
    ]);
  }

  // --- Prompt handlers ---
  function handlePromptSubmit() {
    if (!step || step.type !== 'prompt' || !promptText.trim()) return;
    setPromptSubmitted(true);

    const lower = promptText.toLowerCase();
    let earned = 0;
    const results = step.scoring_criteria.map((criterion) => {
      const hit = criterion.keyword_group.some((kw) => lower.includes(kw.toLowerCase()));
      if (hit) earned += criterion.points;
      return hit;
    });

    setCriteriaResults(results);
    setPromptScore(earned);

    setScores((prev) => [
      ...prev,
      {
        type: 'prompt',
        earned,
        max: step.max_points,
        passed: earned >= step.pass_threshold,
      },
    ]);
  }

  // --- Render helpers ---
  function renderProgressDots() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid #1c1917',
              background:
                i < currentStep
                  ? '#2d7d6f'
                  : i === currentStep && !finished
                    ? '#e07a3a'
                    : finished && i <= currentStep
                      ? '#2d7d6f'
                      : '#e5e0d8',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
        <span style={{ fontSize: 11, fontWeight: 700, color: '#78716c', marginLeft: 4 }}>
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </span>
      </div>
    );
  }

  function renderContextStep(s: { type: 'context'; text: string }) {
    return (
      <div style={{ animation: 'swFadeIn 0.3s ease' }}>
        <div
          style={{
            borderRadius: 16,
            border: '2px solid #1c1917',
            background: '#f0ebe3',
            padding: '20px 24px',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#1c1917',
            fontWeight: 500,
          }}
        >
          {s.text}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="button"
            onClick={advanceStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 14,
              border: '3px solid #1c1917',
              background: '#e07a3a',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}
          >
            Continue
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  function renderChoiceStep(s: {
    type: 'choice';
    claude_response: string;
    question: string;
    options: string[];
    correct: number;
    feedback: string;
  }) {
    const isCorrect = choiceSubmitted && selectedOption === s.correct;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'swFadeIn 0.3s ease' }}>
        {/* ChatGPT response bubble */}
        <div style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#78716c',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Sparkles style={{ width: 12, height: 12 }} />
            ChatGPT
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #f0ebe3 0%, #e8e2d8 100%)',
              color: '#1c1917',
              padding: '14px 18px',
              borderRadius: '16px 16px 16px 4px',
              fontSize: 14,
              lineHeight: 1.7,
              fontWeight: 500,
              fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
              border: '2px solid #1c1917',
              boxShadow: '2px 2px 0px #1c1917',
              whiteSpace: 'pre-wrap',
            }}
          >
            {s.claude_response}
          </div>
        </div>

        {/* Question */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#1c1917',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MessageCircle style={{ width: 16, height: 16, color: '#e07a3a', flexShrink: 0 }} />
          {s.question}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {s.options.map((opt, i) => {
            let borderColor = '#1c1917';
            let bg = '#fff9f0';
            let shadow = '3px 3px 0px #1c1917';
            let icon = null;

            if (choiceSubmitted) {
              if (i === s.correct) {
                borderColor = '#2d7d6f';
                bg = 'rgba(45,125,111,0.1)';
                shadow = '3px 3px 0px #2d7d6f';
                icon = <Check style={{ width: 16, height: 16, color: '#2d7d6f', flexShrink: 0 }} />;
              } else if (i === selectedOption && i !== s.correct) {
                borderColor = '#c94040';
                bg = '#fef2f2';
                shadow = '3px 3px 0px #c94040';
                icon = <X style={{ width: 16, height: 16, color: '#c94040', flexShrink: 0 }} />;
              } else {
                bg = '#f0ebe3';
                shadow = 'none';
              }
            } else if (i === selectedOption) {
              borderColor = '#e07a3a';
              shadow = '4px 4px 0px #e07a3a';
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleChoiceSelect(i)}
                disabled={choiceSubmitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: `3px solid ${borderColor}`,
                  background: bg,
                  color: '#1c1917',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  cursor: choiceSubmitted ? 'default' : 'pointer',
                  boxShadow: shadow,
                  transition: 'all 0.15s ease',
                  opacity: choiceSubmitted && i !== selectedOption && i !== s.correct ? 0.5 : 1,
                }}
              >
                <span style={{ flex: 1 }}>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Submit / Feedback / Continue */}
        {!choiceSubmitted && selectedOption !== null && (
          <button
            type="button"
            onClick={handleChoiceSubmit}
            style={{
              alignSelf: 'flex-end',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 14,
              border: '3px solid #1c1917',
              background: '#e07a3a',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #1c1917',
              animation: 'swFadeIn 0.2s ease',
            }}
          >
            Lock In
          </button>
        )}

        {choiceSubmitted && (
          <div style={{ animation: 'swFadeIn 0.3s ease' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                borderRadius: 12,
                background: isCorrect ? 'rgba(45,125,111,0.1)' : 'rgba(224,122,58,0.1)',
                border: `2px solid ${isCorrect ? '#2d7d6f' : '#e07a3a'}`,
                padding: '12px 14px',
                fontSize: 13,
                color: '#1c1917',
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              {isCorrect ? (
                <Check style={{ width: 16, height: 16, color: '#2d7d6f', flexShrink: 0, marginTop: 2 }} />
              ) : (
                <MessageCircle style={{ width: 16, height: 16, color: '#e07a3a', flexShrink: 0, marginTop: 2 }} />
              )}
              <span>{s.feedback}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={advanceStep}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 14,
                  border: '3px solid #1c1917',
                  background: '#2d7d6f',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #1c1917',
                }}
              >
                Continue
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderPromptStep(s: {
    type: 'prompt';
    context: string;
    placeholder?: string;
    scoring_criteria: ScoringCriterion[];
    ideal: string;
    max_points: number;
    pass_threshold: number;
  }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'swFadeIn 0.3s ease' }}>
        {/* Context */}
        <div
          style={{
            borderRadius: 14,
            border: '2px solid #1c1917',
            background: '#f0ebe3',
            padding: '14px 18px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#1c1917',
            fontWeight: 500,
          }}
        >
          {s.context}
        </div>

        {/* Textarea */}
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          disabled={promptSubmitted}
          placeholder={s.placeholder ?? 'Type your prompt here...'}
          rows={5}
          style={{
            width: '100%',
            borderRadius: 14,
            border: '3px solid #1c1917',
            background: promptSubmitted ? '#f0ebe3' : '#fff9f0',
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#1c1917',
            fontWeight: 500,
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
            resize: 'vertical',
            boxShadow: '3px 3px 0px #1c1917',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Submit button */}
        {!promptSubmitted && (
          <button
            type="button"
            onClick={handlePromptSubmit}
            disabled={!promptText.trim()}
            style={{
              alignSelf: 'flex-end',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 14,
              border: '3px solid #1c1917',
              background: promptText.trim() ? '#e07a3a' : '#e5e0d8',
              color: promptText.trim() ? '#fff' : '#a8a29e',
              fontWeight: 700,
              fontSize: 14,
              cursor: promptText.trim() ? 'pointer' : 'not-allowed',
              boxShadow: promptText.trim() ? '3px 3px 0px #1c1917' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Submit
          </button>
        )}

        {/* Results */}
        {promptSubmitted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'swFadeIn 0.3s ease' }}>
            {/* Score bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 700,
                color: promptScore >= s.pass_threshold ? '#2d7d6f' : '#e07a3a',
              }}
            >
              {promptScore >= s.pass_threshold ? (
                <Check style={{ width: 18, height: 18 }} />
              ) : (
                <X style={{ width: 18, height: 18 }} />
              )}
              {promptScore}/{s.max_points} points
              {promptScore >= s.pass_threshold ? ' — Nice work!' : ' — Keep practicing!'}
            </div>

            {/* Criteria checklist */}
            <div
              style={{
                borderRadius: 12,
                border: '2px solid #1c1917',
                background: '#fff9f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#78716c',
                  padding: '10px 14px',
                  borderBottom: '2px solid #1c1917',
                  background: '#f0ebe3',
                }}
              >
                Scoring Criteria
              </div>
              {s.scoring_criteria.map((criterion, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: i < s.scoring_criteria.length - 1 ? '1px solid #e5e0d8' : 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1c1917',
                  }}
                >
                  {criteriaResults[i] ? (
                    <Check style={{ width: 16, height: 16, color: '#2d7d6f', flexShrink: 0 }} />
                  ) : (
                    <X style={{ width: 16, height: 16, color: '#c94040', flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1 }}>{criterion.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: criteriaResults[i] ? '#2d7d6f' : '#a8a29e',
                    }}
                  >
                    {criteriaResults[i] ? `+${criterion.points}` : '0'}/{criterion.points}
                  </span>
                </div>
              ))}
            </div>

            {/* Ideal prompt */}
            <div
              style={{
                borderRadius: 14,
                border: '2px solid #2d7d6f',
                background: 'rgba(45,125,111,0.06)',
                padding: '14px 18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#2d7d6f',
                  marginBottom: 8,
                }}
              >
                <Sparkles style={{ width: 12, height: 12 }} />
                Ideal Prompt
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: '#1c1917',
                  fontWeight: 500,
                  fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {s.ideal}
              </div>
            </div>

            {/* Continue */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={advanceStep}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 14,
                  border: '3px solid #1c1917',
                  background: '#2d7d6f',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #1c1917',
                }}
              >
                Continue
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderComplete() {
    const totalEarned = scores.reduce((s, sc) => s + sc.earned, 0);
    const totalMax = scores.reduce((s, sc) => s + sc.max, 0);
    const passedCount = scores.filter((sc) => sc.passed).length;
    const perfect = passedCount === scores.length && scores.length > 0;

    return (
      <div style={{ animation: 'swBounceIn 0.4s ease' }}>
        <div
          style={{
            borderRadius: 16,
            border: '3px solid #1c1917',
            background: perfect ? '#2d7d6f' : '#f0ebe3',
            padding: '24px 20px',
            color: perfect ? '#fff' : '#1c1917',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <Trophy style={{ width: 28, height: 28 }} />
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              {perfect ? 'Perfect Walkthrough!' : 'Walkthrough Complete'}
            </span>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, marginBottom: 16 }}>
            You got {passedCount} out of {scoredSteps.length} steps right
            {totalMax > 0 && ` (${totalEarned}/${totalMax} points)`}.
            {perfect
              ? ' Every step was on point.'
              : ' Review the walkthrough to strengthen your approach.'}
          </p>

          {/* Score breakdown */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            {scores.map((sc, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: perfect ? 'rgba(255,255,255,0.15)' : sc.passed ? 'rgba(45,125,111,0.1)' : 'rgba(201,64,64,0.1)',
                  border: `2px solid ${sc.passed ? (perfect ? 'rgba(255,255,255,0.3)' : '#2d7d6f') : '#c94040'}`,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {sc.passed ? (
                  <Check style={{ width: 14, height: 14 }} />
                ) : (
                  <X style={{ width: 14, height: 14 }} />
                )}
                {sc.type === 'choice' ? 'Choice' : 'Prompt'} {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1c1917', lineHeight: 1.4 }}>
        {gameData.title}
      </div>

      {/* Progress */}
      {renderProgressDots()}

      {/* Step content with fade transition */}
      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        {finished && renderComplete()}

        {!finished && step?.type === 'context' && renderContextStep(step)}
        {!finished && step?.type === 'choice' && renderChoiceStep(step)}
        {!finished && step?.type === 'prompt' && renderPromptStep(step)}
      </div>

      <style>{`
        @keyframes swFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes swBounceIn {
          0% { transform: scale(0.95); opacity: 0; }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
