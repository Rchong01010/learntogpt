// ============================================
// Learn to GPT — Core Types
// ============================================

export type ExerciseType =
  | "multiple_choice"
  | "fill_blank"
  | "drag_drop"
  | "code_exercise"
  | "scenario"
  | "matching_pairs"
  | "speed_round"
  | "bug_hunt"
  | "flash_cards"
  | "word_scramble"
  | "typing_challenge"
  | "whack_a_mole"
  | "prompt_builder"
  | "conversation_sim"
  | "spot_the_difference"
  | "prompt_lab"
  | "speed_prompt"
  | "scenario_walkthrough";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type Track =
  | "why_claude"
  | "three_levels"
  | "essentials"
  | "level_up"
  | "build_something"
  | "practitioner_setup"
  | "advanced_workflows";

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";
export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

// --- Content ---

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  track: Track;
  difficulty: Difficulty;
  order_index: number;
  is_free: boolean;
  icon: string;
  lesson_count: number;
  campaign_order: number | null;
  level_required: number;
  prerequisite_slug: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  is_free: boolean;
  content: LessonContent;
  created_at: string;
}

export interface LessonContent {
  sections: LessonSection[];
}

export type LessonSection =
  | { type: "text"; content: string }
  | { type: "exercise"; exercise_id: string }
  | { type: "summary"; content: string }
  | { type: "code_example"; language: string; code: string; caption?: string };

export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  order_index: number;
  prompt: string;
  options: string[] | null; // for multiple_choice, drag_drop
  correct_answer: string; // JSON string for complex answers
  explanation: string;
  hints: string[];
  xp_reward: number;
}

/**
 * Exercise data safe to send to the client (correct_answer stripped).
 * game_data carries rendering content for interactive types
 * (flash_cards, speed_round, matching_pairs) where the content IS the game.
 */
export interface ClientExercise extends Omit<Exercise, 'correct_answer'> {
  game_data?: string;
}

/** Response from POST /api/exercises/check */
export interface ExerciseCheckResponse {
  correct: boolean;
  correct_answer: string;
  explanation: string;
}

// --- User ---

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonStatus;
  score: number;
  xp_earned: number;
  completed_at: string | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

// --- Gamification ---

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
  xp_bonus: number;
}

export interface AchievementCriteria {
  type: "lessons_completed" | "streak_days" | "course_completed" | "perfect_score" | "total_xp" | "track_completed";
  threshold: number;
  track?: Track;
  course_id?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  current_streak: number;
}

// --- Missions ---

export type MissionStepType = 'learn' | 'build' | 'deploy' | 'checkpoint';

export interface Mission {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  project_type: string;
  project_brief: string;
  learning_outcomes: string[];
  estimated_hours: number;
  max_xp: number;
  is_free: boolean;
  cover_emoji: string;
  step_count: number;
}

export interface MissionStep {
  id: string;
  mission_id: string;
  step_number: number;
  title: string;
  description: string;
  step_type: MissionStepType;
  course_slug?: string;
  lesson_slug?: string;
  instructions?: { sections: LessonSection[] };
  xp_reward: number;
  estimated_minutes: number;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: 'started' | 'in_progress' | 'completed';
  current_step: number;
  progress_percent: number;
  project_data: Record<string, unknown>;
  xp_earned: number;
  started_at: string;
  completed_at?: string;
}

// --- Subscription ---

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_end: string;
  created_at: string;
}

// --- Exercise answer types ---

export interface ExerciseAnswer {
  exercise_id: string;
  answer: string;
}

export interface ExerciseResult {
  correct: boolean;
  explanation: string;
  xp_earned: number;
}

// --- Exercise attempt tracking (migration 014) ---

/** Per-(user, exercise) attempt row used to compute perfect-run XP. */
export interface UserExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  attempts: number;
  /** True iff the user's very first submission was correct. */
  first_correct: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Breakdown of the XP math for a single lesson completion.
 * Surfaced on the /api/progress response so the client can render
 * "Perfect! +50% XP" and "7-day streak! 2x" celebrations.
 */
export interface LessonXpBreakdown {
  /** Base XP before any bonuses — either lesson.xp_reward or scaledXp(minutes). */
  base_xp: number;
  /** True if every exercise in the lesson was answered correctly on first attempt. */
  perfect_run: boolean;
  /** The user's current_streak at award time. */
  current_streak: number;
  /** Multiplier applied for a 7+ day streak (1.0 or 2.0). */
  streak_multiplier: number;
  /** Multiplier applied for a perfect run (1.0 or 1.5). */
  perfect_multiplier: number;
  /** Final XP awarded (base_xp * perfect_multiplier * streak_multiplier, rounded). */
  final_xp: number;
  /** Which base-XP source was used. */
  xp_source: "db_xp_reward" | "scaled_minutes";
}

// --- Per-exercise event instrumentation (migration 017) ---

/**
 * Explicit exercise lifecycle event. Persisted to exercise_events so we can
 * compute per-exercise drop-off funnels (completed/started) and time-spent
 * distributions without a third-party analytics vendor.
 */
export type ExerciseEventType = "started" | "completed" | "abandoned";

/** Body accepted by POST /api/events/exercise. */
export interface ExerciseEventRequest {
  exercise_id: string;
  lesson_id: string;
  event_type: ExerciseEventType;
  time_spent_ms?: number;
}

/** Row shape for the exercise_events table (migration 017). */
export interface ExerciseEvent {
  id: string;
  user_id: string;
  exercise_id: string;
  lesson_id: string;
  event_type: ExerciseEventType;
  time_spent_ms: number | null;
  created_at: string;
}

// --- Social Sharing ---

export type ShareType = 'course_complete' | 'track_complete' | 'badge_unlock' | 'level_up' | 'streak_milestone';

export interface ShareCard {
  id: string;
  user_id: string;
  share_type: ShareType;
  reference_id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

// --- Level thresholds ---
export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
  6500, 8000, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000,
] as const;

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = getLevelFromXP(xp);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? current + 5000;
  const progress = ((xp - current) / (next - current)) * 100;
  return { current, next, progress };
}

// --- Track metadata ---
export const TRACK_INFO: Record<Track, { name: string; description: string; icon: string; color: string }> = {
  why_claude: {
    name: "Why ChatGPT?",
    description: "What makes ChatGPT different and why it matters",
    icon: "Sparkles",
    color: "text-blue-400",
  },
  three_levels: {
    name: "The Three Levels",
    description: "ChatGPT — three depths of the same intelligence",
    icon: "Layers",
    color: "text-green-400",
  },
  essentials: {
    name: "Master the Essentials",
    description: "Writing, documents, research — outcome-based mastery",
    icon: "Target",
    color: "text-purple-400",
  },
  level_up: {
    name: "Level Up",
    description: "Skills, integrations, and advanced workflows",
    icon: "Rocket",
    color: "text-orange-400",
  },
  build_something: {
    name: "Build Something",
    description: "Choose your path and build something real with ChatGPT",
    icon: "Hammer",
    color: "text-yellow-400",
  },
  practitioner_setup: {
    name: "The Practitioner Setup",
    description: "Configure your ChatGPT environment for professional workflows",
    icon: "Cog",
    color: "text-orange-400",
  },
  advanced_workflows: {
    name: "Advanced Workflows",
    description: "Slash commands, memory, agents, and hooks for power users",
    icon: "Terminal",
    color: "text-cyan-400",
  },
};
