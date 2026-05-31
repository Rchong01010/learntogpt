'use client';

import { useState } from 'react';
import { Zap, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { MultipleChoice } from './MultipleChoice';
import { FillBlank } from './FillBlank';
import { DragDrop } from './DragDrop';
import { CodeExercise } from './CodeExercise';
import { ScenarioExercise } from './ScenarioExercise';
import { MatchingPairs } from './MatchingPairs';
import { SpeedRound } from './SpeedRound';
import { BugHunt } from './BugHunt';
import { FlashCards } from './FlashCards';
import { WordScramble } from './WordScramble';
import { TypingChallenge } from './TypingChallenge';
import { WhackAMole } from './WhackAMole';
import { PromptBuilder } from './PromptBuilder';
import { ConversationSim } from './ConversationSim';
import { SpotTheDifference } from './SpotTheDifference';
import { PromptLab } from './PromptLab';
import { SpeedPrompt } from './SpeedPrompt';
import { ScenarioWalkthrough } from './ScenarioWalkthrough';
import type { ClientExercise, ExerciseResult } from '@/types';

interface ExerciseRendererProps {
  exercise: ClientExercise;
  index: number;
  onComplete: (result: ExerciseResult) => void;
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Pick the Right Answer',
  fill_blank: 'Fill in the Blank',
  drag_drop: 'Put It in Order',
  code_exercise: 'Code Challenge',
  scenario: 'Scenario Challenge',
  matching_pairs: 'Match the Pairs',
  speed_round: 'Speed Round',
  bug_hunt: 'Bug Hunt',
  flash_cards: 'Flash Cards',
  word_scramble: 'Word Scramble',
  typing_challenge: 'Typing Challenge',
  whack_a_mole: 'Whack-a-Mole',
  prompt_builder: 'Build a Prompt',
  conversation_sim: 'Conversation Sim',
  spot_the_difference: 'Spot the Difference',
  prompt_lab: 'Prompt Lab',
  speed_prompt: 'Speed Prompt',
  scenario_walkthrough: 'Scenario Walkthrough',
};

export function ExerciseRenderer({ exercise, index, onComplete }: ExerciseRendererProps) {
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [showXP, setShowXP] = useState(false);

  function handleComplete(r: ExerciseResult) {
    setResult(r);
    onComplete(r);
    if (r.correct && r.xp_earned > 0) {
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2000);
    }
  }

  function renderExercise() {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoice exercise={exercise} onComplete={handleComplete} />;
      case 'fill_blank':
        return <FillBlank exercise={exercise} onComplete={handleComplete} />;
      case 'drag_drop':
        return <DragDrop exercise={exercise} onComplete={handleComplete} />;
      case 'code_exercise':
        return <CodeExercise exercise={exercise} onComplete={handleComplete} />;
      case 'scenario':
        return <ScenarioExercise exercise={exercise} onComplete={handleComplete} />;
      case 'matching_pairs':
        return <MatchingPairs exercise={exercise} onComplete={handleComplete} />;
      case 'speed_round':
        return <SpeedRound exercise={exercise} onComplete={handleComplete} />;
      case 'bug_hunt':
        return <BugHunt exercise={exercise} onComplete={handleComplete} />;
      case 'flash_cards':
        return <FlashCards exercise={exercise} onComplete={handleComplete} />;
      case 'word_scramble':
        return <WordScramble exercise={exercise} onComplete={handleComplete} />;
      case 'typing_challenge':
        return <TypingChallenge exercise={exercise} onComplete={handleComplete} />;
      case 'whack_a_mole':
        return <WhackAMole exercise={exercise} onComplete={handleComplete} />;
      case 'prompt_builder':
        return <PromptBuilder exercise={exercise} onComplete={handleComplete} />;
      case 'conversation_sim':
        return <ConversationSim exercise={exercise} onComplete={handleComplete} />;
      case 'spot_the_difference':
        return <SpotTheDifference exercise={exercise} onComplete={handleComplete} />;
      case 'prompt_lab':
        return <PromptLab exercise={exercise} onComplete={handleComplete} />;
      case 'speed_prompt':
        return <SpeedPrompt exercise={exercise} onComplete={handleComplete} />;
      case 'scenario_walkthrough':
        return <ScenarioWalkthrough exercise={exercise} onComplete={handleComplete} />;
      default:
        return <p style={{ color: '#1c1917', fontSize: 14 }}>Unknown exercise type.</p>;
    }
  }

  return (
    <div
      style={{
        background: '#fff9f0',
        border: '3px solid #1c1917',
        borderRadius: 20,
        boxShadow: '4px 4px 0px #1c1917',
        overflow: 'hidden',
        position: 'relative',
        animation: result && !result.correct ? 'exerciseShake 0.4s ease-out' : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '3px solid #1c1917',
          background: '#f0ebe3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#e07a3a',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              border: '2px solid #1c1917',
            }}
          >
            {index + 1}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#e07a3a',
            }}
          >
            Challenge
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1c1917' }}>
            {TYPE_LABELS[exercise.type] ?? 'Exercise'}
          </span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            background: '#d4a373',
            color: '#1c1917',
            fontWeight: 700,
            fontSize: 13,
            border: '2px solid #1c1917',
          }}
        >
          <Zap style={{ width: 14, height: 14 }} />
          {exercise.xp_reward} XP
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        {renderExercise()}
      </div>

      {/* Result feedback banner */}
      {result && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            borderTop: '3px solid #1c1917',
            background: result.correct ? '#2d7d6f' : '#c94040',
            color: '#fff',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {result.correct ? (
            <>
              <CheckCircle style={{ width: 20, height: 20 }} />
              <span>Correct!</span>
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <Zap style={{ width: 14, height: 14 }} />
                +{result.xp_earned} XP
              </div>
            </>
          ) : (
            <>
              <XCircle style={{ width: 20, height: 20 }} />
              <span>Not quite. Review the explanation above.</span>
            </>
          )}
        </div>
      )}

      {/* Floating XP popup */}
      {showXP && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            animation: 'xpPopup 1.8s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          <Trophy style={{ width: 32, height: 32, color: '#d4a373' }} />
          <span style={{ fontSize: 28, fontWeight: 800, color: '#2d7d6f', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            +{result?.xp_earned} XP
          </span>
        </div>
      )}

      {/* Confetti burst on correct answer */}
      {result?.correct && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 40 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: 8,
                height: 8,
                borderRadius: i % 3 === 0 ? '50%' : 2,
                background: ['#e07a3a', '#2d7d6f', '#d4a373', '#4a8fca', '#7c5cbf', '#c94040'][i % 6],
                animation: `confettiBurst 0.8s ease-out ${i * 0.03}s forwards`,
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes xpPopup {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          30% { transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 1; transform: translate(-50%, -60%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80%) scale(0.8); }
        }
        @keyframes exerciseShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes confettiBurst {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--cx, 60px), var(--cy, -80px)) scale(0.3) rotate(720deg); }
        }
        div[style*="confettiBurst"]:nth-child(1) { --cx: -80px; --cy: -100px; }
        div[style*="confettiBurst"]:nth-child(2) { --cx: 70px; --cy: -90px; }
        div[style*="confettiBurst"]:nth-child(3) { --cx: -50px; --cy: -120px; }
        div[style*="confettiBurst"]:nth-child(4) { --cx: 90px; --cy: -70px; }
        div[style*="confettiBurst"]:nth-child(5) { --cx: -100px; --cy: -60px; }
        div[style*="confettiBurst"]:nth-child(6) { --cx: 40px; --cy: -130px; }
        div[style*="confettiBurst"]:nth-child(7) { --cx: -70px; --cy: -80px; }
        div[style*="confettiBurst"]:nth-child(8) { --cx: 110px; --cy: -50px; }
        div[style*="confettiBurst"]:nth-child(9) { --cx: -30px; --cy: -110px; }
        div[style*="confettiBurst"]:nth-child(10) { --cx: 60px; --cy: -100px; }
        div[style*="confettiBurst"]:nth-child(11) { --cx: -90px; --cy: -40px; }
        div[style*="confettiBurst"]:nth-child(12) { --cx: 80px; --cy: -120px; }
      `}</style>
    </div>
  );
}
