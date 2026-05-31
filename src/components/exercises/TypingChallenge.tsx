'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Timer, Trophy, Zap, Keyboard } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface TypingChallengeProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface GameData {
  text: string;
  par_time: number;
}

export function TypingChallenge({ exercise, onComplete }: TypingChallengeProps) {
  const gameData: GameData = useMemo(() => {
    try {
      return JSON.parse(exercise.game_data ?? '{"text":"Hello, world!","par_time":30}');
    } catch {
      return { text: 'Hello, world!', par_time: 30 };
    }
  }, [exercise.game_data]);

  const targetText = gameData.text;
  const parTime = gameData.par_time;

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progressPct = targetText.length > 0 ? (typed.length / targetText.length) * 100 : 0;

  // Timer: counts up
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished, startTime]);

  const finishGame = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalElapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    setElapsed(finalElapsed);

    // Accuracy: correct keystrokes / total keystrokes
    const correctKeystrokes = totalKeystrokes - errors;
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

    // XP: 100% accuracy = full XP, below 80% = half XP
    const xpEarned = accuracy >= 80
      ? Math.round(exercise.xp_reward * (accuracy / 100))
      : Math.round(exercise.xp_reward * 0.5);

    onComplete({
      correct: accuracy >= 80,
      explanation: exercise.explanation,
      xp_earned: xpEarned,
    });
  }, [startTime, targetText.length, totalKeystrokes, errors, exercise, onComplete]);

  function handleStart() {
    setStarted(true);
    setStartTime(Date.now());
    // Focus the container div for keyboard capture
    requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (finished) return;

    // Prevent default for all keys we handle
    if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Ignore modifier keys, function keys, etc.
    if (e.key.length !== 1 && e.key !== 'Enter') return;

    const inputChar = e.key === 'Enter' ? '\n' : e.key;
    const expectedChar = targetText[typed.length];

    setTotalKeystrokes((k) => k + 1);

    // Case-insensitive match for letters (typing exercise tests speed, not shift-key accuracy)
    const matches = inputChar.length === 1 && expectedChar
      ? inputChar.toLowerCase() === expectedChar.toLowerCase()
      : inputChar === expectedChar;

    if (matches) {
      const newTyped = typed + expectedChar;
      setTyped(newTyped);
      if (newTyped.length >= targetText.length) {
        finishGame();
      }
    } else {
      setErrors((prev) => prev + 1);
    }
  }

  function focusContainer() {
    if (started && !finished) {
      containerRef.current?.focus();
    }
  }

  // Compute per-character status
  const charStatuses: Array<'correct' | 'upcoming'> = targetText.split('').map((_, i) => {
    if (i < typed.length) return 'correct';
    return 'upcoming';
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Pre-start screen
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c1917' }}>
            <Keyboard style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              {targetText.length} characters | Par: {parTime}s
            </span>
          </div>

          {/* Full text to type */}
          <div style={{
            borderRadius: 14, border: '3px solid #1c1917', background: '#f0ebe3',
            padding: 16, maxWidth: 520, width: '100%',
          }}>
            <p style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#e07a3a', marginBottom: 8,
            }}>
              Type this:
            </p>
            <p style={{
              fontSize: 15, fontFamily: 'monospace', color: '#1c1917', lineHeight: 1.8,
              wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontWeight: 500,
            }}>
              {targetText}
            </p>
          </div>

          <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 300 }}>
            Type the text exactly as shown. Speed and accuracy both count!
          </p>
          <button type="button" onClick={handleStart}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 36px', borderRadius: 16, border: '3px solid #1c1917',
              background: '#e07a3a', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '4px 4px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}>
            <Keyboard style={{ width: 18, height: 18 }} />
            Start Typing
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const finalMinutes = elapsed / 60;
    const wpm = Math.round((targetText.length / 5) / Math.max(finalMinutes, 0.0167));
    const correctKeystrokes = totalKeystrokes - errors;
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
    const underPar = elapsed <= parTime;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', animation: 'bounceIn 0.4s ease' }}>
          <Trophy style={{ width: 48, height: 48, color: '#d4a373', animation: 'bounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>Challenge Complete!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 340, textAlign: 'center' }}>
            {[
              { value: `${wpm}`, label: 'WPM', color: '#2d7d6f' },
              { value: `${accuracy}%`, label: 'Accuracy', color: '#e07a3a' },
              { value: formatTime(elapsed), label: 'Time', color: '#d4a373' },
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

          {underPar && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 20, background: '#2d7d6f', border: '2px solid #1c1917',
              fontWeight: 700, fontSize: 13, color: '#fff',
            }}>
              <Zap style={{ width: 14, height: 14 }} />
              Under par! ({parTime}s target)
            </div>
          )}

          {errors > 0 && (
            <p style={{ fontSize: 13, color: '#999' }}>
              {errors} mistake{errors !== 1 ? 's' : ''} out of {totalKeystrokes} keystrokes
            </p>
          )}
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

  // Active typing screen
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={focusContainer}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, outline: 'none' }}
    >
      {/* Timer and progress header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Timer style={{ width: 18, height: 18, color: '#1c1917' }} />
            <span style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700, color: '#1c1917' }}>
              {formatTime(elapsed)}
            </span>
            {parTime > 0 && (
              <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
                / {formatTime(parTime)} par
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {errors > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, background: '#c94040', border: '2px solid #1c1917',
                fontWeight: 700, fontSize: 12, color: '#fff',
              }}>
                {errors} miss{errors !== 1 ? 'es' : ''}
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#999' }}>
              {typed.length}/{targetText.length}
            </span>
          </div>
        </div>

        {/* Progress bar with rocket */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: 10, borderRadius: 20, background: '#f0ebe3', border: '2px solid #1c1917', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 20, transition: 'width 0.15s ease',
              background: errors > 5 ? '#d4a373' : '#2d7d6f',
              width: `${progressPct}%`,
            }} />
          </div>
          {/* Rocket indicator */}
          <span style={{
            position: 'absolute', top: -10, transition: 'left 0.15s ease',
            left: `calc(${Math.min(progressPct, 97)}% - 10px)`,
            fontSize: 20, lineHeight: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}>
            {'\uD83D\uDE80'}
          </span>
        </div>
      </div>

      {/* Typing area: monospace box with highlighted characters */}
      <div
        style={{
          borderRadius: 16, border: '3px solid #1c1917', padding: 20,
          background: '#fff9f0', boxShadow: '4px 4px 0px #1c1917',
          fontFamily: 'monospace', fontSize: 18, lineHeight: 2,
          wordBreak: 'break-word', whiteSpace: 'pre-wrap',
          cursor: 'text', userSelect: 'none', minHeight: 80,
        }}
      >
        {targetText.split('').map((char, i) => {
          const status = charStatuses[i];
          const isCursor = i === typed.length;

          let color = '#d4cfc5'; // upcoming
          let bg = 'transparent';
          let borderBottom = 'none';

          if (status === 'correct') {
            color = '#2d7d6f';
          }

          if (isCursor) {
            bg = 'rgba(224, 122, 58, 0.15)';
            borderBottom = '2px solid #e07a3a';
          }

          return (
            <span
              key={i}
              style={{
                color,
                background: bg,
                borderBottom,
                transition: 'color 0.1s ease',
                borderRadius: isCursor ? 2 : 0,
                animation: isCursor ? 'cursorPulse 1s ease infinite' : undefined,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Click to focus hint */}
      <p style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
        Click here if typing stops working
      </p>

      <style>{`
        @keyframes cursorPulse {
          0%, 100% { background: rgba(224, 122, 58, 0.15); }
          50% { background: rgba(224, 122, 58, 0.35); }
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
