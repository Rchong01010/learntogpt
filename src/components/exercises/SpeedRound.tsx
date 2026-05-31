'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Timer, Zap, Check, X, Trophy } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface SpeedRoundProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface SpeedQuestion { question: string; answer: boolean; }

const TOTAL_TIME = 60;

export function SpeedRound({ exercise, onComplete }: SpeedRoundProps) {
  const questions: SpeedQuestion[] = useMemo(() => {
    try { return JSON.parse(exercise.game_data ?? '[]'); }
    catch { return []; }
  }, [exercise.game_data]);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'correct' | 'wrong' | null>(null);
  const [shaking, setShaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const finishGame = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const finalScore = scoreRef.current;
    const perfect = finalScore === questions.length;
    onComplete({
      correct: finalScore >= Math.ceil(questions.length * 0.5),
      explanation: exercise.explanation,
      xp_earned: perfect ? exercise.xp_reward : questions.length > 0 ? Math.round(exercise.xp_reward * (finalScore / questions.length)) : 0,
    });
  }, [questions.length, exercise, onComplete]);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { finishGame(); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, finishGame]);

  function handleAnswer(answer: boolean) {
    if (finished || currentIndex >= questions.length) return;
    const isCorrect = questions[currentIndex].answer === answer;
    setLastAnswer(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => { const next = s + 1; setMaxStreak((m) => Math.max(m, next)); return next; });
    } else {
      setStreak(0);
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
    setTimeout(() => {
      setLastAnswer(null);
      if (currentIndex + 1 >= questions.length) finishGame();
      else setCurrentIndex((i) => i + 1);
    }, 250);
  }

  const progressPct = (timeLeft / TOTAL_TIME) * 100;

  // Pre-start screen
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c1917' }}>
            <Timer style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>{TOTAL_TIME}s | {questions.length} questions</span>
          </div>
          <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 300 }}>
            Answer True or False as fast as you can. Speed and accuracy both count!
          </p>
          <button type="button" onClick={() => { if (questions.length > 0) setStarted(true); }}
            disabled={questions.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 36px', borderRadius: 16, border: '3px solid #1c1917',
              background: '#e07a3a', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '4px 4px 0px #1c1917',
              transition: 'all 0.15s ease',
            }}>
            <Zap style={{ width: 18, height: 18 }} />
            Start Speed Round
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const timeBonus = Math.round(timeLeft * 0.5);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 500 }}>{exercise.prompt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', animation: 'bounceIn 0.4s ease' }}>
          <Trophy style={{ width: 48, height: 48, color: '#d4a373', animation: 'bounceFloat 1s ease infinite alternate' }} />
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>Speed Round Complete!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 340, textAlign: 'center' }}>
            {[
              { value: score, label: 'Correct', color: '#2d7d6f' },
              { value: `${pct}%`, label: 'Accuracy', color: '#e07a3a' },
              { value: maxStreak, label: 'Best Streak', color: '#d4a373' },
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

          {timeBonus > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 20, background: '#d4a373', border: '2px solid #1c1917',
              fontWeight: 700, fontSize: 13, color: '#1c1917',
            }}>
              <Zap style={{ width: 14, height: 14 }} />
              +{timeBonus} time bonus
            </div>
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

  const currentQ = questions[currentIndex];
  if (!currentQ) { finishGame(); return null; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Timer bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Timer style={{ width: 18, height: 18, color: timeLeft <= 10 ? '#c94040' : '#1c1917' }} />
            <span style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700, color: timeLeft <= 10 ? '#c94040' : '#1c1917' }}>
              {timeLeft}s
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {streak >= 3 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 20, background: '#e07a3a', border: '2px solid #1c1917',
                fontWeight: 700, fontSize: 12, color: '#fff',
              }}>
                <Zap style={{ width: 12, height: 12 }} />
                {streak} streak!
              </span>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#999' }}>
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Timer progress */}
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
          background: '#2d7d6f', color: '#fff', fontWeight: 800, fontSize: 20,
          boxShadow: '3px 3px 0px #1c1917',
        }}>
          {score}
        </span>
      </div>

      {/* Question card */}
      <div style={{
        borderRadius: 16, border: '3px solid #1c1917', padding: 24, textAlign: 'center',
        transition: 'all 0.2s ease',
        background: lastAnswer === 'correct' ? 'rgba(45,125,111,0.1)' : lastAnswer === 'wrong' ? 'rgba(201,64,64,0.1)' : '#fff9f0',
        borderColor: lastAnswer === 'correct' ? '#2d7d6f' : lastAnswer === 'wrong' ? '#c94040' : '#1c1917',
        boxShadow: '4px 4px 0px #1c1917',
        animation: shaking ? 'shakeCard 0.3s ease' : undefined,
      }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#1c1917', lineHeight: 1.5 }}>{currentQ.question}</p>
      </div>

      {/* True / False buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button type="button" onClick={() => handleAnswer(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 60, borderRadius: 14, border: '3px solid #1c1917',
            background: '#2d7d6f', color: '#fff', fontWeight: 700, fontSize: 18,
            cursor: 'pointer', boxShadow: '3px 3px 0px #1c1917', transition: 'all 0.1s ease',
          }}>
          <Check style={{ width: 22, height: 22 }} />
          True
        </button>
        <button type="button" onClick={() => handleAnswer(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 60, borderRadius: 14, border: '3px solid #1c1917',
            background: '#c94040', color: '#fff', fontWeight: 700, fontSize: 18,
            cursor: 'pointer', boxShadow: '3px 3px 0px #1c1917', transition: 'all 0.1s ease',
          }}>
          <X style={{ width: 22, height: 22 }} />
          False
        </button>
      </div>

      <style>{`
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
}
