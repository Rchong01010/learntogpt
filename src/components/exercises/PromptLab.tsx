'use client';

import { useState, useMemo } from 'react';
import { Check, X, Lightbulb, Send, Sparkles } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface PromptLabProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface ScoringCriterion {
  keyword_group: string[];
  label: string;
  points: number;
}

interface PromptLabData {
  scenario: string;
  scoring_criteria: ScoringCriterion[];
  max_points: number;
  pass_threshold: number;
  ideal_prompt: string;
  tips: string[];
}

interface CriterionResult {
  label: string;
  matched: boolean;
  points: number;
}

export function PromptLab({ exercise, onComplete }: PromptLabProps) {
  const data: PromptLabData = useMemo(() => {
    try { return JSON.parse(exercise.game_data ?? '{}'); }
    catch { return { scenario: '', scoring_criteria: [], max_points: 0, pass_threshold: 0, ideal_prompt: '', tips: [] }; }
  }, [exercise.game_data]);

  const [userPrompt, setUserPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<CriterionResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [passed, setPassed] = useState(false);

  function handleSubmit() {
    const lower = userPrompt.toLowerCase();

    const criteriaResults: CriterionResult[] = data.scoring_criteria.map((criterion) => {
      const matched = criterion.keyword_group.some((kw) => lower.includes(kw.toLowerCase()));
      return { label: criterion.label, matched, points: criterion.points };
    });

    const score = criteriaResults.reduce((sum, r) => sum + (r.matched ? r.points : 0), 0);
    const didPass = score >= data.pass_threshold;

    setResults(criteriaResults);
    setTotalScore(score);
    setPassed(didPass);
    setSubmitted(true);

    onComplete({
      correct: didPass,
      explanation: exercise.explanation,
      xp_earned: didPass ? exercise.xp_reward : 0,
    });
  }

  const canSubmit = userPrompt.trim().length >= 10;
  const missedCriteria = results.filter((r) => !r.matched);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Scenario */}
      <div
        style={{
          borderRadius: 18,
          border: '2px solid #1c1917',
          background: 'rgba(240, 235, 227, 0.5)',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #e07a3a, #d4a373)',
        }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <Sparkles style={{ width: 18, height: 18, color: '#e07a3a' }} />
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#e07a3a',
          }}>
            Scenario
          </span>
        </div>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.7, fontWeight: 500 }}>
          {data.scenario}
        </p>
      </div>

      {/* Prompt Input */}
      {!submitted && (
        <>
          <div
            style={{
              borderRadius: 14,
              border: '3px solid #1c1917',
              overflow: 'hidden',
              boxShadow: '4px 4px 0px #1c1917',
              background: '#fff',
            }}
          >
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderBottom: '2px solid #1c1917', background: '#f0ebe3',
            }}>
              <Send style={{ width: 14, height: 14, color: '#e07a3a' }} />
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: '#1c1917',
              }}>
                Your Prompt to ChatGPT
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, color: '#999',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {userPrompt.length} chars
              </span>
            </div>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={8}
              placeholder="Type your prompt to ChatGPT..."
              spellCheck={false}
              style={{
                width: '100%',
                padding: 16,
                fontFamily: 'monospace',
                fontSize: 14,
                background: '#fff',
                color: '#1c1917',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.7,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
              background: canSubmit ? '#e07a3a' : '#e5e0d8',
              color: canSubmit ? '#fff' : '#999',
              fontWeight: 700, fontSize: 15,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '3px 3px 0px #1c1917' : 'none',
              transition: 'all 0.15s ease',
              alignSelf: 'flex-start',
            }}
          >
            <Send style={{ width: 18, height: 18 }} />
            Submit Prompt
          </button>
        </>
      )}

      {/* Results */}
      {submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'promptLabFadeIn 0.4s ease' }}>
          {/* Score Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: 14, border: '3px solid #1c1917',
            background: passed ? '#2d7d6f' : '#c94040',
            color: '#fff', padding: '14px 20px',
            boxShadow: '3px 3px 0px #1c1917',
            animation: passed ? 'promptLabBounce 0.4s ease' : 'promptLabShake 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {passed ? (
                <Check style={{ width: 22, height: 22 }} />
              ) : (
                <X style={{ width: 22, height: 22 }} />
              )}
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {passed ? 'Great prompt!' : 'Keep practicing'}
              </span>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
            }}>
              {totalScore}/{data.max_points} pts
            </span>
          </div>

          {/* Criteria Checklist */}
          <div style={{
            borderRadius: 14, border: '2px solid #1c1917',
            background: '#fff9f0', overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: '2px solid #1c1917',
              background: '#f0ebe3',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#1c1917',
              }}>
                Scoring Breakdown
              </span>
            </div>
            <div style={{ padding: 4 }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: r.matched ? 'rgba(45, 125, 111, 0.08)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: r.matched ? '#2d7d6f' : '#c94040',
                    flexShrink: 0,
                  }}>
                    {r.matched ? (
                      <Check style={{ width: 14, height: 14, color: '#fff' }} />
                    ) : (
                      <X style={{ width: 14, height: 14, color: '#fff' }} />
                    )}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 500,
                    color: r.matched ? '#1c1917' : '#666',
                  }}>
                    {r.label}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: r.matched ? '#2d7d6f' : '#999',
                  }}>
                    {r.matched ? `+${r.points}` : `0/${r.points}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for missed criteria */}
          {missedCriteria.length > 0 && data.tips.length > 0 && (
            <div style={{
              borderRadius: 14, border: '2px solid #d4a373',
              background: 'rgba(212, 163, 115, 0.1)', padding: 16,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              }}>
                <Lightbulb style={{ width: 18, height: 18, color: '#d4a373' }} />
                <span style={{
                  fontSize: 13, fontWeight: 700, color: '#1c1917',
                }}>
                  Tips for next time
                </span>
              </div>
              <ul style={{
                margin: 0, paddingLeft: 20,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {data.tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#1c1917', lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Your prompt vs ideal */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* User's prompt */}
            <div style={{
              borderRadius: 14, border: '2px solid #1c1917',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 14px', borderBottom: '2px solid #1c1917',
                background: '#f0ebe3',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: '#999',
                }}>
                  Your Prompt
                </span>
              </div>
              <div style={{
                padding: 14, fontSize: 13, fontFamily: 'monospace',
                color: '#1c1917', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: '#fff9f0',
              }}>
                {userPrompt}
              </div>
            </div>

            {/* Ideal prompt */}
            <div style={{
              borderRadius: 14, border: '2px solid #2d7d6f',
              overflow: 'hidden',
              boxShadow: '3px 3px 0px rgba(45, 125, 111, 0.2)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderBottom: '2px solid #2d7d6f',
                background: 'rgba(45, 125, 111, 0.08)',
              }}>
                <Sparkles style={{ width: 14, height: 14, color: '#2d7d6f' }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: '#2d7d6f',
                }}>
                  Ideal Prompt
                </span>
              </div>
              <div style={{
                padding: 14, fontSize: 13, fontFamily: 'monospace',
                color: '#1c1917', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: 'rgba(45, 125, 111, 0.03)',
              }}>
                {data.ideal_prompt}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {exercise.explanation && (
            <div style={{
              borderRadius: 14, border: '2px solid #1c1917',
              background: '#f0ebe3', padding: 16,
              fontSize: 14, color: '#1c1917', lineHeight: 1.6,
            }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
              {exercise.explanation}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes promptLabFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes promptLabBounce { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes promptLabShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
}
