'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Timer, Crosshair, Trophy, Zap } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface WhackAMoleProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface GameData {
  correct: string[];
  wrong: string[];
  instruction: string;
}

interface MoleItem {
  id: number;
  text: string;
  isCorrect: boolean;
  cell: number;
  expiresAt: number;
  state: 'active' | 'tapped-correct' | 'tapped-wrong' | 'expired';
}

const TOTAL_TIME = 30;
const GRID_SIZE = 9;
const BASE_SHOW_DURATION = 2800;
const MIN_SHOW_DURATION = 1600;
const BASE_SPAWN_INTERVAL = 1200;
const MIN_SPAWN_INTERVAL = 500;

export function WhackAMole({ exercise, onComplete }: WhackAMoleProps) {
  const gameData: GameData = useMemo(() => {
    try {
      return JSON.parse(exercise.game_data ?? '{"correct":[],"wrong":[],"instruction":"Tap the correct items!"}');
    } catch {
      return { correct: [], wrong: [], instruction: 'Tap the correct items!' };
    }
  }, [exercise.game_data]);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [finished, setFinished] = useState(false);
  const [moles, setMoles] = useState<MoleItem[]>([]);
  const [shakingCell, setShakingCell] = useState<number | null>(null);
  const [bouncingCell, setBouncingCell] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleIdRef = useRef(0);
  const timeLeftRef = useRef(TOTAL_TIME);
  const finishedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { finishedRef.current = finished; }, [finished]);

  const allItems = useMemo(() => [
    ...gameData.correct.map((text) => ({ text, isCorrect: true })),
    ...gameData.wrong.map((text) => ({ text, isCorrect: false })),
  ], [gameData]);

  const finishGame = useCallback((finalCorrect: number, finalWrong: number) => {
    setFinished(true);
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearTimeout(spawnRef.current);
    if (cleanupRef.current) clearInterval(cleanupRef.current);

    const finalScore = finalCorrect - finalWrong;
    const maxPossible = gameData.correct.length + gameData.wrong.length;
    const passed = finalScore >= Math.ceil(maxPossible * 0.3);

    onComplete({
      correct: passed,
      explanation: exercise.explanation,
      xp_earned: passed
        ? Math.round(exercise.xp_reward * Math.min(1, finalScore / maxPossible))
        : 0,
    });
  }, [exercise, gameData, onComplete]);

  // Get spawn timing based on elapsed time
  const getSpawnInterval = useCallback(() => {
    const elapsed = TOTAL_TIME - timeLeftRef.current;
    const progress = elapsed / TOTAL_TIME;
    return BASE_SPAWN_INTERVAL - (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * progress;
  }, []);

  const getShowDuration = useCallback(() => {
    const elapsed = TOTAL_TIME - timeLeftRef.current;
    const progress = elapsed / TOTAL_TIME;
    return BASE_SHOW_DURATION - (BASE_SHOW_DURATION - MIN_SHOW_DURATION) * progress;
  }, []);

  // Spawn a mole in a random empty cell
  const spawnMole = useCallback(() => {
    if (finishedRef.current || allItems.length === 0) return;

    setMoles((prev) => {
      const occupiedCells = new Set(prev.filter((m) => m.state === 'active').map((m) => m.cell));
      const freeCells = Array.from({ length: GRID_SIZE }, (_, i) => i).filter((c) => !occupiedCells.has(c));
      if (freeCells.length === 0) return prev;

      const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
      const item = allItems[Math.floor(Math.random() * allItems.length)];
      const id = ++moleIdRef.current;

      return [...prev, {
        id,
        text: item.text,
        isCorrect: item.isCorrect,
        cell,
        expiresAt: Date.now() + getShowDuration(),
        state: 'active' as const,
      }];
    });

    // Schedule next spawn
    if (!finishedRef.current) {
      spawnRef.current = setTimeout(spawnMole, getSpawnInterval());
    }
  }, [allItems, getShowDuration, getSpawnInterval]);

  // Start the game
  const startGame = useCallback(() => {
    setStarted(true);

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Use functional refs to get final values
          setCorrectTaps((c) => {
            setWrongTaps((w) => {
              finishGame(c, w);
              return w;
            });
            return c;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup expired moles
    cleanupRef.current = setInterval(() => {
      if (finishedRef.current) return;
      const now = Date.now();
      setMoles((prev) => prev.filter((m) => {
        if (m.state === 'active' && now >= m.expiresAt) return false;
        if (m.state !== 'active' && now >= m.expiresAt + 400) return false;
        return true;
      }));
    }, 200);

    // Start spawning
    spawnMole();
  }, [spawnMole, finishGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearTimeout(spawnRef.current);
      if (cleanupRef.current) clearInterval(cleanupRef.current);
    };
  }, []);

  function handleTap(mole: MoleItem) {
    if (finished || mole.state !== 'active') return;

    setTotalTaps((t) => t + 1);

    if (mole.isCorrect) {
      setCorrectTaps((c) => c + 1);
      setScore((s) => s + 1);
      setBouncingCell(mole.cell);
      setTimeout(() => setBouncingCell(null), 400);
      setMoles((prev) => prev.map((m) =>
        m.id === mole.id ? { ...m, state: 'tapped-correct' as const } : m
      ));
    } else {
      setWrongTaps((w) => w + 1);
      setScore((s) => s - 1);
      setShakingCell(mole.cell);
      setTimeout(() => setShakingCell(null), 400);
      setMoles((prev) => prev.map((m) =>
        m.id === mole.id ? { ...m, state: 'tapped-wrong' as const } : m
      ));
    }
  }

  const progressPct = (timeLeft / TOTAL_TIME) * 100;

  // Pre-start screen
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, border: '3px solid #1c1917',
            background: '#e07a3a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '4px 4px 0px #1c1917',
          }}>
            <Crosshair style={{ width: 32, height: 32, color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c1917' }}>
            <Timer style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>{TOTAL_TIME}s | 3x3 Grid</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1c1917', textAlign: 'center', maxWidth: 320 }}>
            {gameData.instruction}
          </p>
          <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 300 }}>
            Items pop up in the grid. Tap correct ones for +1, avoid wrong ones or lose a point. They get faster!
          </p>
          <button type="button" onClick={startGame}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 36px', borderRadius: 16, border: '3px solid #1c1917',
              background: '#e07a3a', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '4px 4px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}>
            <Zap style={{ width: 18, height: 18 }} />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const accuracy = totalTaps > 0 ? Math.round((correctTaps / totalTaps) * 100) : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', animation: 'wamBounceIn 0.4s ease' }}>
          <Trophy style={{ width: 48, height: 48, color: '#d4a373', animation: 'wamBounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>Game Over!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 340, textAlign: 'center' }}>
            {[
              { value: score, label: 'Score', color: score >= 0 ? '#2d7d6f' : '#c94040' },
              { value: `${accuracy}%`, label: 'Accuracy', color: '#e07a3a' },
              { value: `${correctTaps}/${totalTaps}`, label: 'Correct', color: '#d4a373' },
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

          {wrongTaps === 0 && totalTaps > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 20, background: '#d4a373', border: '2px solid #1c1917',
              fontWeight: 700, fontSize: 13, color: '#1c1917',
            }}>
              <Zap style={{ width: 14, height: 14 }} />
              Perfect accuracy!
            </div>
          )}
        </div>

        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'wamFadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {exercise.explanation}
        </div>

        <style>{`
          @keyframes wamBounceIn { 0%{transform:scale(0.9)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
          @keyframes wamBounceFloat { 0%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
          @keyframes wamFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // Active game
  const molesByCell: Record<number, MoleItem> = {};
  for (const mole of moles) {
    if (mole.state === 'active' || mole.state === 'tapped-correct' || mole.state === 'tapped-wrong') {
      molesByCell[mole.cell] = mole;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Timer bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Timer style={{ width: 18, height: 18, color: timeLeft <= 10 ? '#c94040' : '#1c1917' }} />
            <span style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700, color: timeLeft <= 10 ? '#c94040' : '#1c1917' }}>
              {timeLeft}s
            </span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>
            {gameData.instruction}
          </span>
        </div>

        <div style={{ height: 10, borderRadius: 20, background: '#f0ebe3', border: '2px solid #1c1917', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 20, transition: 'width 1s linear',
            background: timeLeft <= 10 ? '#c94040' : timeLeft <= 20 ? '#d4a373' : '#2d7d6f',
            width: `${progressPct}%`,
          }} />
        </div>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 20px', borderRadius: 14, border: '3px solid #1c1917',
          background: score >= 0 ? '#2d7d6f' : '#c94040', color: '#fff', fontWeight: 800, fontSize: 20,
          boxShadow: '3px 3px 0px #1c1917', transition: 'background 0.2s ease',
          minWidth: 60,
        }}>
          {score}
        </span>
      </div>

      {/* 3x3 Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        maxWidth: 400, width: '100%', margin: '0 auto',
      }}>
        {Array.from({ length: GRID_SIZE }, (_, cellIndex) => {
          const mole = molesByCell[cellIndex];
          const isShaking = shakingCell === cellIndex;
          const isBouncing = bouncingCell === cellIndex;

          if (!mole || mole.state === 'expired') {
            // Empty hole
            return (
              <div key={cellIndex} style={{
                aspectRatio: '1', borderRadius: 16, border: '3px dashed #ccc',
                background: '#faf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }} />
            );
          }

          // Active or tapped mole
          const isTappedCorrect = mole.state === 'tapped-correct';
          const isTappedWrong = mole.state === 'tapped-wrong';

          let bgColor = '#fff9f0';
          let borderColor = '#1c1917';
          if (isTappedCorrect) { bgColor = 'rgba(45,125,111,0.2)'; borderColor = '#2d7d6f'; }
          else if (isTappedWrong) { bgColor = 'rgba(201,64,64,0.2)'; borderColor = '#c94040'; }
          else if (mole.isCorrect) { bgColor = '#f0faf7'; }
          else { bgColor = '#faf0f0'; }

          let animation = 'wamPopUp 0.2s ease';
          if (isShaking) animation = 'wamShake 0.4s ease';
          else if (isBouncing) animation = 'wamBounce 0.4s ease';
          else if (isTappedCorrect || isTappedWrong) animation = 'wamFadeOut 0.35s ease forwards';

          return (
            <button
              type="button"
              key={cellIndex}
              onClick={() => handleTap(mole)}
              disabled={mole.state !== 'active'}
              style={{
                aspectRatio: '1', borderRadius: 16, border: `3px solid ${borderColor}`,
                background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 8, cursor: mole.state === 'active' ? 'pointer' : 'default',
                boxShadow: mole.state === 'active' ? '3px 3px 0px #1c1917' : 'none',
                animation,
                transition: 'background 0.15s ease, border-color 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#1c1917', lineHeight: 1.3,
                textAlign: 'center', wordBreak: 'break-word',
                userSelect: 'none', WebkitUserSelect: 'none',
              }}>
                {mole.text}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes wamPopUp {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wamFadeOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.7); opacity: 0; }
        }
        @keyframes wamShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes wamBounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.2); }
          50% { transform: scale(0.9); }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
