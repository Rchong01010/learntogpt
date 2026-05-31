'use client';

import { useState, useMemo } from 'react';
import { Bug, Search, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { checkExercise } from '@/lib/check-exercise';
import type { ClientExercise, ExerciseResult } from '@/types';

interface BugHuntProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

export function BugHunt({ exercise, onComplete }: BugHuntProps) {
  const lines = useMemo(() => exercise.prompt.split('\n'), [exercise.prompt]);

  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [buggyLines, setBuggyLines] = useState<Set<number>>(new Set());
  const [explanation, setExplanation] = useState('');

  function toggleLine(lineNum: number) {
    if (submitted) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(lineNum)) next.delete(lineNum);
      else next.add(lineNum);
      return next;
    });
  }

  async function handleSubmit() {
    setChecking(true);
    try {
      const result = await checkExercise(exercise.id, JSON.stringify([...flagged]));
      let serverBuggyLines: number[];
      try { serverBuggyLines = JSON.parse(result.correct_answer); }
      catch { serverBuggyLines = []; }
      const bugSet = new Set(serverBuggyLines);
      setBuggyLines(bugSet);
      setExplanation(result.explanation || exercise.explanation || '');
      setSubmitted(true);
      const correctFlags = [...flagged].filter((l) => bugSet.has(l)).length;
      const totalBugs = bugSet.size;
      const wrongFlags = flagged.size - correctFlags;
      const accuracy = totalBugs > 0 ? correctFlags / totalBugs : 0;
      const penalty = Math.min(wrongFlags * 0.1, 0.5);
      const finalScore = Math.max(0, accuracy - penalty);
      onComplete({
        correct: correctFlags === totalBugs && wrongFlags === 0,
        explanation: result.explanation,
        xp_earned: Math.round(exercise.xp_reward * finalScore),
      });
    } catch (err) {
      console.error('Exercise check failed:', err);
      alert('Failed to check answer. Please try again.');
    } finally { setChecking(false); }
  }

  function getLineStatus(lineNum: number) {
    if (!submitted) return null;
    const isBuggy = buggyLines.has(lineNum);
    const isFlagged = flagged.has(lineNum);
    if (isBuggy && isFlagged) return 'correct';
    if (isBuggy && !isFlagged) return 'missed';
    if (!isBuggy && isFlagged) return 'wrong';
    return null;
  }

  const foundCount = submitted ? [...flagged].filter((l) => buggyLines.has(l)).length : 0;
  const missedCount = submitted ? [...buggyLines].filter((l) => !flagged.has(l)).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#1c1917', lineHeight: 1.6, fontWeight: 600 }}>
        <Bug style={{ width: 22, height: 22, color: '#c94040', flexShrink: 0 }} />
        <span>Find the bugs! Click on lines you think contain issues.</span>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {[
          { icon: <Search style={{ width: 14, height: 14 }} />, label: `${flagged.size} flagged`, bg: '#f0ebe3', color: '#1c1917', show: true },
          { icon: <Check style={{ width: 14, height: 14 }} />, label: `${foundCount} found`, bg: '#2d7d6f', color: '#fff', show: submitted },
          { icon: <AlertTriangle style={{ width: 14, height: 14 }} />, label: `${missedCount} missed`, bg: '#d4a373', color: '#1c1917', show: submitted && missedCount > 0 },
        ].filter((b) => b.show).map(({ icon, label, bg, color }) => (
          <span key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 10, background: bg, color,
            fontWeight: 700, fontSize: 12, border: '2px solid #1c1917',
          }}>
            {icon} {label}
          </span>
        ))}
      </div>

      {/* Code block -- dark for code, but with Design F border */}
      <div style={{
        borderRadius: 14, border: '3px solid #1c1917', overflow: 'hidden',
        boxShadow: '4px 4px 0px #1c1917',
      }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#1c1917', borderBottom: '2px solid #333' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c94040' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d4a373' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2d7d6f' }} />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bug Hunt</span>
        </div>
        <div style={{ overflowX: 'auto', background: '#0a0a0a' }}>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isFlagged = flagged.has(lineNum);
            const status = getLineStatus(lineNum);

            let bg = 'transparent';
            let leftBorder = 'transparent';
            if (submitted) {
              if (status === 'correct') { bg = 'rgba(45,125,111,0.15)'; leftBorder = '#2d7d6f'; }
              else if (status === 'missed') { bg = 'rgba(212,163,115,0.2)'; leftBorder = '#d4a373'; }
              else if (status === 'wrong') { bg = 'rgba(201,64,64,0.15)'; leftBorder = '#c94040'; }
            } else if (isFlagged) {
              bg = 'rgba(201,64,64,0.15)';
              leftBorder = '#c94040';
            }

            return (
              <button
                key={i}
                type="button"
                disabled={submitted}
                onClick={() => toggleLine(lineNum)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s ease', minHeight: 30, background: bg,
                  borderLeft: `3px solid ${leftBorder}`,
                  cursor: submitted ? 'default' : 'pointer',
                  border: 'none', borderLeftStyle: 'solid', borderLeftWidth: 3, borderLeftColor: leftBorder,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 40, flexShrink: 0, padding: '0 8px', fontSize: 12, fontFamily: 'monospace', color: '#555', userSelect: 'none' }}>
                  {lineNum}
                </span>
                <span style={{ flex: 1, padding: '2px 12px', fontSize: 13, fontFamily: 'monospace', color: '#ddd', whiteSpace: 'pre' }}>
                  {line || '\u00A0'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', width: 32, flexShrink: 0 }}>
                  {!submitted && isFlagged && <Bug style={{ width: 14, height: 14, color: '#c94040' }} />}
                  {status === 'correct' && <Check style={{ width: 14, height: 14, color: '#2d7d6f' }} />}
                  {status === 'missed' && <AlertTriangle style={{ width: 14, height: 14, color: '#d4a373' }} />}
                  {status === 'wrong' && <X style={{ width: 14, height: 14, color: '#c94040' }} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {submitted && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#999' }}>
          {[
            { color: '#2d7d6f', label: 'Correctly identified' },
            { color: '#d4a373', label: 'Missed bug' },
            { color: '#c94040', label: 'False positive' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Submit */}
      {!submitted && (
        <button type="button" onClick={handleSubmit} disabled={flagged.size === 0 || checking}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 14, border: '3px solid #1c1917',
            background: flagged.size === 0 || checking ? '#e5e0d8' : '#c94040',
            color: flagged.size === 0 || checking ? '#999' : '#fff',
            fontWeight: 700, fontSize: 15,
            cursor: flagged.size === 0 || checking ? 'not-allowed' : 'pointer',
            boxShadow: flagged.size === 0 || checking ? 'none' : '3px 3px 0px #1c1917',
            transition: 'all 0.15s ease', alignSelf: 'flex-start',
          }}>
          {checking ? (
            <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Checking...</>
          ) : (
            <><Bug style={{ width: 18, height: 18 }} /> Submit Bug Report ({flagged.size} flagged)</>
          )}
        </button>
      )}

      {submitted && (
        <div style={{ borderRadius: 14, border: '2px solid #1c1917', background: '#f0ebe3', padding: 16, fontSize: 14, color: '#1c1917', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</p>
          {explanation}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
