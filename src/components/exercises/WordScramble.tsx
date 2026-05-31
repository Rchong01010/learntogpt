'use client';

import { useState, useMemo } from 'react';
import { Shuffle, Lightbulb, Check, Trophy, RotateCcw } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface WordScrambleProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

function shuffleString(str: string): string[] {
  const chars = str.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  if (chars.join('') === str && chars.length > 1) {
    const first = chars.findIndex((c) => c !== ' ');
    const second = chars.findIndex((c, idx) => idx > first && c !== ' ');
    if (second !== -1) [chars[first], chars[second]] = [chars[second], chars[first]];
  }
  return chars;
}

export function WordScramble({ exercise, onComplete }: WordScrambleProps) {
  const answer = (exercise.game_data ?? '').trim();
  const answerUpper = answer.toUpperCase();

  const initialTiles = useMemo(() => {
    return shuffleString(answerUpper).map((char, i) => ({ id: i, char, isSpace: char === ' ' }));
  }, [answerUpper]);

  const [availableTiles, setAvailableTiles] = useState(initialTiles.filter((t) => !t.isSpace));
  const [placedTiles, setPlacedTiles] = useState<Array<{ id: number; char: string } | null>>(
    answerUpper.split('').map((c) => (c === ' ' ? { id: -1, char: ' ' } : null)),
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [explanationText, setExplanationText] = useState('');

  function placeTile(tileId: number) {
    if (submitted) return;
    const tile = availableTiles.find((t) => t.id === tileId);
    if (!tile) return;
    const emptyIdx = placedTiles.findIndex((t, i) => t === null && answerUpper[i] !== ' ');
    if (emptyIdx === -1) return;
    const newPlaced = [...placedTiles];
    newPlaced[emptyIdx] = { id: tile.id, char: tile.char };
    setPlacedTiles(newPlaced);
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tileId));
  }

  function removeTile(slotIdx: number) {
    if (submitted) return;
    const tile = placedTiles[slotIdx];
    if (!tile || tile.id === -1) return;
    const newPlaced = [...placedTiles];
    newPlaced[slotIdx] = null;
    setPlacedTiles(newPlaced);
    setAvailableTiles((prev) => [...prev, { id: tile.id, char: tile.char, isSpace: false }]);
  }

  function handleHint() {
    if (submitted) return;
    for (let i = 0; i < placedTiles.length; i++) {
      if (placedTiles[i] === null && answerUpper[i] !== ' ') {
        const correctChar = answerUpper[i];
        const tileIdx = availableTiles.findIndex((t) => t.char === correctChar);
        if (tileIdx !== -1) {
          const tile = availableTiles[tileIdx];
          const newPlaced = [...placedTiles];
          newPlaced[i] = { id: tile.id, char: tile.char };
          setPlacedTiles(newPlaced);
          setAvailableTiles((prev) => prev.filter((_, idx) => idx !== tileIdx));
          setHintsUsed((h) => h + 1);
          return;
        }
      }
    }
  }

  async function handleSubmit() {
    const assembled = placedTiles.map((t) => t?.char ?? '').join('');
    try {
      const result = await checkExercise(exercise.id, assembled);
      if (result.correct) {
        setSubmitted(true);
        setCorrect(true);
        setExplanationText(result.explanation || exercise.explanation || '');
        const hintPenalty = Math.min(hintsUsed * 0.15, 0.6);
        onComplete({ correct: true, explanation: result.explanation, xp_earned: Math.round(exercise.xp_reward * (1 - hintPenalty)) });
      } else {
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 600);
      }
    } catch (err) {
      console.error('Exercise check failed:', err);
      alert('Failed to check answer. Please try again.');
    }
  }

  function handleReset() {
    if (submitted) return;
    setPlacedTiles(answerUpper.split('').map((c) => (c === ' ' ? { id: -1, char: ' ' } : null)));
    setAvailableTiles(initialTiles.filter((t) => !t.isSpace));
  }

  const allFilled = availableTiles.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 600 }}>
        <Shuffle style={{ width: 20, height: 20, color: '#e07a3a', flexShrink: 0 }} />
        <span>{exercise.prompt || 'Unscramble the word!'}</span>
      </div>

      {/* Placed tiles / answer slots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '16px 0' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6,
          transition: 'all 0.2s ease',
          animation: wrongFlash ? 'shakeCard 0.4s ease' : correct ? 'bounceIn 0.4s ease' : undefined,
        }}>
          {placedTiles.map((tile, i) => {
            if (answerUpper[i] === ' ') {
              return <div key={`space-${i}`} style={{ width: 14 }} />;
            }

            const isCorrectSlot = submitted && tile?.char === answerUpper[i];

            return (
              <button
                key={i}
                type="button"
                disabled={submitted || tile === null}
                onClick={() => removeTile(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 46, height: 46, borderRadius: 12,
                  border: tile
                    ? isCorrectSlot
                      ? '3px solid #2d7d6f'
                      : wrongFlash
                        ? '3px solid #c94040'
                        : '3px solid #1c1917'
                    : '3px dashed #999',
                  background: tile
                    ? isCorrectSlot
                      ? '#2d7d6f'
                      : wrongFlash
                        ? '#c94040'
                        : '#e07a3a'
                    : '#f0ebe3',
                  fontSize: 20, fontWeight: 800, fontFamily: 'monospace',
                  color: tile
                    ? '#fff'
                    : '#ccc',
                  cursor: submitted || tile === null ? 'default' : 'pointer',
                  boxShadow: tile ? '2px 2px 0px #1c1917' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tile?.char ?? ''}
              </button>
            );
          })}
        </div>

        {/* Available tiles */}
        {!submitted && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => placeTile(tile.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 46, height: 46, borderRadius: 12,
                  border: '3px solid #1c1917', background: '#fff9f0',
                  fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#1c1917',
                  cursor: 'pointer', boxShadow: '2px 2px 0px #1c1917',
                  transition: 'all 0.1s ease',
                }}
              >
                {tile.char}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {!submitted && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={handleSubmit} disabled={!allFilled}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 14, border: '3px solid #1c1917',
              background: !allFilled ? '#e5e0d8' : '#2d7d6f',
              color: !allFilled ? '#999' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: !allFilled ? 'not-allowed' : 'pointer',
              boxShadow: !allFilled ? 'none' : '3px 3px 0px #1c1917',
            }}>
            <Check style={{ width: 18, height: 18 }} />
            Check Answer
          </button>
          <button type="button" onClick={handleHint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: '2px solid #d4a373',
              background: 'transparent', color: '#d4a373', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
            <Lightbulb style={{ width: 16, height: 16 }} />
            Hint {hintsUsed > 0 && `(${hintsUsed})`}
          </button>
          <button type="button" onClick={handleReset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: '2px solid #999',
              background: 'transparent', color: '#999', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
            <RotateCcw style={{ width: 16, height: 16 }} />
            Reset
          </button>
        </div>
      )}

      {/* Celebration */}
      {correct && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          borderRadius: 16, border: '3px solid #2d7d6f', background: 'rgba(45,125,111,0.1)',
          padding: 20, animation: 'bounceIn 0.4s ease',
        }}>
          <Trophy style={{ width: 36, height: 36, color: '#d4a373', animation: 'bounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontWeight: 700, color: '#2d7d6f', fontSize: 16 }}>Correct! The answer is: {answer}</p>
          {hintsUsed > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 20, background: '#d4a373', border: '2px solid #1c1917',
              fontWeight: 700, fontSize: 12, color: '#1c1917',
            }}>
              {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used
            </span>
          )}
        </div>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {explanationText}
        </div>
      )}

      <style>{`
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes bounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
        @keyframes bounceFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
