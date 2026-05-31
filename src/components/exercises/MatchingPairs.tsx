'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Link2, Trophy } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface MatchingPairsProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface Pair { term: string; definition: string; }

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export function MatchingPairs({ exercise, onComplete }: MatchingPairsProps) {
  const t = useTranslations('lessons');
  const pairs: Pair[] = useMemo(() => {
    try {
      const mapping: Record<string, string> = JSON.parse(exercise.game_data ?? '{}');
      return Object.entries(mapping).map(([term, definition]) => ({ term, definition }));
    } catch { return []; }
  }, [exercise.game_data]);

  const shuffledTerms = useMemo(() => shuffleArray(pairs.map((p) => p.term)), [pairs]);
  const uniqueDefinitions = useMemo(() => {
    const unique = [...new Set(pairs.map((p) => p.definition))];
    return shuffleArray(unique);
  }, [pairs]);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Map<string, string>>(new Map());
  const [flashWrong, setFlashWrong] = useState(false);
  const [completed, setCompleted] = useState(false);

  const correctMap = useMemo(() => {
    const m = new Map<string, string>();
    pairs.forEach((p) => m.set(p.term, p.definition));
    return m;
  }, [pairs]);

  const tryMatch = useCallback(
    (term: string, def: string) => {
      if (correctMap.get(term) === def) {
        const next = new Map(matched);
        next.set(term, def);
        setMatched(next);
        setSelectedTerm(null);
        setSelectedDef(null);
        if (next.size === pairs.length) {
          setCompleted(true);
          onComplete({ correct: true, explanation: exercise.explanation, xp_earned: exercise.xp_reward });
        }
      } else {
        setFlashWrong(true);
        setTimeout(() => { setFlashWrong(false); setSelectedTerm(null); setSelectedDef(null); }, 500);
      }
    },
    [correctMap, matched, pairs.length, exercise, onComplete],
  );

  function handleTermClick(term: string) {
    if (matched.has(term) || completed) return;
    setSelectedTerm(term);
    if (selectedDef) tryMatch(term, selectedDef);
  }

  function handleDefClick(def: string) {
    if (completed) return;
    // Don't block definitions that still have unmatched terms pointing to them
    const termsForDef = pairs.filter((p) => p.definition === def).map((p) => p.term);
    const allTermsMatched = termsForDef.every((t) => matched.has(t));
    if (allTermsMatched) return;
    setSelectedDef(def);
    if (selectedTerm) tryMatch(selectedTerm, def);
  }

  const progress = pairs.length > 0 ? (matched.size / pairs.length) * 100 : 0;

  function getTermStyle(term: string): React.CSSProperties {
    const isMatched = matched.has(term);
    const isSelected = selectedTerm === term;
    const isWrongFlash = flashWrong && isSelected;

    const base: React.CSSProperties = {
      width: '100%', borderRadius: 14, border: '3px solid #1c1917', padding: '12px 14px',
      textAlign: 'left' as const, fontSize: 13, fontWeight: 600, transition: 'all 0.2s ease',
      minHeight: 48, cursor: isMatched || completed ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    };

    if (isMatched) return { ...base, background: '#2d7d6f', color: '#fff', boxShadow: '2px 2px 0px #1c1917' };
    if (isWrongFlash) return { ...base, background: '#c94040', color: '#fff', animation: 'shakeCard 0.3s ease' };
    if (isSelected) return { ...base, background: '#fff', borderColor: '#e07a3a', boxShadow: '4px 4px 0px #e07a3a', color: '#1c1917' };
    return { ...base, background: '#fff9f0', boxShadow: '2px 2px 0px #1c1917', color: '#1c1917' };
  }

  function isDefFullyMatched(def: string): boolean {
    const termsForDef = pairs.filter((p) => p.definition === def).map((p) => p.term);
    return termsForDef.every((t) => matched.has(t));
  }

  function getDefStyle(def: string): React.CSSProperties {
    const fullyMatched = isDefFullyMatched(def);
    const isSelected = selectedDef === def;
    const isWrongFlash = flashWrong && isSelected;

    const base: React.CSSProperties = {
      width: '100%', borderRadius: 14, border: '3px solid #1c1917', padding: '12px 14px',
      textAlign: 'left' as const, fontSize: 13, fontWeight: 500, transition: 'all 0.2s ease',
      minHeight: 48, cursor: fullyMatched || completed ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    };

    if (fullyMatched) return { ...base, background: '#2d7d6f', color: '#fff', boxShadow: '2px 2px 0px #1c1917' };
    if (isWrongFlash) return { ...base, background: '#c94040', color: '#fff', animation: 'shakeCard 0.3s ease' };
    if (isSelected) return { ...base, background: '#fff', borderColor: '#d4a373', boxShadow: '4px 4px 0px #d4a373', color: '#1c1917' };
    return { ...base, background: '#fff9f0', boxShadow: '2px 2px 0px #1c1917', color: '#1c1917' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 10, borderRadius: 20, background: '#f0ebe3', border: '2px solid #1c1917', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 20, background: '#2d7d6f', transition: 'width 0.5s ease-out', width: `${progress}%` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', fontVariantNumeric: 'tabular-nums' }}>
          {matched.size}/{pairs.length}
        </span>
      </div>

      {/* Two-column matching */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Terms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e07a3a', marginBottom: 2 }}>
            {t('matchingTerms')}
          </div>
          {shuffledTerms.map((term) => (
            <button key={term} type="button" disabled={matched.has(term) || completed}
              onClick={() => handleTermClick(term)} style={getTermStyle(term)}>
              {matched.has(term) && <Check style={{ width: 16, height: 16, flexShrink: 0 }} />}
              <span>{term}</span>
            </button>
          ))}
        </div>

        {/* Definitions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d4a373', marginBottom: 2 }}>
            {t('matchingDefinitions')}
          </div>
          {uniqueDefinitions.map((def) => (
            <button key={def} type="button" disabled={isDefFullyMatched(def) || completed}
              onClick={() => handleDefClick(def)} style={getDefStyle(def)}>
              {isDefFullyMatched(def) && <Link2 style={{ width: 16, height: 16, flexShrink: 0 }} />}
              <span>{def}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Celebration */}
      {completed && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          borderRadius: 16, border: '3px solid #2d7d6f', background: 'rgba(45,125,111,0.1)',
          padding: 20, animation: 'bounceIn 0.4s ease',
        }}>
          <Trophy style={{ width: 36, height: 36, color: '#d4a373', animation: 'bounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontWeight: 700, color: '#2d7d6f', fontSize: 16 }}>{t('allPairsMatched')}</p>
        </div>
      )}

      {completed && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {exercise.explanation}
        </div>
      )}

      <style>{`
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        @keyframes bounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
        @keyframes bounceFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
