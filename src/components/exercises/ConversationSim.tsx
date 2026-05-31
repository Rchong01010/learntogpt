'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, CheckCircle, XCircle, Trophy } from 'lucide-react';
import type { ClientExercise, ExerciseResult } from '@/types';

interface ConversationSimProps {
  exercise: ClientExercise;
  onComplete: (result: ExerciseResult) => void;
}

interface TurnOption {
  text: string;
  correct: boolean;
  response?: string;
  explanation?: string;
}

interface Turn {
  context: string;
  options: TurnOption[];
}

interface GameData {
  setup: string;
  turns: Turn[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'claude';
  text: string;
}

export function ConversationSim({ exercise, onComplete }: ConversationSimProps) {
  let gameData: GameData;
  try {
    gameData = JSON.parse(exercise.game_data ?? '{}');
  } catch {
    gameData = { setup: '', turns: [] };
  }
  const turns = gameData.turns ?? [];
  const totalTurns = turns.length;

  const [currentTurn, setCurrentTurn] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showOptions, setShowOptions] = useState(true);
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null);
  const [wrongExplanation, setWrongExplanation] = useState('');
  const [typing, setTyping] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);

  // Initialize with setup + first turn context. Run-once init — gameData/turns
  // are props captured at mount and do not change during the lifetime of this
  // component instance, so exhaustive-deps would force an infinite reset loop.
  useEffect(() => {
    const initial: ChatMessage[] = [];
    if (gameData.setup) {
      initial.push({ role: 'system', text: gameData.setup });
    }
    if (turns.length > 0) {
      initial.push({ role: 'claude', text: turns[0].context });
    }
    setMessages(initial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run-once init; see comment above

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing, showOptions]);

  const advanceToNextTurn = useCallback((nextTurn: number) => {
    if (nextTurn >= totalTurns) {
      // Finished all turns
      setFinished(true);
      const allCorrect = correctCount + 1 === totalTurns; // +1 for the current correct
      onComplete({
        correct: allCorrect,
        explanation: `You got ${correctCount + 1} out of ${totalTurns} decisions correct.`,
        xp_earned: allCorrect ? exercise.xp_reward : Math.floor(exercise.xp_reward * ((correctCount + 1) / totalTurns)),
      });
    } else {
      // Show next turn context with typing animation
      setTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'claude', text: turns[nextTurn].context }]);
        setTyping(false);
        setShowOptions(true);
        setSelectedWrong(null);
        setWrongExplanation('');
        setCurrentTurn(nextTurn);
      }, 1200);
    }
  }, [correctCount, totalTurns, turns, exercise.xp_reward, onComplete]);

  function handlePick(optionIdx: number) {
    const turn = turns[currentTurn];
    if (!turn) return;
    const option = turn.options[optionIdx];
    if (!option) return;

    if (option.correct) {
      // Correct pick
      setShowOptions(false);
      setSelectedWrong(null);
      setWrongExplanation('');
      setCorrectCount(prev => prev + 1);

      // Add user message
      setMessages(prev => [...prev, { role: 'user', text: option.text }]);

      // Show typing then response
      if (option.response) {
        setTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'claude', text: option.response! }]);
          setTyping(false);
          // Advance after a beat
          setTimeout(() => advanceToNextTurn(currentTurn + 1), 600);
        }, 1000);
      } else {
        setTimeout(() => advanceToNextTurn(currentTurn + 1), 400);
      }
    } else {
      // Wrong pick — shake and show explanation
      setShakeIdx(optionIdx);
      setTimeout(() => setShakeIdx(null), 500);
      setSelectedWrong(optionIdx);
      setWrongExplanation(option.explanation ?? 'That\'s not the best choice here.');
    }
  }

  const turn = currentTurn < totalTurns ? turns[currentTurn] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {turns.map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid #1c1917',
              background: i < currentTurn ? '#2d7d6f' : i === currentTurn && !finished ? '#e07a3a' : finished && i === currentTurn ? '#2d7d6f' : '#e5e0d8',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
        <span style={{ fontSize: 11, fontWeight: 700, color: '#78716c', marginLeft: 4 }}>
          {Math.min(currentTurn + 1, totalTurns)}/{totalTurns}
        </span>
      </div>

      {/* Chat container */}
      <div
        ref={chatRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: 420,
          overflowY: 'auto',
          padding: '12px 4px',
          scrollBehavior: 'smooth',
        }}
      >
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#78716c',
                  fontStyle: 'italic',
                  padding: '8px 16px',
                  lineHeight: 1.6,
                  animation: 'csFadeIn 0.3s ease',
                }}
              >
                {msg.text}
              </div>
            );
          }

          if (msg.role === 'user') {
            return (
              <div
                key={i}
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '80%',
                  animation: 'csSlideRight 0.3s ease',
                }}
              >
                <div style={{
                  background: '#e07a3a',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 4px 16px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontWeight: 500,
                  border: '2px solid #1c1917',
                  boxShadow: '2px 2px 0px #1c1917',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: '#78716c', textAlign: 'right', marginTop: 2, fontWeight: 600 }}>
                  You
                </div>
              </div>
            );
          }

          // ChatGPT message
          return (
            <div
              key={i}
              style={{
                alignSelf: 'flex-start',
                maxWidth: '80%',
                animation: 'csSlideLeft 0.3s ease',
              }}
            >
              <div style={{
                background: '#f0ebe3',
                color: '#1c1917',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                fontSize: 14,
                lineHeight: 1.6,
                fontWeight: 500,
                border: '2px solid #1c1917',
                boxShadow: '2px 2px 0px #1c1917',
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: '#78716c', marginTop: 2, fontWeight: 600 }}>
                ChatGPT
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div style={{
              background: '#f0ebe3',
              padding: '12px 18px',
              borderRadius: '16px 16px 16px 4px',
              border: '2px solid #1c1917',
              boxShadow: '2px 2px 0px #1c1917',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              <span className="cs-dot" style={{ animationDelay: '0ms' }} />
              <span className="cs-dot" style={{ animationDelay: '150ms' }} />
              <span className="cs-dot" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Option buttons */}
      {showOptions && turn && !finished && !typing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'csFadeIn 0.3s ease' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e07a3a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle style={{ width: 14, height: 14 }} />
            Pick the best response
          </div>
          {turn.options.map((option, i) => {
            const isWrong = selectedWrong === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handlePick(i)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: `3px solid ${isWrong ? '#c94040' : '#1c1917'}`,
                  background: isWrong ? '#fef2f2' : '#fff9f0',
                  color: '#1c1917',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  cursor: 'pointer',
                  boxShadow: isWrong ? '2px 2px 0px #c94040' : '3px 3px 0px #1c1917',
                  transition: 'all 0.15s ease',
                  animation: shakeIdx === i ? 'csShake 0.4s ease' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isWrong) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#e07a3a';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px #e07a3a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isWrong) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#1c1917';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0px #1c1917';
                  }
                }}
              >
                {option.text}
              </button>
            );
          })}

          {/* Wrong pick explanation */}
          {selectedWrong !== null && wrongExplanation && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              borderRadius: 12,
              background: '#fef2f2',
              border: '2px solid #c94040',
              padding: '10px 12px',
              fontSize: 13,
              color: '#991b1b',
              fontWeight: 500,
              lineHeight: 1.5,
              animation: 'csFadeIn 0.3s ease',
            }}>
              <XCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <span>{wrongExplanation} Try again!</span>
            </div>
          )}
        </div>
      )}

      {/* Completion summary */}
      {finished && (
        <div style={{
          borderRadius: 14,
          border: '3px solid #1c1917',
          background: correctCount >= totalTurns ? '#2d7d6f' : '#f0ebe3',
          padding: 20,
          animation: 'csBounceIn 0.4s ease',
          color: correctCount >= totalTurns ? '#fff' : '#1c1917',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {correctCount >= totalTurns ? (
              <Trophy style={{ width: 24, height: 24 }} />
            ) : (
              <CheckCircle style={{ width: 24, height: 24 }} />
            )}
            <span style={{ fontSize: 18, fontWeight: 800 }}>
              {correctCount >= totalTurns ? 'Perfect Conversation!' : 'Conversation Complete'}
            </span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
            You made the right call on {correctCount} out of {totalTurns} decision points.
            {correctCount >= totalTurns
              ? ' Every response was on point.'
              : ' Review the conversation to see where you could improve.'}
          </p>
        </div>
      )}

      <style>{`
        .cs-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #78716c;
          animation: csBounce 1.2s ease-in-out infinite;
        }
        @keyframes csBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes csShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px) rotate(-1deg); }
          30% { transform: translateX(6px) rotate(1deg); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
        }
        @keyframes csSlideLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes csSlideRight {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes csFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes csBounceIn {
          0% { transform: scale(0.95); opacity: 0; }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
