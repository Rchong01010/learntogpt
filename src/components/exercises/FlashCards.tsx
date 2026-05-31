'use client';

import { useState, useMemo, useCallback } from 'react';
import { RotateCcw, Check, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface FlashCardsProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface FlashCard { front: string; back: string; }

export function FlashCards({ exercise, onComplete }: FlashCardsProps) {
  const allCards: FlashCard[] = useMemo(() => {
    try { return JSON.parse(exercise.game_data ?? '[]'); }
    catch { return []; }
  }, [exercise.game_data]);

  const [deck, setDeck] = useState<number[]>(allCards.map((_, i) => i));
  const [currentPos, setCurrentPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);

  const currentCardIdx = deck[currentPos];
  const currentCard = currentCardIdx != null ? allCards[currentCardIdx] : null;
  const totalCards = allCards.length;

  const checkComplete = useCallback(
    (nextMastered: Set<number>) => {
      if (nextMastered.size === totalCards) {
        setCompleted(true);
        onComplete({ correct: true, explanation: exercise.explanation, xp_earned: exercise.xp_reward });
      }
    },
    [totalCards, exercise, onComplete],
  );

  function handleRate(gotIt: boolean) {
    if (currentCardIdx == null) return;
    if (gotIt) {
      const next = new Set(mastered);
      next.add(currentCardIdx);
      setMastered(next);
      const newDeck = deck.filter((_, i) => i !== currentPos);
      if (newDeck.length === 0) { checkComplete(next); return; }
      setDeck(newDeck);
      setCurrentPos((p) => (p >= newDeck.length ? 0 : p));
    } else {
      if (deck.length > 1) {
        const newDeck = [...deck];
        const [removed] = newDeck.splice(currentPos, 1);
        newDeck.push(removed);
        setDeck(newDeck);
        if (currentPos >= newDeck.length) setCurrentPos(0);
      }
    }
    setFlipped(false);
  }

  function navigate(direction: -1 | 1) {
    setFlipped(false);
    setCurrentPos((p) => {
      const next = p + direction;
      if (next < 0) return deck.length - 1;
      if (next >= deck.length) return 0;
      return next;
    });
  }

  if (completed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0', animation: 'bounceIn 0.4s ease' }}>
          <Trophy style={{ width: 48, height: 48, color: '#d4a373', animation: 'bounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>All cards mastered!</p>
          <p style={{ fontSize: 14, color: '#666' }}>{totalCards} of {totalCards} cards completed</p>
        </div>
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {exercise.explanation}
        </div>
        <style>{`
          @keyframes bounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
          @keyframes bounceFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 10, borderRadius: 20, background: '#f0ebe3', border: '2px solid #1c1917', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 20, background: '#2d7d6f', transition: 'width 0.5s ease-out', width: `${totalCards > 0 ? (mastered.size / totalCards) * 100 : 0}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', fontVariantNumeric: 'tabular-nums' }}>
          {mastered.size} of {totalCards} mastered
        </span>
      </div>

      {/* Card */}
      {currentCard && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* 3D flip card */}
          <div
            style={{ width: '100%', maxWidth: 420, cursor: 'pointer', perspective: 1000, userSelect: 'none' }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div style={{
              position: 'relative', width: '100%', minHeight: 220,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: 18, border: '4px solid #1c1917', background: '#fff9f0',
                padding: 28, textAlign: 'center',
                boxShadow: '5px 5px 0px #1c1917',
                backfaceVisibility: 'hidden',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e07a3a', marginBottom: 12 }}>
                  Question
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#1c1917', lineHeight: 1.5 }}>
                  {currentCard.front}
                </p>
                <p style={{ marginTop: 16, fontSize: 12, color: '#999' }}>Click to flip</p>
              </div>

              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: 18, border: '4px solid #1c1917', background: '#2d7d6f',
                padding: 28, textAlign: 'center',
                boxShadow: '5px 5px 0px #1c1917',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                  Answer
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>
                  {currentCard.back}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => navigate(-1)} disabled={deck.length <= 1}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, border: '2px solid #1c1917', background: '#f0ebe3',
                cursor: deck.length <= 1 ? 'not-allowed' : 'pointer', opacity: deck.length <= 1 ? 0.3 : 1,
              }}>
              <ChevronLeft style={{ width: 18, height: 18, color: '#1c1917' }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#999', width: 60, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
              {currentPos + 1} / {deck.length}
            </span>
            <button type="button" onClick={() => navigate(1)} disabled={deck.length <= 1}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, border: '2px solid #1c1917', background: '#f0ebe3',
                cursor: deck.length <= 1 ? 'not-allowed' : 'pointer', opacity: deck.length <= 1 ? 0.3 : 1,
              }}>
              <ChevronRight style={{ width: 18, height: 18, color: '#1c1917' }} />
            </button>
          </div>

          {/* Rate buttons */}
          {flipped && (
            <div style={{ display: 'flex', gap: 12, animation: 'fadeIn 0.2s ease' }}>
              <button type="button" onClick={() => handleRate(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 14, border: '3px solid #1c1917',
                  background: '#c94040', color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', boxShadow: '3px 3px 0px #1c1917',
                }}>
                <RotateCcw style={{ width: 16, height: 16 }} />
                Review again
              </button>
              <button type="button" onClick={() => handleRate(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 14, border: '3px solid #1c1917',
                  background: '#2d7d6f', color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', boxShadow: '3px 3px 0px #1c1917',
                }}>
                <Check style={{ width: 16, height: 16 }} />
                Got it
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
