'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Timer, Zap, Check, X, Trophy } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface SpeedPromptProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface ScoringCriterion {
  keyword_group: string[];
  label: string;
  points: number;
}

interface SpeedPromptData {
  time_limit_seconds: number;
  scenario: string;
  scoring_criteria: ScoringCriterion[];
  max_points: number;
  pass_threshold: number;
  ideal_prompt: string;
}

export function SpeedPrompt({ exercise, onComplete }: SpeedPromptProps) {
  const gameData: SpeedPromptData = useMemo(() => {
    try {
      return JSON.parse(exercise.game_data ?? '{}');
    } catch {
      return {
        time_limit_seconds: 45,
        scenario: exercise.prompt,
        scoring_criteria: [],
        max_points: 0,
        pass_threshold: 0,
        ideal_prompt: '',
      };
    }
  }, [exercise.game_data, exercise.prompt]);

  const timeLimit = gameData.time_limit_seconds || 45;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [prompt, setPrompt] = useState('');
  const [finished, setFinished] = useState(false);
  const [criteriaResults, setCriteriaResults] = useState<boolean[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finishedRef = useRef(false);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  // Score the prompt against criteria
  const scorePrompt = useCallback((text: string) => {
    const lower = text.toLowerCase();
    const results = gameData.scoring_criteria.map((criterion) =>
      criterion.keyword_group.some((kw) => lower.includes(kw.toLowerCase())),
    );
    const score = gameData.scoring_criteria.reduce(
      (sum, criterion, i) => sum + (results[i] ? criterion.points : 0),
      0,
    );
    return { results, score };
  }, [gameData.scoring_criteria]);

  // Finish the game
  const finishGame = useCallback((text: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = timeLimit - timeLeft;
    setTimeTaken(elapsed);

    const { results, score } = scorePrompt(text);
    setCriteriaResults(results);
    setTotalScore(score);
    setFinished(true);

    const passed = score >= gameData.pass_threshold;
    const xpEarned = passed
      ? exercise.xp_reward
      : gameData.max_points > 0
        ? Math.round(exercise.xp_reward * (score / gameData.max_points))
        : 0;

    onComplete({
      correct: passed,
      explanation: exercise.explanation,
      xp_earned: xpEarned,
    });
  }, [timeLimit, timeLeft, scorePrompt, gameData.pass_threshold, gameData.max_points, exercise, onComplete]);

  // Timer countdown — uses refs to avoid re-registering on every keystroke
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up -- auto-submit with current prompt from ref
          finishGame(promptRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished]);

  // Auto-focus textarea when started
  useEffect(() => {
    if (started && !finished && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [started, finished]);

  function handleStart() {
    setStarted(true);
  }

  function handleSubmit() {
    if (finished || prompt.trim() === '') return;
    finishGame(prompt);
  }

  // Timer color logic
  const timePct = timeLeft / timeLimit;
  const timerColor = timePct > 0.5 ? '#2d7d6f' : timePct > 0.25 ? '#e07a3a' : '#c94040';
  const isUrgent = timePct <= 0.25;

  const criteriaHit = criteriaResults.filter(Boolean).length;
  const criteriaTotal = gameData.scoring_criteria.length;

  // ---- PRE-START SCREEN ----
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>
          {exercise.prompt}
        </p>

        {/* Scenario card */}
        <div style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: '#a8a29e', marginBottom: 10,
          }}>
            Scenario
          </div>
          <p style={{ fontSize: 15, color: '#1c1917', lineHeight: 1.7, fontWeight: 500 }}>
            {gameData.scenario}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c1917' }}>
            <Timer style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              {timeLimit}s to write a prompt that hits {criteriaTotal} criteria
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 340 }}>
            Type fast, think faster. Score points by hitting key concepts before the clock runs out!
          </p>
          <button
            type="button"
            onClick={handleStart}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 44px', borderRadius: 16, border: '3px solid #1c1917',
              background: '#e07a3a', color: '#fff', fontWeight: 700, fontSize: 18,
              cursor: 'pointer', boxShadow: '4px 4px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap style={{ width: 20, height: 20 }} />
            Ready? Start!
          </button>
        </div>
      </div>
    );
  }

  // ---- FINISHED SCREEN ----
  if (finished) {
    const passed = totalScore >= gameData.pass_threshold;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>
          {exercise.prompt}
        </p>

        {/* Result header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          padding: '24px 0', animation: 'spBounceIn 0.4s ease',
        }}>
          <Trophy style={{
            width: 48, height: 48,
            color: passed ? '#d4a373' : '#a8a29e',
            animation: 'spFloat 1s ease infinite alternate',
          }} />
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1c1917' }}>
            You hit {criteriaHit}/{criteriaTotal} criteria in {timeTaken}s!
          </p>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            width: '100%', maxWidth: 360, textAlign: 'center',
          }}>
            {[
              { value: `${totalScore}/${gameData.max_points}`, label: 'Points', color: '#2d7d6f' },
              { value: `${timeTaken}s`, label: 'Time', color: '#e07a3a' },
              { value: `${criteriaHit}/${criteriaTotal}`, label: 'Criteria', color: '#d4a373' },
            ].map(({ value, label, color }) => (
              <div key={label} style={{
                borderRadius: 14, border: '3px solid #1c1917', background: '#fff9f0',
                padding: 14, boxShadow: '3px 3px 0px #1c1917',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#999',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Criteria checklist */}
        <div style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
          animation: 'spFadeIn 0.3s ease',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: '#a8a29e', marginBottom: 12,
          }}>
            Criteria Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gameData.scoring_criteria.map((criterion, i) => {
              const hit = criteriaResults[i];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10, padding: '10px 14px',
                  background: hit ? 'rgba(45,125,111,0.08)' : 'rgba(201,64,64,0.06)',
                  border: `2px solid ${hit ? '#2d7d6f' : '#c94040'}`,
                }}>
                  {hit ? (
                    <Check style={{ width: 18, height: 18, color: '#2d7d6f', flexShrink: 0 }} />
                  ) : (
                    <X style={{ width: 18, height: 18, color: '#c94040', flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1c1917' }}>
                    {criterion.label}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: hit ? '#2d7d6f' : '#a8a29e',
                  }}>
                    {hit ? `+${criterion.points}` : '0'} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your prompt */}
        <div style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
          animation: 'spFadeIn 0.3s ease 0.1s both',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: '#a8a29e', marginBottom: 10,
          }}>
            Your Prompt
          </div>
          <div style={{
            borderRadius: 12, background: '#f0ebe3', border: '2px solid #d4cfc7',
            padding: 16, fontSize: 14, lineHeight: 1.7, color: '#1c1917',
            fontWeight: 500, fontStyle: 'italic', whiteSpace: 'pre-wrap',
          }}>
            {prompt || '(no prompt submitted)'}
          </div>
        </div>

        {/* Ideal prompt */}
        {gameData.ideal_prompt && (
          <div style={{
            borderRadius: 16, border: '3px solid #2d7d6f', padding: 20,
            background: 'rgba(45,125,111,0.06)',
            animation: 'spFadeIn 0.3s ease 0.2s both',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: '#2d7d6f', marginBottom: 10,
            }}>
              Ideal Prompt
            </div>
            <div style={{
              borderRadius: 12, background: 'rgba(45,125,111,0.08)', border: '2px solid #2d7d6f',
              padding: 16, fontSize: 14, lineHeight: 1.7, color: '#1c1917',
              fontWeight: 500, whiteSpace: 'pre-wrap',
            }}>
              {gameData.ideal_prompt}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div style={{
          borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3',
          padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6,
          animation: 'spFadeIn 0.3s ease 0.3s both',
        }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {exercise.explanation}
        </div>

        <style>{`
          @keyframes spBounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
          @keyframes spFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
          @keyframes spFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // ---- ACTIVE GAME SCREEN ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Timer + scenario header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>
            {gameData.scenario}
          </p>
        </div>

        {/* Big timer */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '10px 16px', borderRadius: 16, border: '3px solid #1c1917',
          background: isUrgent ? '#c94040' : '#fff9f0',
          boxShadow: '3px 3px 0px #1c1917', flexShrink: 0,
          animation: isUrgent ? 'spPulse 0.6s ease infinite' : undefined,
          transition: 'background 0.3s ease',
        }}>
          <Timer style={{
            width: 18, height: 18,
            color: isUrgent ? '#fff' : timerColor,
          }} />
          <span style={{
            fontFamily: 'monospace', fontSize: 32, fontWeight: 800,
            lineHeight: 1, color: isUrgent ? '#fff' : timerColor,
          }}>
            {timeLeft}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: isUrgent ? 'rgba(255,255,255,0.7)' : '#a8a29e',
          }}>
            sec
          </span>
        </div>
      </div>

      {/* Timer progress bar */}
      <div style={{
        height: 8, borderRadius: 20, background: '#f0ebe3',
        border: '2px solid #1c1917', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 20,
          transition: 'width 1s linear, background 0.3s ease',
          background: timerColor,
          width: `${timePct * 100}%`,
        }} />
      </div>

      {/* Textarea */}
      <div style={{
        borderRadius: 16, border: '3px solid #1c1917', overflow: 'hidden',
        boxShadow: '4px 4px 0px #1c1917',
      }}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Type your prompt here... go go go!"
          spellCheck={false}
          style={{
            width: '100%', padding: 16, fontSize: 15,
            fontFamily: 'inherit', background: '#fff', color: '#1c1917',
            border: 'none', outline: 'none', resize: 'vertical',
            lineHeight: 1.7,
          }}
        />
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={prompt.trim() === ''}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 28px', borderRadius: 14, border: '3px solid #1c1917',
          background: prompt.trim() === '' ? '#e5e0d8' : '#2d7d6f',
          color: prompt.trim() === '' ? '#999' : '#fff',
          fontWeight: 700, fontSize: 16,
          cursor: prompt.trim() === '' ? 'not-allowed' : 'pointer',
          boxShadow: prompt.trim() === '' ? 'none' : '3px 3px 0px #1c1917',
          transition: 'all 0.15s ease', alignSelf: 'flex-start',
        }}
      >
        <Zap style={{ width: 18, height: 18 }} />
        Submit ({timeLeft}s left)
      </button>

      <style>{`
        @keyframes spPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
