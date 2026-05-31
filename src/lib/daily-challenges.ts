/**
 * 30 rotating daily micro-challenges for Learn to GPT.
 *
 * Each challenge is completable in ~5 minutes and encourages users to
 * actually USE ChatGPT rather than just study it. The active challenge is
 * deterministic — everyone sees the same one on the same calendar day.
 */

export interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  category: "try-it" | "explore" | "build" | "learn";
}

const challenges: DailyChallenge[] = [
  // ── try-it ────────────────────────────────────────────────
  {
    id: 1,
    title: "Explain Like I'm New",
    description:
      "Ask ChatGPT to explain one concept from your job in simple terms. See how clear it can get.",
    xpReward: 20,
    icon: "💡",
    category: "try-it",
  },
  {
    id: 2,
    title: "Regex Rescue",
    description:
      "Have ChatGPT write a regex for something you actually need — email validation, date parsing, whatever.",
    xpReward: 20,
    icon: "🔍",
    category: "try-it",
  },
  {
    id: 3,
    title: "Paragraph Polish",
    description:
      "Paste a paragraph you wrote and ask ChatGPT to review it. Try asking for a specific tone.",
    xpReward: 15,
    icon: "✏️",
    category: "try-it",
  },
  {
    id: 4,
    title: "Formula Fixer",
    description:
      "Give ChatGPT a messy spreadsheet formula and ask it to simplify or explain what it does.",
    xpReward: 20,
    icon: "📊",
    category: "try-it",
  },
  {
    id: 5,
    title: "Meal Planner",
    description:
      "Ask ChatGPT to create a meal plan for the week based on your dietary preferences.",
    xpReward: 15,
    icon: "🍽️",
    category: "try-it",
  },
  {
    id: 6,
    title: "Screenshot Reader",
    description:
      "Try giving ChatGPT a screenshot and asking it to explain what it sees. It handles images well.",
    xpReward: 25,
    icon: "📸",
    category: "try-it",
  },
  {
    id: 7,
    title: "Email Unblock",
    description:
      "Ask ChatGPT to write a professional email you have been putting off. Give it the context and tone.",
    xpReward: 20,
    icon: "📧",
    category: "try-it",
  },
  {
    id: 8,
    title: "Analogy Engine",
    description:
      "Have ChatGPT explain a technical concept using an analogy. The weirder the analogy, the better.",
    xpReward: 15,
    icon: "🎭",
    category: "try-it",
  },

  // ── explore ───────────────────────────────────────────────
  {
    id: 9,
    title: "Name Storm",
    description:
      "Ask ChatGPT to brainstorm 10 names for a project, product, or pet. Give it constraints to work with.",
    xpReward: 15,
    icon: "🌀",
    category: "explore",
  },
  {
    id: 10,
    title: "Pros and Cons",
    description:
      "Describe a decision you are weighing and ask ChatGPT to lay out the pros and cons of each option.",
    xpReward: 20,
    icon: "⚖️",
    category: "explore",
  },
  {
    id: 11,
    title: "Learn Something New",
    description:
      "Pick a topic you know nothing about and ask ChatGPT to give you a 2-minute overview.",
    xpReward: 15,
    icon: "🧠",
    category: "explore",
  },
  {
    id: 12,
    title: "Code Translator",
    description:
      "Give ChatGPT a snippet of code in one language and ask it to rewrite it in another.",
    xpReward: 25,
    icon: "🔄",
    category: "explore",
  },
  {
    id: 13,
    title: "Meeting Prep",
    description:
      "Tell ChatGPT about an upcoming meeting and ask it to generate 5 smart questions to bring.",
    xpReward: 20,
    icon: "📋",
    category: "explore",
  },
  {
    id: 14,
    title: "Tone Shift",
    description:
      "Write a casual message, then ask ChatGPT to rewrite it in a formal tone — and vice versa.",
    xpReward: 15,
    icon: "🎨",
    category: "explore",
  },
  {
    id: 15,
    title: "Debug Buddy",
    description:
      "Paste an error message you have seen recently and ask ChatGPT to explain what went wrong.",
    xpReward: 20,
    icon: "🐛",
    category: "explore",
  },
  {
    id: 16,
    title: "Summarize This",
    description:
      "Paste a long article, doc, or thread and ask ChatGPT to summarize the key points in 3 bullets.",
    xpReward: 15,
    icon: "📝",
    category: "explore",
  },

  // ── build ─────────────────────────────────────────────────
  {
    id: 17,
    title: "Template Builder",
    description:
      "Ask ChatGPT to create a reusable template — meeting notes, project brief, standup format, anything.",
    xpReward: 20,
    icon: "🏗️",
    category: "build",
  },
  {
    id: 18,
    title: "Automate a Task",
    description:
      "Describe a repetitive task and ask ChatGPT to write a script or workflow to automate it.",
    xpReward: 25,
    icon: "⚙️",
    category: "build",
  },
  {
    id: 19,
    title: "Data Cleanup",
    description:
      "Paste some messy data and ask ChatGPT to clean it up, reformat it, or convert it to a table.",
    xpReward: 20,
    icon: "🧹",
    category: "build",
  },
  {
    id: 20,
    title: "Checklist Maker",
    description:
      "Ask ChatGPT to build a checklist for something you need to do — travel packing, launch prep, onboarding.",
    xpReward: 15,
    icon: "✅",
    category: "build",
  },
  {
    id: 21,
    title: "Quick Prototype",
    description:
      "Describe a simple tool or page you want and ask ChatGPT to build a working prototype in HTML.",
    xpReward: 25,
    icon: "🚀",
    category: "build",
  },
  {
    id: 22,
    title: "Prompt Crafter",
    description:
      "Write a prompt for a task, then ask ChatGPT to improve it. Compare the outputs side by side.",
    xpReward: 20,
    icon: "🎯",
    category: "build",
  },
  {
    id: 23,
    title: "SOPs from Scratch",
    description:
      "Describe a process you do regularly and ask ChatGPT to turn it into a clean standard operating procedure.",
    xpReward: 20,
    icon: "📐",
    category: "build",
  },

  // ── learn ─────────────────────────────────────────────────
  {
    id: 24,
    title: "System Prompt Lab",
    description:
      "Try writing a system prompt that gives ChatGPT a specific personality or role. Test it out.",
    xpReward: 25,
    icon: "🧪",
    category: "learn",
  },
  {
    id: 25,
    title: "Token Awareness",
    description:
      "Ask ChatGPT how long your last message was in tokens. Start noticing what makes prompts longer or shorter.",
    xpReward: 15,
    icon: "📏",
    category: "learn",
  },
  {
    id: 26,
    title: "Follow-Up Chain",
    description:
      "Start a conversation and ask 3 follow-up questions, each building on the last answer.",
    xpReward: 20,
    icon: "🔗",
    category: "learn",
  },
  {
    id: 27,
    title: "Compare Models",
    description:
      "Ask the same question to Haiku and Sonnet. Notice the difference in depth, speed, and style.",
    xpReward: 20,
    icon: "🔬",
    category: "learn",
  },
  {
    id: 28,
    title: "Constraint Challenge",
    description:
      "Ask ChatGPT to do something with a strict constraint — under 50 words, no jargon, as a haiku.",
    xpReward: 15,
    icon: "🎲",
    category: "learn",
  },
  {
    id: 29,
    title: "Feedback Loop",
    description:
      'Ask ChatGPT for an answer, then say "make it better" with specific feedback. See how it adapts.',
    xpReward: 20,
    icon: "🔁",
    category: "learn",
  },
  {
    id: 30,
    title: "Teach ChatGPT Something",
    description:
      "Try teaching ChatGPT a concept from your field. See if it can use your explanation in a follow-up.",
    xpReward: 20,
    icon: "🎓",
    category: "learn",
  },
];

/**
 * Returns the challenge for today. Deterministic — everyone gets the same
 * challenge on the same calendar day (UTC).
 */
export function getTodayChallenge(): DailyChallenge {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % challenges.length;
  return challenges[dayIndex];
}

/**
 * Returns all 30 challenges (useful for previews or admin views).
 */
export function getDailyChallenges(): DailyChallenge[] {
  return challenges;
}
