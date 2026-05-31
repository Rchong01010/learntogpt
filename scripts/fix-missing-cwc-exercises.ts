import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
  .split("\n")
  .filter((l) => l.includes("="))
  .reduce((acc: Record<string, string>, line) => {
    const [k, ...v] = line.split("=");
    acc[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const EXERCISES: Array<{
  lesson_id: string;
  type: string;
  order_index: number;
  prompt: string;
  options_json: string[] | null;
  correct_answer: string;
  explanation: string;
  hints_json: string[];
  xp_reward: number;
  locale: string;
}> = [
  // ── higher-limits-spacex-may-6 ─────────────────────────────────────────
  {
    lesson_id: "950424f2-ac1d-47be-a81f-17809447b5a6",
    type: "multiple_choice",
    order_index: 1,
    prompt:
      "After the May 6 limit doubling, when is the best time to run a long Claude Code session?",
    options_json: [
      "Early morning only — limits always reset at midnight",
      "It doesn't matter anymore — the peak-hours penalty is removed for Pro and Max",
      "After 7pm PT to avoid the peak-hours throttle",
      "Weekends only when server load is lower",
    ],
    correct_answer: "1",
    explanation:
      "The May 6 update removed the peak-hours penalty for Pro and Max plans entirely. The 5-hour window now buys double the work, any time of day.",
    hints_json: [
      "The update explicitly addresses what changed about afternoon throttling.",
    ],
    xp_reward: 10,
    locale: "en",
  },
  {
    lesson_id: "950424f2-ac1d-47be-a81f-17809447b5a6",
    type: "multiple_choice",
    order_index: 2,
    prompt:
      "You have a multi-file refactor that historically hit the Claude Code rate limit after 3 hours. What's the right workflow change after the May 6 update?",
    options_json: [
      "Split the work across two separate conversations to stay safe",
      "Start a new conversation every hour as a precaution",
      "Run the full refactor in a single session — you now have double the headroom",
      "Wait for limits to increase further before attempting large refactors",
    ],
    correct_answer: "2",
    explanation:
      "The doubled 5-hour window is designed to let exactly this kind of previously-throttled deep-work session run to completion without splitting. Use it.",
    hints_json: [
      "What did the lesson say was now possible for workflows that used to require multiple sessions?",
    ],
    xp_reward: 15,
    locale: "en",
  },

  // ── managed-agents-may-6-update ────────────────────────────────────────
  {
    lesson_id: "3eef2340-cba1-495f-950a-36c129961fbc",
    type: "multiple_choice",
    order_index: 1,
    prompt:
      "The Outcomes feature in Managed Agents shifts what you write when prompting Claude. Which describes the shift correctly?",
    options_json: [
      "From writing outcomes to writing step-by-step instructions",
      "From writing step-by-step instructions to writing acceptance criteria",
      "From natural language to structured JSON schemas",
      "From single prompts to multi-turn conversation trees",
    ],
    correct_answer: "1",
    explanation:
      "With Outcomes, you declare what success looks like. The agent runs, checks its own output against your criteria, and iterates until it meets the bar. You're the acceptance criteria writer, not the instruction writer.",
    hints_json: [
      "The lesson describes the old pattern as 'write a prompt, hope the model does the right thing.' What replaced it?",
    ],
    xp_reward: 10,
    locale: "en",
  },
  {
    lesson_id: "3eef2340-cba1-495f-950a-36c129961fbc",
    type: "multiple_choice",
    order_index: 2,
    prompt:
      "In the Managed Agents multi-agent orchestration model, what is the role of the lead agent?",
    options_json: [
      "It runs all tasks sequentially to avoid context collisions",
      "It breaks down work into subtasks and delegates to parallel sub-agents, then collects results",
      "It monitors sub-agents and restarts any that fail",
      "It runs the most expensive model (Opus) while sub-agents run cheaper models",
    ],
    correct_answer: "1",
    explanation:
      "The lead agent receives the task, breaks it into subtasks, assigns each to a specialized sub-agent running in its own isolated context, and collects the results. Each sub-agent can run a different model tuned to its specific slice.",
    hints_json: [
      "Think about how the Boris Cherny payments-company demo was structured.",
    ],
    xp_reward: 10,
    locale: "en",
  },
  {
    lesson_id: "3eef2340-cba1-495f-950a-36c129961fbc",
    type: "multiple_choice",
    order_index: 3,
    prompt:
      "Which of the three new Managed Agents capabilities is specifically designed to solve memory decay in long-running agents?",
    options_json: [
      "Outcomes — it evaluates and resets memory at each iteration",
      "Multi-agent orchestration — isolated contexts prevent memory pollution",
      "Dreaming — a background process that consolidates and prunes memory while the agent is idle",
      "Context streaming — real-time memory compression across sessions",
    ],
    correct_answer: "2",
    explanation:
      "Dreaming runs as a scheduled background process while the agent is idle. It reviews accumulated context, strengthens what's relevant, removes what's stale, and reorganizes the rest — Anthropic's framing is 'REM sleep for AI memory networks.'",
    hints_json: [
      "Which capability did the lesson compare to human sleep for a reason?",
    ],
    xp_reward: 10,
    locale: "en",
  },

  // ── claude-code-routines ───────────────────────────────────────────────
  {
    lesson_id: "daccbd0e-4b03-421f-8503-05320763cfea",
    type: "multiple_choice",
    order_index: 1,
    prompt:
      "What is the key difference between a Claude Code Routine and a traditional cron job that runs a script?",
    options_json: [
      "Routines run faster because they use Anthropic's dedicated servers",
      "Routines are free; cron jobs cost money",
      "A cron job runs deterministic code; a Routine runs Claude, which adapts to unanticipated inputs without breaking",
      "Routines require no configuration; cron jobs require DevOps expertise",
    ],
    correct_answer: "2",
    explanation:
      "A script silently fails when the log format changes. Claude reads the new format and adapts. That generality — handling cases the author never anticipated — is what makes Routines fundamentally different from deterministic automation.",
    hints_json: [
      "The lesson gives a specific example about a deploy log format changing. What happened in that scenario?",
    ],
    xp_reward: 10,
    locale: "en",
  },
  {
    lesson_id: "daccbd0e-4b03-421f-8503-05320763cfea",
    type: "multiple_choice",
    order_index: 2,
    prompt:
      "Boris Cherny's CWC demo showed one Routine orchestrating multiple Claude Code sessions. What made this possible?",
    options_json: [
      "The parent routine used a special 'spawn' command built into Claude Code",
      "Each Routine has an HTTPS API endpoint, so a parent routine can trigger child routines via API calls",
      "Anthropic provisioned a dedicated multi-agent cluster for the demo",
      "The routines shared a single context window to pass information",
    ],
    correct_answer: "1",
    explanation:
      "Every Routine gets a per-routine HTTPS endpoint and bearer token. A parent routine can call child routines via those endpoints, passing parameters. That's how one scheduled routine orchestrated three layers of Claude Code work without any glue code.",
    hints_json: [
      "What are the three ways to trigger a Routine listed in the lesson?",
    ],
    xp_reward: 15,
    locale: "en",
  },
];

async function main() {
  console.log("Inserting exercises for 3 zero-exercise CWC lessons...");

  for (const ex of EXERCISES) {
    const { data, error } = await sb
      .from("exercises")
      .insert(ex)
      .select("id, lesson_id, order_index, type");

    if (error) {
      console.error(
        `FAILED: lesson ${ex.lesson_id} order ${ex.order_index}:`,
        error.message
      );
    } else {
      console.log(
        `  Inserted: lesson=${ex.lesson_id.slice(0, 8)} order=${ex.order_index} type=${ex.type}`
      );
    }
  }

  // Verify
  console.log("\nVerification:");
  const slugs = [
    "higher-limits-spacex-may-6",
    "managed-agents-may-6-update",
    "claude-code-routines",
  ];
  for (const slug of slugs) {
    const { data: lessons } = await sb
      .from("lessons")
      .select("id, title")
      .eq("slug", slug);
    if (!lessons?.length) {
      console.log(`  ${slug}: lesson not found`);
      continue;
    }
    const { count } = await sb
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", lessons[0].id);
    console.log(`  ${slug}: ${count} exercises`);
  }
}

main();
