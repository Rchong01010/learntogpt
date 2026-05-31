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

const COURSE_ID = "c814a725-3c74-427b-aefb-49c5b8b22c59";

const lesson = {
  course_id: COURSE_ID,
  title: "Managed Agents — Dreaming, Outcomes, and Multi-Agent Orchestration",
  slug: "managed-agents-may-6-update",
  description:
    "May 6 CWC update: Anthropic added three new powers to Claude Managed Agents — dreaming (memory consolidation while idle), outcomes (you define success, the agent self-iterates), and multi-agent orchestration (a lead agent delegates to parallel sub-agents). The mental model for building with Claude just changed.",
  order_index: 1,
  xp_reward: 50,
  estimated_minutes: 4,
  content_json: {
    sections: [
      {
        type: "text",
        content:
          "<p><strong>Anthropic shipped a major update to Claude Managed Agents at Code with Claude on May 6, 2026.</strong></p><p>Three new capabilities, each shifting how you build with Claude:</p><ul><li><strong>Dreaming</strong> (research preview) — agents consolidate memory while idle, like REM sleep for AI</li><li><strong>Outcomes</strong> (public beta) — you define success, the agent self-evaluates and iterates until it meets your criteria</li><li><strong>Multi-agent orchestration</strong> (public beta) — a lead agent breaks down work and delegates to specialized sub-agents that run in parallel</li></ul><p>Even if you're not building on the API yet, the pattern that just got blessed at the keynote is the new mental model for getting real work out of Claude. Here's what each piece means.</p>",
      },
      {
        type: "text",
        content:
          "<p>First: <strong>Outcomes change how you prompt.</strong></p><p>The old pattern: write a prompt, hope the model does the right thing, manually check the output, retry if it's wrong. You were the evaluator and the iterator.</p><p>The new pattern: declare what success looks like upfront. The agent runs, checks its own work against your criteria, and iterates until it actually meets the bar. Anthropic's internal testing showed <strong>a 10-point lift on outcome task success vs. a standard prompt loop</strong>, with the biggest gains on the hardest problems.</p><p>For builders: you're shifting from <em>writing instructions</em> to <em>writing acceptance criteria.</em> Same skill stack, different output. Even in regular Claude Code, asking \"verify the build passes and the test suite is green before reporting back\" is a manual version of this — the Outcomes API just makes the loop reliable.</p>",
      },
      {
        type: "text",
        content:
          "<p>Second: <strong>Multi-agent orchestration is the parallelization story.</strong></p><p>Anthropic's setup: one lead agent receives the task, breaks it into subtasks, and assigns each to a specialized sub-agent. Each sub-agent runs in <strong>its own isolated context</strong>, so they don't pollute each other's reasoning. They work in parallel. The lead agent collects the results.</p><p>Critical detail: <strong>each agent can run a different model.</strong> A Haiku-fast routing agent. A Sonnet execution agent. An Opus reasoning agent for the hard piece. You compose the team based on what each step actually needs.</p><p>This is how Boris Cherny demoed it at the keynote with a payments-company workflow: agentic delegation across multiple Claude variants, each tuned to its slice of the job.</p>",
      },
      {
        type: "text",
        content:
          "<p>Third: <strong>Dreaming is the long-game memory feature.</strong></p><p>The problem with long-running agents has always been memory decay. Notes pile up. Old context drowns out current relevance. The agent gets dumber the longer it runs.</p><p>Dreaming is a scheduled background process that runs while the agent is idle. It reviews what's accumulated, strengthens what's still relevant, removes what's stale, and reorganizes the rest. Anthropic's framing: REM sleep for AI memory networks.</p><p>Status: research preview, request access. But the pattern is going to spread fast — Claude Code already shipped a version of this called Auto Dream. Expect every long-running agent system to need its own version.</p>",
      },
      {
        type: "text",
        content:
          "<p>What this means even if you don't touch the Managed Agents API:</p><p>The lesson from today's keynote is that <strong>agents that work in production share three traits</strong>:</p><ol><li>The human defines outcomes, not steps</li><li>Specialized work gets parallelized across the right model for each piece</li><li>Memory is actively maintained, not passively accumulated</li></ol><p>You can apply all three in regular Claude Code right now. State the goal up top. Let it spawn sub-agents (Claude Code already supports this). Tell it to consolidate context periodically. The Managed Agents API just makes these patterns first-class — but the pattern is the takeaway.</p>",
      },
      {
        type: "text",
        content:
          '<p><strong>Source:</strong> <a href="https://claude.com/blog/claude-managed-agents" target="_blank" rel="noopener">Claude Managed Agents</a> — Anthropic. Beta header: <code>managed-agents-2026-04-01</code>. Initial customers include Notion, Rakuten, Asana, Sentry, Atlassian.</p>',
      },
    ],
  },
};

async function main() {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await sb
    .from("lessons")
    .select("id, slug")
    .eq("course_id", COURSE_ID)
    .eq("slug", lesson.slug);
  if (existing && existing.length > 0) {
    console.error("Lesson with this slug already exists. Aborting.");
    process.exit(1);
  }

  const { data: current, error: fetchErr } = await sb
    .from("lessons")
    .select("id, slug, order_index")
    .eq("course_id", COURSE_ID)
    .order("order_index", { ascending: false });
  if (fetchErr) {
    console.error("Fetch failed:", fetchErr);
    process.exit(1);
  }
  console.log("Shifting %d lessons up by 1...", current?.length || 0);

  for (const row of current || []) {
    const { error: updErr } = await sb
      .from("lessons")
      .update({ order_index: row.order_index + 1 })
      .eq("id", row.id);
    if (updErr) {
      console.error("Shift failed for one row:", updErr);
      process.exit(1);
    }
  }

  const { data: inserted, error: insErr } = await sb
    .from("lessons")
    .insert(lesson)
    .select("id, slug, order_index")
    .single();
  if (insErr) {
    console.error("Insert failed:", insErr);
    process.exit(1);
  }
  console.log("Inserted at order_index %d, id %s", inserted.order_index, inserted.id);

  const { data: final } = await sb
    .from("lessons")
    .select("title, slug, order_index")
    .eq("course_id", COURSE_ID)
    .order("order_index");
  console.log("\nFinal order:");
  console.table(final);
}

main();
