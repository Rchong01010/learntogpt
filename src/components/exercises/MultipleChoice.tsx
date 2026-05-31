'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface MultipleChoiceProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function MultipleChoice({ exercise, onComplete }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');

  const options = exercise.options ?? [];

  async function handleSubmit() {
    if (selected === null) return;
    setChecking(true);
    try {
      const result = await checkExercise(exercise.id, String(selected));
      const correct = result.correct;
      // correct_answer may be an index or text; if correct, the selected IS the correct index
      const parsedIndex = parseInt(result.correct_answer, 10);
      setCorrectIndex(!isNaN(parsedIndex) ? parsedIndex : (correct ? selected : null));
      setExplanation(result.explanation || exercise.explanation || '');
      setSubmitted(true);
      if (!correct) {
        setShakeIndex(selected);
        setTimeout(() => setShakeIndex(null), 500);
      }
      onComplete({
        correct,
        explanation: result.explanation,
        xp_earned: correct ? exercise.xp_reward : 0,
      });
    } catch (err) {
      console.error('Exercise check failed:', err);
      alert('Failed to check answer. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  function revealNextHint() {
    setHintsRevealed((h) => Math.min(h + 1, exercise.hints.length));
  }

  function getCardStyle(i: number): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: 16,
      border: '3px solid #1c1917',
      padding: '14px 16px',
      textAlign: 'left' as const,
      transition: 'all 0.15s ease',
      cursor: submitted ? 'default' : 'pointer',
      background: '#fff9f0',
      boxShadow: '3px 3px 0px #1c1917',
      minHeight: 52,
      width: '100%',
      fontSize: 14,
      color: '#1c1917',
      fontWeight: 500,
    };

    if (submitted && i === correctIndex) {
      return {
        ...base,
        background: '#2d7d6f',
        color: '#fff',
        borderColor: '#1c1917',
        animation: 'bounceIn 0.4s ease',
      };
    }
    if (submitted && i === selected && i !== correctIndex) {
      return {
        ...base,
        background: '#c94040',
        color: '#fff',
        borderColor: '#1c1917',
        animation: shakeIndex === i ? 'shakeCard 0.4s ease' : undefined,
      };
    }
    if (!submitted && i === selected) {
      return {
        ...base,
        borderColor: '#e07a3a',
        boxShadow: '5px 5px 0px #e07a3a',
        background: '#fff',
        transform: 'translate(-1px, -1px)',
      };
    }
    return base;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            disabled={submitted}
            onClick={() => setSelected(i)}
            style={getCardStyle(i)}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 10,
                background: submitted && i === correctIndex ? 'rgba(255,255,255,0.25)' : '#f0ebe3',
                fontSize: 13,
                fontWeight: 700,
                color: submitted && i === correctIndex ? '#fff' : '#1c1917',
                border: '2px solid',
                borderColor: submitted && i === correctIndex ? 'rgba(255,255,255,0.4)' : '#1c1917',
              }}
            >
              {LETTERS[i]}
            </span>
            <span style={{ flex: 1 }}>{option}</span>
            {submitted && i === correctIndex && (
              <CheckCircle style={{ width: 22, height: 22, flexShrink: 0, color: '#fff' }} />
            )}
            {submitted && i === selected && i !== correctIndex && (
              <XCircle style={{ width: 22, height: 22, flexShrink: 0, color: '#fff' }} />
            )}
          </button>
        ))}
      </div>

      {/* Hints */}
      {!submitted && exercise.hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hintsRevealed > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    borderRadius: 12,
                    background: '#d4a373',
                    border: '2px solid #1c1917',
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#1c1917',
                    fontWeight: 500,
                  }}
                >
                  <Lightbulb style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, color: '#1c1917' }} />
                  {hint}
                </div>
              ))}
            </div>
          )}
          {hintsRevealed < exercise.hints.length && (
            <button
              type="button"
              onClick={revealNextHint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#d4a373',
                fontWeight: 600,
                fontSize: 13,
                padding: '4px 0',
              }}
            >
              <Lightbulb style={{ width: 16, height: 16 }} />
              {hintsRevealed === 0 ? 'Show hint' : 'Next hint'}
            </button>
          )}
        </div>
      )}

      {/* Submit */}
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected === null || checking}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 28px',
            borderRadius: 14,
            border: '3px solid #1c1917',
            background: selected === null || checking ? '#e5e0d8' : '#e07a3a',
            color: selected === null || checking ? '#999' : '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: selected === null || checking ? 'not-allowed' : 'pointer',
            boxShadow: selected === null || checking ? 'none' : '3px 3px 0px #1c1917',
            transition: 'all 0.15s ease',
            alignSelf: 'flex-start',
          }}
        >
          {checking ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Checking...</> : 'Submit Answer'}
        </button>
      )}

      {/* Explanation */}
      {submitted && (
        <div
          style={{
            borderRadius: 14,
            border: '2px solid #1c1917',
            background: '#f0ebe3',
            padding: 16,
            fontSize: 14,
            color: '#1c1917',
            lineHeight: 1.6,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 4, color: '#1c1917' }}>Explanation</p>
          {explanation}
        </div>
      )}

      <style>{`
        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px) rotate(-1deg); }
          30% { transform: translateX(6px) rotate(1deg); }
          45% { transform: translateX(-4px) rotate(-0.5deg); }
          60% { transform: translateX(4px) rotate(0.5deg); }
          75% { transform: translateX(-2px); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
