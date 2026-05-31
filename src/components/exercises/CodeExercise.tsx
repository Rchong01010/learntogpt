'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Code, Loader2, Play } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface CodeExerciseProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

export function CodeExercise({ exercise, onComplete }: CodeExerciseProps) {
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [serverExplanation, setServerExplanation] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);

  async function handleSubmit() {
    setChecking(true);
    try {
      const result = await checkExercise(exercise.id, code);
      setIsCorrect(result.correct);
      setExpectedAnswer(result.correct_answer);
      setServerExplanation(result.explanation);
      setSubmitted(true);
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>
        <Code style={{ marginTop: 3, width: 20, height: 20, flexShrink: 0, color: '#e07a3a' }} />
        <p>{exercise.prompt}</p>
      </div>

      {/* Code editor area -- stays dark for readability */}
      <div
        style={{
          borderRadius: 14,
          border: submitted ? `3px solid ${isCorrect ? '#2d7d6f' : '#c94040'}` : '3px solid #1c1917',
          overflow: 'hidden',
          boxShadow: '4px 4px 0px #1c1917',
        }}
      >
        {/* Editor toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
          background: '#1c1917', borderBottom: '2px solid #333',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c94040' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d4a373' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2d7d6f' }} />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code Editor</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={submitted}
          rows={8}
          placeholder="Write your code here..."
          spellCheck={false}
          style={{
            width: '100%',
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 14,
            background: '#0a0a0a',
            color: '#e5e5e5',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Result indicator */}
      {submitted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
          color: isCorrect ? '#2d7d6f' : '#c94040',
          animation: isCorrect ? 'bounceIn 0.4s ease' : 'shakeCard 0.4s ease',
        }}>
          {isCorrect ? (
            <><CheckCircle style={{ width: 18, height: 18 }} /> <span>Correct!</span></>
          ) : (
            <><XCircle style={{ width: 18, height: 18 }} /> <span>Not quite. See the expected answer below.</span></>
          )}
        </div>
      )}

      {/* Expected answer */}
      {submitted && !isCorrect && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected answer:</p>
          <pre style={{
            overflowX: 'auto', borderRadius: 12, border: '2px solid #1c1917', background: '#0a0a0a',
            padding: 14, fontSize: 13, color: '#2d7d6f', fontFamily: 'monospace',
          }}>{expectedAnswer}</pre>
        </div>
      )}

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
        <button type="button" onClick={handleSubmit} disabled={code.trim() === '' || checking}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
            background: code.trim() === '' || checking ? '#e5e0d8' : '#2d7d6f',
            color: code.trim() === '' || checking ? '#999' : '#fff',
            fontWeight: 700, fontSize: 15,
            cursor: code.trim() === '' || checking ? 'not-allowed' : 'pointer',
            boxShadow: code.trim() === '' || checking ? 'none' : '3px 3px 0px #1c1917',
            transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}>
          {checking ? (
            <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Running...</>
          ) : (
            <><Play style={{ width: 18, height: 18 }} /> Run Code</>
          )}
        </button>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {serverExplanation}
        </div>
      )}

      <style>{`
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
        @keyframes bounceIn { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
