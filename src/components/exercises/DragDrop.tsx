'use client';

import { useState, useRef } from 'react';
import { CheckCircle, XCircle, Lightbulb, GripVertical, Loader2 } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface DragDropProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

export function DragDrop({ exercise, onComplete }: DragDropProps) {
  const items = exercise.options ?? [];

  const [order, setOrder] = useState<number[]>(items.map((_, i) => i));
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [positionResults, setPositionResults] = useState<boolean[]>([]);
  const [explanation, setExplanation] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  function handleDragStart(pos: number) {
    if (submitted) return;
    dragItem.current = pos;
    setDraggingIdx(pos);
  }

  function handleDragOver(e: React.DragEvent, pos: number) {
    e.preventDefault();
    if (submitted) return;
    setDragOverIdx(pos);
  }

  function handleDrop(pos: number) {
    if (submitted || dragItem.current === null) return;
    const from = dragItem.current;
    if (from !== pos) {
      setOrder((prev) => {
        const next = [...prev];
        [next[from], next[pos]] = [next[pos], next[from]];
        return next;
      });
    }
    dragItem.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDraggingIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit() {
    setChecking(true);
    try {
      const result = await checkExercise(exercise.id, JSON.stringify(order));
      let correctOrder: number[];
      try { correctOrder = JSON.parse(result.correct_answer); }
      catch { correctOrder = items.map((_, i) => i); }
      const results = order.map((itemIdx, pos) => itemIdx === correctOrder[pos]);
      setPositionResults(results);
      setExplanation(result.explanation || exercise.explanation || '');
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
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {order.map((itemIdx, pos) => {
          const isDragging = draggingIdx === pos;
          const isDragOver = dragOverIdx === pos && draggingIdx !== pos;

          let bg = '#fff9f0';
          let borderColor = '#1c1917';
          let shadow = '3px 3px 0px #1c1917';
          let anim: string | undefined;

          if (submitted) {
            bg = positionResults[pos] ? '#2d7d6f' : '#c94040';
            anim = positionResults[pos] ? 'bounceIn 0.3s ease' : 'shakeCard 0.4s ease';
          } else if (isDragOver) {
            borderColor = '#e07a3a';
            shadow = '5px 5px 0px #e07a3a';
            bg = '#fff';
          }

          return (
            <div
              key={itemIdx}
              draggable={!submitted}
              onDragStart={() => handleDragStart(pos)}
              onDragOver={(e) => handleDragOver(e, pos)}
              onDrop={() => handleDrop(pos)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 14,
                border: `3px solid ${borderColor}`,
                padding: '12px 14px',
                background: bg,
                color: submitted ? '#fff' : '#1c1917',
                boxShadow: shadow,
                transition: 'all 0.15s ease',
                cursor: submitted ? 'default' : 'grab',
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? 'rotate(2deg) scale(1.02)' : isDragOver ? 'scale(1.02)' : 'none',
                animation: anim,
              }}
            >
              <GripVertical style={{ width: 18, height: 18, flexShrink: 0, opacity: submitted ? 0.5 : 0.6 }} />
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, flexShrink: 0, borderRadius: 8,
                  background: submitted ? 'rgba(255,255,255,0.2)' : '#f0ebe3',
                  fontSize: 12, fontWeight: 700,
                  color: submitted ? '#fff' : '#1c1917',
                  border: `2px solid ${submitted ? 'rgba(255,255,255,0.3)' : '#1c1917'}`,
                }}
              >
                {pos + 1}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{items[itemIdx]}</span>

              {!submitted && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <button type="button" onClick={() => moveItem(pos, -1)} disabled={pos === 0}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '2px solid #1c1917', background: pos === 0 ? '#e5e0d8' : '#fff9f0', cursor: pos === 0 ? 'not-allowed' : 'pointer', opacity: pos === 0 ? 0.3 : 1, fontSize: 14, fontWeight: 700 }}
                    aria-label="Move up">&#9650;</button>
                  <button type="button" onClick={() => moveItem(pos, 1)} disabled={pos === order.length - 1}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '2px solid #1c1917', background: pos === order.length - 1 ? '#e5e0d8' : '#fff9f0', cursor: pos === order.length - 1 ? 'not-allowed' : 'pointer', opacity: pos === order.length - 1 ? 0.3 : 1, fontSize: 14, fontWeight: 700 }}
                    aria-label="Move down">&#9660;</button>
                </div>
              )}

              {submitted && (
                positionResults[pos]
                  ? <CheckCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
                  : <XCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
              )}
            </div>
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
        <button type="button" onClick={handleSubmit} disabled={checking}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
            background: checking ? '#e5e0d8' : '#e07a3a', color: checking ? '#999' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: checking ? 'not-allowed' : 'pointer',
            boxShadow: checking ? 'none' : '3px 3px 0px #1c1917', transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}>
          {checking ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Checking...</> : 'Submit Order'}
        </button>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {explanation}
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
