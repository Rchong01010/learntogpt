'use client';

import { useState, useMemo, useCallback } from 'react';
import { Trophy, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface SpotTheDifferenceProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface Round {
  prompt: string;
  response_a: string;
  response_b: string;
  correct: 'a' | 'b';
  explanation: string;
  highlights_good: string[];
  highlights_bad: string[];
}

type Selection = 'a' | 'b' | null;

/**
 * Highlight known phrases in text using simple indexOf scanning.
 * Avoids dynamic RegExp construction (ReDoS-safe).
 */
function highlightText(text: string, phrases: string[], color: string): React.ReactNode {
  if (!phrases.length) return text;

  // Build a list of [start, end, phraseIndex] spans
  const lowerText = text.toLowerCase();
  const spans: Array<[number, number]> = [];
  for (const phrase of phrases) {
    const lowerPhrase = phrase.toLowerCase();
    let idx = 0;
    while (idx < lowerText.length) {
      const found = lowerText.indexOf(lowerPhrase, idx);
      if (found === -1) break;
      spans.push([found, found + phrase.length]);
      idx = found + phrase.length;
    }
  }
  if (!spans.length) return text;

  // Sort by start position, then merge overlapping
  spans.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [spans[0]];
  for (let i = 1; i < spans.length; i++) {
    const last = merged[merged.length - 1];
    if (spans[i][0] <= last[1]) {
      last[1] = Math.max(last[1], spans[i][1]);
    } else {
      merged.push(spans[i]);
    }
  }

  // Build React nodes
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < merged.length; i++) {
    const [start, end] = merged[i];
    if (cursor < start) {
      nodes.push(text.slice(cursor, start));
    }
    nodes.push(
      <span key={`hl-${i}`} style={{
        background: color,
        borderRadius: 4,
        padding: '1px 4px',
        fontWeight: 700,
      }}>
        {text.slice(start, end)}
      </span>
    );
    cursor = end;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

export function SpotTheDifference({ exercise, onComplete }: SpotTheDifferenceProps) {
  const rounds: Round[] = useMemo(() => {
    try {
      const parsed = JSON.parse(exercise.game_data ?? '{"rounds":[]}');
      return parsed.rounds ?? [];
    } catch { return []; }
  }, [exercise.game_data]);

  const [currentRound, setCurrentRound] = useState(0);
  const [selection, setSelection] = useState<Selection>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shaking, setShaking] = useState<'a' | 'b' | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const round = rounds[currentRound] ?? null;
  const isCorrect = selection === round?.correct;

  const handleSelect = useCallback((choice: 'a' | 'b') => {
    if (selection || !round) return;
    setSelection(choice);
    setShowResult(true);
    if (choice === round.correct) {
      setCorrectCount(c => c + 1);
    } else {
      setShaking(choice);
      setTimeout(() => setShaking(null), 500);
    }
  }, [selection, round]);

  const handleNext = useCallback(() => {
    const nextRound = currentRound + 1;
    if (nextRound >= rounds.length) {
      setFinished(true);
      const finalCount = correctCount; // already updated in handleSelect
      onComplete({
        correct: finalCount >= Math.ceil(rounds.length * 0.5),
        explanation: exercise.explanation,
        xp_earned: finalCount === rounds.length
          ? exercise.xp_reward
          : Math.round(exercise.xp_reward * (finalCount / rounds.length)),
      });
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setCurrentRound(nextRound);
      setSelection(null);
      setShowResult(false);
      setShaking(null);
      setTransitioning(false);
    }, 300);
  }, [currentRound, rounds.length, correctCount, isCorrect, exercise, onComplete]);

  // Finished screen
  if (finished) {
    const pct = rounds.length > 0 ? Math.round((correctCount / rounds.length) * 100) : 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', animation: 'stdBounceIn 0.4s ease' }}>
          <Trophy style={{ width: 48, height: 48, color: '#d4a373', animation: 'stdFloat 1s ease infinite alternate' }} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>Comparison Complete!</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%', maxWidth: 260, textAlign: 'center' }}>
            {[
              { value: correctCount, label: 'Correct', color: '#2d7d6f' },
              { value: `${pct}%`, label: 'Accuracy', color: '#e07a3a' },
            ].map(({ value, label, color }) => (
              <div key={label} style={{
                borderRadius: 14, border: '3px solid #1c1917', background: '#fff9f0', padding: 14,
                boxShadow: '3px 3px 0px #1c1917',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'stdFadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {exercise.explanation}
        </div>
        <style>{`
          @keyframes stdBounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
          @keyframes stdFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
          @keyframes stdFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  if (!round) return null;

  const cardBaseStyle = (side: 'a' | 'b'): React.CSSProperties => {
    const accent = side === 'a' ? '#e07a3a' : '#2d7d6f';
    const isSelected = selection === side;
    const isCorrectChoice = side === round.correct;
    const isShaking = shaking === side;

    let borderColor = accent;
    let boxShadow = `4px 4px 0px #1c1917`;
    let transform = 'translateY(0)';

    if (showResult && isSelected && isCorrectChoice) {
      borderColor = '#2d7d6f';
      boxShadow = `0 0 0 3px #2d7d6f, 4px 4px 0px #1c1917`;
    } else if (showResult && isSelected && !isCorrectChoice) {
      borderColor = '#c94040';
      boxShadow = `4px 4px 0px #1c1917`;
    } else if (showResult && !isSelected && isCorrectChoice) {
      borderColor = '#2d7d6f';
      boxShadow = `0 0 0 2px #2d7d6f, 4px 4px 0px #1c1917`;
    }

    return {
      flex: 1,
      minWidth: 0,
      borderRadius: 16,
      border: `3px solid ${borderColor}`,
      background: showResult && isCorrectChoice ? 'rgba(45,125,111,0.06)' : '#fff9f0',
      padding: 20,
      cursor: selection ? 'default' : 'pointer',
      boxShadow,
      transition: 'all 0.25s ease',
      transform,
      animation: isShaking ? 'stdShake 0.4s ease' : undefined,
    };
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      opacity: transitioning ? 0 : 1,
      transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    }}>
      {/* Round indicator dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {rounds.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            border: '2px solid #1c1917',
            background: i < currentRound ? '#2d7d6f' : i === currentRound ? '#e07a3a' : '#f0ebe3',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {/* Prompt */}
      <div style={{
        borderRadius: 14, border: '3px solid #1c1917', background: '#f0ebe3',
        padding: 16, textAlign: 'center',
        boxShadow: '3px 3px 0px #1c1917',
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Prompt
        </p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1c1917', lineHeight: 1.5 }}>
          {round.prompt}
        </p>
      </div>

      {/* Response cards — side by side on wide, stacked on narrow */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['a', 'b'] as const).map(side => {
          const text = side === 'a' ? round.response_a : round.response_b;
          const label = side === 'a' ? 'Response A' : 'Response B';
          const accent = side === 'a' ? '#e07a3a' : '#2d7d6f';
          const isCorrectChoice = side === round.correct;

          let renderedText: React.ReactNode = text;
          if (showResult) {
            if (isCorrectChoice) {
              renderedText = highlightText(text, round.highlights_good, 'rgba(45,125,111,0.2)');
            } else {
              renderedText = highlightText(text, round.highlights_bad, 'rgba(201,64,64,0.2)');
            }
          }

          return (
            <div
              key={side}
              role="button"
              tabIndex={selection ? -1 : 0}
              onClick={() => handleSelect(side)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(side); } }}
              style={cardBaseStyle(side)}
              onMouseEnter={e => {
                if (!selection) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px #1c1917';
                }
              }}
              onMouseLeave={e => {
                if (!selection) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px #1c1917';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 12px', borderRadius: 20, border: '2px solid #1c1917',
                  background: accent, color: '#fff', fontWeight: 700, fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {label}
                </span>
                {showResult && isCorrectChoice && (
                  <CheckCircle style={{ width: 20, height: 20, color: '#2d7d6f', animation: 'stdPop 0.3s ease' }} />
                )}
                {showResult && selection === side && !isCorrectChoice && (
                  <XCircle style={{ width: 20, height: 20, color: '#c94040' }} />
                )}
              </div>
              <p style={{ fontSize: 15, color: '#1c1917', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {renderedText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Celebration particles for correct answer */}
      {showResult && isCorrect && (
        <div style={{ position: 'relative', height: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: -20,
              left: `${12 + i * 10}%`,
              width: 8, height: 8,
              borderRadius: '50%',
              background: ['#e07a3a', '#2d7d6f', '#d4a373', '#c94040'][i % 4],
              animation: `stdConfetti 0.8s ease forwards`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0,
            }} />
          ))}
        </div>
      )}

      {/* Explanation after selection */}
      {showResult && (
        <div style={{
          borderRadius: 14, border: '2px solid #1c1917',
          background: isCorrect ? 'rgba(45,125,111,0.08)' : 'rgba(201,64,64,0.08)',
          padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6,
          animation: 'stdFadeIn 0.3s ease',
        }}>
          <p style={{ fontWeight: 700, marginBottom: 4, color: isCorrect ? '#2d7d6f' : '#c94040' }}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          {round.explanation}
        </div>
      )}

      {/* Next / finish button */}
      {showResult && (
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'stdFadeIn 0.3s ease' }}>
          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 36px', borderRadius: 16, border: '3px solid #1c1917',
              background: '#e07a3a', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '4px 4px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}
          >
            {currentRound + 1 >= rounds.length ? (
              <>
                <Trophy style={{ width: 18, height: 18 }} />
                Finish
              </>
            ) : (
              <>
                Next Round
                <ArrowRight style={{ width: 18, height: 18 }} />
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes stdShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes stdFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stdPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes stdBounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
        @keyframes stdFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
        @keyframes stdConfetti {
          0% { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-40px) scale(0.5); }
        }
        @media (max-width: 640px) {
          div[style*="flexWrap: wrap"] > div[role="button"] {
            flex-basis: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
