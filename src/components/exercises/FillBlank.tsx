'use client';

import { useState, useMemo, useCallback } from 'react';
import { CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface FillBlankProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

const GENERIC_DISTRACTORS = [
  'system', 'prompt', 'model', 'context', 'agent', 'tool',
  'token', 'temperature', 'response', 'instruction', 'completion', 'embedding',
];

function fuzzyMatch(input: string, expected: string): boolean {
  return input.trim().toLowerCase() === expected.trim().toLowerCase();
}

function pickDistractors(pool: string[], exclude: Set<string>, count: number): string[] {
  const filtered = pool.filter((w) => !exclude.has(w.toLowerCase()));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FillBlank({ exercise, onComplete }: FillBlankProps) {
  const blankCount = (exercise.prompt.match(/_____/g) ?? []).length || 1;

  const wordBank = useMemo(() => {
    const minChoices = Math.max(3, blankCount + 2);
    const provided = exercise.options && exercise.options.length > 0 ? [...exercise.options] : [];

    // If we already have enough options (e.g. manually authored), use them directly
    if (provided.length >= minChoices) {
      return shuffle(provided);
    }

    // Otherwise, supplement with distractors until we have enough choices
    const alreadyUsed = new Set(provided.map((d) => d.toLowerCase()));
    const needed = minChoices - provided.length;
    let distractors: string[] = [];

    if (exercise.hints.length > 0) {
      const hintWords = exercise.hints
        .flatMap((h) => h.split(/\s+/))
        .filter((w) => w.length > 3)
        .map((w) => w.replace(/[^a-zA-Z]/g, ''))
        .filter((w) => w.length > 3);
      distractors = pickDistractors(hintWords, alreadyUsed, needed);
    }

    if (distractors.length < needed) {
      const used = new Set([...alreadyUsed, ...distractors.map((d) => d.toLowerCase())]);
      const extras = pickDistractors(GENERIC_DISTRACTORS, used, needed - distractors.length);
      distractors.push(...extras);
    }

    return shuffle([...provided, ...distractors]);
  }, [blankCount, exercise.options, exercise.hints]);

  const [answers, setAnswers] = useState<(string | null)[]>(Array(blankCount).fill(null));
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [explanation, setExplanation] = useState('');

  const usedWords = useMemo(() => {
    const used = new Set<number>();
    for (const answer of answers) {
      if (answer !== null) {
        for (let j = 0; j < wordBank.length; j++) {
          if (wordBank[j] === answer && !used.has(j)) {
            used.add(j);
            break;
          }
        }
      }
    }
    return used;
  }, [answers, wordBank]);

  const handleWordClick = useCallback((word: string, _wordIndex: number) => {
    if (submitted) return;
    let targetIndex = -1;
    if (activeBlankIndex < blankCount && answers[activeBlankIndex] === null) {
      targetIndex = activeBlankIndex;
    } else {
      for (let i = 0; i < blankCount; i++) {
        if (answers[i] === null) { targetIndex = i; break; }
      }
    }
    if (targetIndex === -1) return;
    setAnswers((prev) => { const next = [...prev]; next[targetIndex] = word; return next; });
    for (let i = targetIndex + 1; i < blankCount; i++) {
      if (answers[i] === null && i !== targetIndex) { setActiveBlankIndex(i); return; }
    }
    for (let i = 0; i < targetIndex; i++) {
      if (answers[i] === null) { setActiveBlankIndex(i); return; }
    }
  }, [submitted, activeBlankIndex, blankCount, answers]);

  const handleBlankClick = useCallback((index: number) => {
    if (submitted) return;
    if (answers[index] !== null) {
      setAnswers((prev) => { const next = [...prev]; next[index] = null; return next; });
      setActiveBlankIndex(index);
    } else {
      setActiveBlankIndex(index);
    }
  }, [submitted, answers]);

  async function handleSubmit() {
    const filledAnswers = answers.map((a) => a ?? '');
    setChecking(true);
    try {
      const answerPayload = blankCount === 1 ? filledAnswers[0] : JSON.stringify(filledAnswers);
      const result = await checkExercise(exercise.id, answerPayload);
      let serverCorrect: string[];
      try {
        const parsed = JSON.parse(result.correct_answer);
        serverCorrect = Array.isArray(parsed) ? parsed : [parsed];
      } catch { serverCorrect = [result.correct_answer]; }
      setCorrectAnswers(serverCorrect);
      setExplanation(result.explanation || exercise.explanation || '');
      const r = filledAnswers.map((a, i) => fuzzyMatch(a, serverCorrect[i] ?? ''));
      setResults(r);
      setSubmitted(true);
      const allCorrect = result.correct;
      if (!allCorrect) { setShaking(true); setTimeout(() => setShaking(false), 500); }
      onComplete({
        correct: allCorrect,
        explanation: result.explanation,
        xp_earned: allCorrect ? exercise.xp_reward : 0,
      });
    } catch (err) {
      console.error('Exercise check failed:', err);
      alert('Failed to check answer. Please try again.');
    } finally { setChecking(false); }
  }

  const parts = exercise.prompt.split('_____');
  const allFilled = answers.every((a) => a !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Prompt with inline blanks */}
      <div
        style={{
          fontSize: 16, color: '#1c1917', lineHeight: 1.8, fontWeight: 500,
          animation: shaking ? 'shakeCard 0.4s ease' : undefined,
        }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < blankCount && (
              <button
                type="button"
                onClick={() => handleBlankClick(i)}
                disabled={submitted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 110,
                  minHeight: 36,
                  margin: '0 4px',
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: submitted
                    ? `3px solid ${results[i] ? '#2d7d6f' : '#c94040'}`
                    : answers[i] !== null
                      ? activeBlankIndex === i ? '3px solid #e07a3a' : '3px solid #1c1917'
                      : activeBlankIndex === i ? '3px dashed #e07a3a' : '3px dashed #999',
                  background: submitted
                    ? results[i] ? 'rgba(45,125,111,0.15)' : 'rgba(201,64,64,0.15)'
                    : answers[i] !== null ? '#fff' : '#f0ebe3',
                  fontSize: 14,
                  fontWeight: 600,
                  color: submitted
                    ? results[i] ? '#2d7d6f' : '#c94040'
                    : answers[i] !== null ? '#1c1917' : '#999',
                  cursor: submitted ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  verticalAlign: 'middle',
                  boxShadow: answers[i] !== null && !submitted ? '2px 2px 0px #1c1917' : 'none',
                }}
              >
                {answers[i] !== null ? answers[i] : `Blank ${i + 1}`}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Word Bank */}
      {!submitted && (
        <div
          style={{
            borderRadius: 14,
            border: '2px solid #1c1917',
            background: '#f0ebe3',
            padding: 14,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 8 }}>
            Word Bank
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {wordBank.map((word, i) => {
              const isUsed = usedWords.has(i);
              return (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  disabled={isUsed}
                  onClick={() => { if (!isUsed) handleWordClick(word, i); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '2px solid #1c1917',
                    background: isUsed ? '#e5e0d8' : '#fff9f0',
                    color: isUsed ? '#bbb' : '#1c1917',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: isUsed ? 'default' : 'pointer',
                    opacity: isUsed ? 0.4 : 1,
                    textDecoration: isUsed ? 'line-through' : 'none',
                    boxShadow: isUsed ? 'none' : '2px 2px 0px #1c1917',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-blank feedback */}
      {submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {correctAnswers.map((correct, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
                color: results[i] ? '#2d7d6f' : '#c94040',
              }}
            >
              {results[i] ? <CheckCircle style={{ width: 16, height: 16 }} /> : <XCircle style={{ width: 16, height: 16 }} />}
              {results[i] ? (
                <span>Blank {i + 1}: Correct!</span>
              ) : (
                <span>Blank {i + 1}: Expected <strong>{correct}</strong></span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hints */}
      {!submitted && exercise.hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hintsRevealed > 0 && exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12,
                background: '#d4a373', border: '2px solid #1c1917', padding: '10px 12px',
                fontSize: 13, color: '#1c1917', fontWeight: 500,
              }}
            >
              <Lightbulb style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
              {hint}
            </div>
          ))}
          {hintsRevealed < exercise.hints.length && (
            <button type="button" onClick={() => setHintsRevealed((h) => h + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#d4a373', fontWeight: 600, fontSize: 13, padding: '4px 0' }}
            >
              <Lightbulb style={{ width: 16, height: 16 }} />
              {hintsRevealed === 0 ? 'Show hint' : 'Next hint'}
            </button>
          )}
        </div>
      )}

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allFilled || checking}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
            background: !allFilled || checking ? '#e5e0d8' : '#e07a3a',
            color: !allFilled || checking ? '#999' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: !allFilled || checking ? 'not-allowed' : 'pointer',
            boxShadow: !allFilled || checking ? 'none' : '3px 3px 0px #1c1917',
            transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}
        >
          {checking ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Checking...</> : 'Submit Answer'}
        </button>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {explanation}
        </div>
      )}

      <style>{`
        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
