'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, FileText, Loader2 } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface ScenarioExerciseProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ScenarioExercise({ exercise, onComplete }: ScenarioExerciseProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [serverExplanation, setServerExplanation] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const options = exercise.options ?? [];

  const promptParts = exercise.prompt.split('\n\n');
  const scenario = promptParts.length > 1 ? promptParts.slice(0, -1).join('\n\n') : null;
  const question = promptParts.length > 1 ? promptParts[promptParts.length - 1] : exercise.prompt;

  async function handleSubmit() {
    if (selected === null) return;
    setChecking(true);
    try {
      const result = await checkExercise(exercise.id, String(selected));
      const parsedIndex = parseInt(result.correct_answer, 10);
      setCorrectIndex(!isNaN(parsedIndex) ? parsedIndex : (result.correct ? selected : null));
      setServerExplanation(result.explanation);
      setSubmitted(true);
      if (!result.correct) {
        setShakeIndex(selected);
        setTimeout(() => setShakeIndex(null), 500);
      }
      onComplete({
        correct: result.correct,
        explanation: result.explanation,
        xp_earned: result.correct ? exercise.xp_reward : 0,
      });
    } catch (err) {
      console.error('Exercise check failed:', err);
      alert('Failed to check answer. Please try again.');
    } finally { setChecking(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Scenario context card */}
      {scenario && (
        <div style={{
          borderRadius: 14, border: '3px solid #1c1917', background: '#f0ebe3',
          padding: 18, boxShadow: '3px 3px 0px #1c1917',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <FileText style={{ width: 18, height: 18, color: '#e07a3a' }} />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e07a3a' }}>
              Situation
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#1c1917', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {scenario}
          </div>
        </div>
      )}

      {/* Question */}
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 600 }}>{question}</p>

      {/* Options as chunky cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((option, i) => {
          let bg = '#fff9f0';
          let borderColor = '#1c1917';
          let shadow = '3px 3px 0px #1c1917';
          let color = '#1c1917';
          let anim: string | undefined;

          if (submitted && i === correctIndex) {
            bg = '#2d7d6f'; color = '#fff';
            anim = 'bounceIn 0.4s ease';
          } else if (submitted && i === selected && i !== correctIndex) {
            bg = '#c94040'; color = '#fff';
            anim = shakeIndex === i ? 'shakeCard 0.4s ease' : undefined;
          } else if (!submitted && i === selected) {
            borderColor = '#e07a3a';
            shadow = '5px 5px 0px #e07a3a';
            bg = '#fff';
          }

          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 16,
                border: `3px solid ${borderColor}`, padding: '16px 18px', textAlign: 'left' as const,
                transition: 'all 0.15s ease', cursor: submitted ? 'default' : 'pointer',
                background: bg, boxShadow: shadow, minHeight: 56, width: '100%',
                fontSize: 14, color, fontWeight: 500, animation: anim,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, flexShrink: 0, borderRadius: 10,
                background: submitted && i === correctIndex ? 'rgba(255,255,255,0.25)' : '#f0ebe3',
                fontSize: 14, fontWeight: 700,
                color: submitted && (i === correctIndex || (i === selected && i !== correctIndex)) ? '#fff' : '#1c1917',
                border: '2px solid',
                borderColor: submitted && i === correctIndex ? 'rgba(255,255,255,0.4)' : '#1c1917',
              }}>
                {LETTERS[i]}
              </span>
              <span style={{ flex: 1, paddingTop: 4 }}>{option}</span>
              {submitted && i === correctIndex && <CheckCircle style={{ width: 22, height: 22, flexShrink: 0, marginTop: 4, color: '#fff' }} />}
              {submitted && i === selected && i !== correctIndex && <XCircle style={{ width: 22, height: 22, flexShrink: 0, marginTop: 4, color: '#fff' }} />}
            </button>
          );
        })}
      </div>

      {/* Hints */}
      {!submitted && exercise.hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hintsRevealed > 0 && exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, background: '#d4a373', border: '2px solid #1c1917', padding: '10px 12px', fontSize: 13, color: '#1c1917', fontWeight: 500 }}>
              <Lightbulb style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
              {hint}
            </div>
          ))}
          {hintsRevealed < exercise.hints.length && (
            <button type="button" onClick={() => setHintsRevealed((h) => h + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#d4a373', fontWeight: 600, fontSize: 13, padding: '4px 0' }}>
              <Lightbulb style={{ width: 16, height: 16 }} />
              {hintsRevealed === 0 ? 'Show hint' : 'Next hint'}
            </button>
          )}
        </div>
      )}

      {!submitted && (
        <button type="button" onClick={handleSubmit} disabled={selected === null || checking}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
            background: selected === null || checking ? '#e5e0d8' : '#e07a3a',
            color: selected === null || checking ? '#999' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: selected === null || checking ? 'not-allowed' : 'pointer',
            boxShadow: selected === null || checking ? 'none' : '3px 3px 0px #1c1917',
            transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}>
          {checking ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Checking...</> : 'Submit Answer'}
        </button>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {serverExplanation}
        </div>
      )}

      <style>{`
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px) rotate(-1deg)} 30%{transform:translateX(6px) rotate(1deg)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
        @keyframes bounceIn { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
