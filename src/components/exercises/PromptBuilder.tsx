'use client';

import { useState, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, Lightbulb, Loader2, Zap, MousePointerClick } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface PromptBuilderProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface GameData {
  pieces: string[];
  correct_order: number[];
  context: string;
}

export function PromptBuilder({ exercise, onComplete }: PromptBuilderProps) {
  let gameData: GameData;
  try {
    gameData = exercise.game_data
      ? JSON.parse(exercise.game_data)
      : { pieces: exercise.options ?? [], correct_order: [], context: '' };
  } catch {
    gameData = { pieces: exercise.options ?? [], correct_order: [], context: '' };
  }

  const totalSlots = gameData.pieces.length;

  // slots[i] = index into gameData.pieces placed at slot i, or null if empty
  const [slots, setSlots] = useState<(number | null)[]>(Array(totalSlots).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [slotResults, setSlotResults] = useState<boolean[]>([]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [draggingPiece, setDraggingPiece] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [showAssembled, setShowAssembled] = useState(false);
  const [explanation, setExplanation] = useState('');
  const dragSource = useRef<{ type: 'pool' | 'slot'; index: number } | null>(null);

  // Which pieces are placed in slots
  const placedPieces = new Set(slots.filter((s): s is number => s !== null));
  const allFilled = slots.every((s) => s !== null);

  // --- Drag from pool ---
  function handlePieceDragStart(pieceIdx: number) {
    if (submitted) return;
    dragSource.current = { type: 'pool', index: pieceIdx };
    setDraggingPiece(pieceIdx);
  }

  function handleSlotDragOver(e: React.DragEvent, slotIdx: number) {
    e.preventDefault();
    if (submitted) return;
    setDragOverSlot(slotIdx);
  }

  function handleSlotDrop(slotIdx: number) {
    if (submitted || !dragSource.current) return;
    const src = dragSource.current;

    setSlots((prev) => {
      const next = [...prev];
      if (src.type === 'pool') {
        // If this slot already has a piece, it goes back to pool
        // Place the dragged piece here
        next[slotIdx] = src.index;
      } else if (src.type === 'slot') {
        // Swap slots
        const fromSlot = src.index;
        [next[fromSlot], next[slotIdx]] = [next[slotIdx], next[fromSlot]];
      }
      return next;
    });

    dragSource.current = null;
    setDraggingPiece(null);
    setDragOverSlot(null);
  }

  function handleDragEnd() {
    dragSource.current = null;
    setDraggingPiece(null);
    setDragOverSlot(null);
  }

  // --- Click-to-place (mobile) ---
  const handlePieceClick = useCallback((pieceIdx: number) => {
    if (submitted) return;

    // If piece is already placed, remove it
    if (placedPieces.has(pieceIdx)) {
      setSlots((prev) => prev.map((s) => (s === pieceIdx ? null : s)));
      setSelectedPiece(null);
      return;
    }

    setSelectedPiece(pieceIdx);
  }, [submitted, placedPieces]);

  const handleSlotClick = useCallback((slotIdx: number) => {
    if (submitted) return;

    if (selectedPiece !== null) {
      // Place selected piece into slot
      setSlots((prev) => {
        const next = [...prev];
        // If slot occupied, swap back to pool (just replace)
        next[slotIdx] = selectedPiece;
        return next;
      });
      setSelectedPiece(null);
    } else if (slots[slotIdx] !== null) {
      // Click occupied slot to remove piece
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
    }
  }, [submitted, selectedPiece, slots]);

  // --- Submit ---
  async function handleTestPrompt() {
    setShowAssembled(true);
  }

  async function handleSubmit() {
    if (!allFilled) return;
    setChecking(true);
    try {
      // Send the order of piece indices as placed in slots
      const answer = JSON.stringify(slots);
      const result = await checkExercise(exercise.id, answer);

      let correctOrder: number[];
      try {
        correctOrder = JSON.parse(result.correct_answer);
      } catch {
        correctOrder = gameData.correct_order;
      }

      const results = slots.map((pieceIdx, slotPos) => slotPos < correctOrder.length && pieceIdx === correctOrder[slotPos]);
      setSlotResults(results);
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
    } finally {
      setChecking(false);
    }
  }

  // Assembled prompt text
  const assembledText = slots
    .filter((s): s is number => s !== null)
    .map((idx) => gameData.pieces[idx])
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Context */}
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>
        {exercise.prompt}
      </p>

      {gameData.context && (
        <div style={{
          borderRadius: 12, background: '#f0ebe3', border: '2px solid #1c1917',
          padding: '12px 16px', fontSize: 13, color: '#1c1917', fontWeight: 500,
          lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700 }}>Context:</span> {gameData.context}
        </div>
      )}

      {/* Construction Zone */}
      <div style={{
        borderRadius: 16, border: '3px dashed #1c1917', padding: 20,
        background: '#faf8f5', minHeight: 120,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          fontSize: 13, fontWeight: 700, color: '#1c1917', textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <Zap style={{ width: 16, height: 16 }} />
          Prompt Construction Zone
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: totalSlots }).map((_, slotIdx) => {
            const pieceIdx = slots[slotIdx];
            const isEmpty = pieceIdx === null;
            const isOver = dragOverSlot === slotIdx;

            let borderColor = '#c4bdb3';
            let bg = 'transparent';
            let shadow = 'none';

            if (submitted && pieceIdx !== null) {
              borderColor = slotResults[slotIdx] ? '#2d7d6f' : '#c94040';
              bg = slotResults[slotIdx] ? 'rgba(45,125,111,0.08)' : 'rgba(201,64,64,0.08)';
              shadow = slotResults[slotIdx]
                ? '0 0 12px rgba(45,125,111,0.4)'
                : 'none';
            } else if (isOver) {
              borderColor = '#e07a3a';
              bg = 'rgba(224,122,58,0.06)';
            } else if (selectedPiece !== null && isEmpty) {
              borderColor = '#e07a3a';
              bg = 'rgba(224,122,58,0.03)';
            }

            return (
              <div
                key={slotIdx}
                onDragOver={(e) => handleSlotDragOver(e, slotIdx)}
                onDrop={() => handleSlotDrop(slotIdx)}
                onClick={() => handleSlotClick(slotIdx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 12,
                  border: `2px ${isEmpty ? 'dashed' : 'solid'} ${borderColor}`,
                  padding: '12px 14px',
                  background: bg,
                  minHeight: 48,
                  transition: 'all 0.2s ease',
                  cursor: submitted ? 'default' : 'pointer',
                  boxShadow: shadow,
                  animation: submitted && pieceIdx !== null
                    ? (slotResults[slotIdx] ? 'pbBounceIn 0.3s ease' : 'pbShake 0.4s ease')
                    : undefined,
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, flexShrink: 0, borderRadius: 8,
                  background: submitted && pieceIdx !== null
                    ? (slotResults[slotIdx] ? '#2d7d6f' : '#c94040')
                    : '#f0ebe3',
                  fontSize: 12, fontWeight: 700,
                  color: submitted && pieceIdx !== null ? '#fff' : '#1c1917',
                  border: `2px solid ${submitted && pieceIdx !== null
                    ? (slotResults[slotIdx] ? '#2d7d6f' : '#c94040')
                    : '#1c1917'}`,
                }}>
                  {slotIdx + 1}
                </span>

                {isEmpty ? (
                  <span style={{ flex: 1, fontSize: 13, color: '#a8a29e', fontStyle: 'italic' }}>
                    {selectedPiece !== null ? 'Click to place here' : 'Drag a piece here'}
                  </span>
                ) : (
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 500, color: '#1c1917',
                  }}>
                    {gameData.pieces[pieceIdx]}
                  </span>
                )}

                {submitted && pieceIdx !== null && (
                  slotResults[slotIdx]
                    ? <CheckCircle style={{ width: 18, height: 18, color: '#2d7d6f', flexShrink: 0 }} />
                    : <XCircle style={{ width: 18, height: 18, color: '#c94040', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prompt Pieces Pool */}
      {!submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#1c1917', textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <MousePointerClick style={{ width: 14, height: 14 }} />
            Available Pieces
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {gameData.pieces.map((piece, pieceIdx) => {
              const isPlaced = placedPieces.has(pieceIdx);
              const isSelected = selectedPiece === pieceIdx;
              const isDragging = draggingPiece === pieceIdx;

              return (
                <div
                  key={pieceIdx}
                  draggable={!isPlaced && !submitted}
                  onDragStart={() => handlePieceDragStart(pieceIdx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handlePieceClick(pieceIdx)}
                  style={{
                    borderRadius: 12,
                    border: `3px solid ${isSelected ? '#e07a3a' : '#1c1917'}`,
                    padding: '10px 14px',
                    background: isPlaced ? '#e5e0d8' : '#fff9f0',
                    color: isPlaced ? '#a8a29e' : '#1c1917',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isPlaced ? 'default' : 'grab',
                    boxShadow: isPlaced
                      ? 'none'
                      : isSelected
                        ? '4px 4px 0px #e07a3a'
                        : '3px 3px 0px #1c1917',
                    opacity: isPlaced ? 0.5 : isDragging ? 0.4 : 1,
                    transform: isDragging
                      ? 'rotate(3deg) scale(1.05)'
                      : isSelected
                        ? 'scale(1.03)'
                        : 'none',
                    transition: 'all 0.15s ease',
                    textDecoration: isPlaced ? 'line-through' : 'none',
                    userSelect: 'none',
                  }}
                >
                  {piece}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assembled Preview */}
      {showAssembled && !submitted && allFilled && (
        <div style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
          animation: 'pbFadeIn 0.3s ease',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: '#a8a29e', marginBottom: 10,
          }}>
            Assembled Prompt
          </div>
          <div style={{
            borderRadius: 12, background: '#f0ebe3', border: '2px solid #d4cfc7',
            padding: 16, fontSize: 14, lineHeight: 1.7, color: '#1c1917',
            fontWeight: 500, fontStyle: 'italic',
          }}>
            &ldquo;{assembledText}&rdquo;
          </div>
        </div>
      )}

      {/* Hints */}
      {!submitted && exercise.hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hintsRevealed > 0 && exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12,
              background: '#d4a373', border: '2px solid #1c1917', padding: '10px 12px',
              fontSize: 13, color: '#1c1917', fontWeight: 500,
            }}>
              <Lightbulb style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
              {hint}
            </div>
          ))}
          {hintsRevealed < exercise.hints.length && (
            <button type="button" onClick={() => setHintsRevealed((h) => h + 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d4a373', fontWeight: 600, fontSize: 13, padding: '4px 0',
              }}>
              <Lightbulb style={{ width: 16, height: 16 }} />
              {hintsRevealed === 0 ? 'Show hint' : 'Next hint'}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!submitted && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {allFilled && !showAssembled && (
            <button type="button" onClick={handleTestPrompt}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 14, border: '3px solid #1c1917',
                background: '#2d7d6f', color: '#fff',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: '3px 3px 0px #1c1917', transition: 'all 0.15s ease',
                animation: 'pbFadeIn 0.3s ease',
              }}>
              <Zap style={{ width: 16, height: 16 }} />
              Test Prompt
            </button>
          )}

          {showAssembled && allFilled && (
            <button type="button" onClick={handleSubmit} disabled={checking}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
                background: checking ? '#e5e0d8' : '#e07a3a',
                color: checking ? '#999' : '#fff',
                fontWeight: 700, fontSize: 15,
                cursor: checking ? 'not-allowed' : 'pointer',
                boxShadow: checking ? 'none' : '3px 3px 0px #1c1917',
                transition: 'all 0.15s ease',
                animation: 'pbFadeIn 0.3s ease',
              }}>
              {checking
                ? <><Loader2 style={{ width: 18, height: 18, animation: 'pbSpin 1s linear infinite' }} /> Checking...</>
                : 'Submit Answer'}
            </button>
          )}
        </div>
      )}

      {/* Post-submit explanation */}
      {submitted && (
        <div style={{
          borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3',
          padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6,
          animation: 'pbFadeIn 0.3s ease',
        }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {explanation}
        </div>
      )}

      {/* Final assembled prompt (after submit) */}
      {submitted && (
        <div style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
          animation: 'pbFadeIn 0.3s ease',
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: '#a8a29e', marginBottom: 10,
          }}>
            Your Assembled Prompt
          </div>
          <div style={{
            borderRadius: 12, background: '#f0ebe3', border: '2px solid #d4cfc7',
            padding: 16, fontSize: 14, lineHeight: 1.7, color: '#1c1917',
            fontWeight: 500, fontStyle: 'italic',
          }}>
            &ldquo;{assembledText}&rdquo;
          </div>
        </div>
      )}

      <style>{`
        @keyframes pbShake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
        @keyframes pbBounceIn { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes pbFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pbSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
