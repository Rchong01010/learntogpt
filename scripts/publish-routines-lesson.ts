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
  title: "Routines — When Claude Manages Claude Code",
  slug: "claude-code-routines",
  description:
    "Boris Cherny's CWC demo: Claude Code Routines run on Anthropic's cloud, on a schedule or trigger, with no server and no DevOps. Saved configurations of prompt + repos + connectors that turn the AI agent itself into a scheduled task. The unlock is using Claude to orchestrate Claude Code.",
  order_index: 1,
  xp_reward: 50,
  estimated_minutes: 4,
  content_json: {
    sections: [
      {
        type: "text",
        content:
          "<p><strong>Routines launched in research preview on April 14, 2026.</strong> Boris Cherny took the CWC stage today and demoed how he actually uses them — including the pattern most people will miss: <strong>using Claude Code to orchestrate Claude Code.</strong></p><p>Here's what a Routine actually is: a saved configuration of a <strong>prompt + one or more repos + your connectors</strong>. It runs on Anthropic's cloud infrastructure. Your laptop can be closed. There's no server to maintain. No cron syntax to memorize. No DevOps background required.</p><p>Available on all paid plans (Pro, Max, Team, Enterprise).</p>",
      },
      {
        type: "text",
        content:
          "<p>Three ways to trigger a Routine:</p><ul><li><strong>On a schedule</strong> — hourly, nightly, or weekly</li><li><strong>Via API call</strong> — every routine gets a per-routine HTTPS endpoint and bearer token</li><li><strong>On a GitHub event</strong> — a webhook fires the routine when a PR opens, an issue is filed, etc.</li></ul><p>The schedule trigger is the obvious unlock for solo builders. The API trigger is the one that matters for chaining. The GitHub trigger is what makes routines a CI replacement for the right kind of repo work.</p>",
      },
      {
        type: "text",
        content:
          "<p>Why this is different from \"a cron job that runs a script\":</p><p>A cron job runs deterministic code. A Routine runs <strong>Claude</strong>. That means the same routine handles cases its author never anticipated. A nightly routine to \"check for failed deploys and Slack the team\" doesn't break when the deploy log format changes. Claude reads the new format and adapts. The script you'd write to do the same job would silently fail and you'd find out three days later.</p><p>That generality is also the trap. A Routine that's allowed to do anything will, eventually, do something you didn't want. Scoping permissions and connectors per-routine is the discipline that makes them safe.</p>",
      },
      {
        type: "text",
        content:
          "<p>The pattern Boris demoed at CWC: <strong>Claude managing Claude Code.</strong></p><p>One routine fires (scheduled or via webhook). That routine's prompt is something like: \"Audit the last 24 hours of merged PRs in repo X, identify the ones that touched authentication code, and trigger the security-review routine on each one.\"</p><p>That parent routine then calls the security-review routine via its API endpoint, passing the relevant PR numbers. The security-review routine kicks off Claude Code sessions in parallel, each one analyzing one PR. Results post to Slack.</p><p>You scheduled one thing. Claude orchestrated three layers of Claude Code work behind it. You didn't write any of the glue.</p>",
      },
      {
        type: "text",
        content:
          "<p>One Routine to set up today:</p><p><strong>The Monday morning brief.</strong> Schedule it weekly. Prompt: \"Review the past week of commits, PRs, and issues across [repos]. Summarize what shipped, what's stuck, and what's the most important thing to attend to this week. Post to my Slack DM.\"</p><p>That's it. The first week it'll be rough. By week three it'll know your repos, your patterns, and your priorities well enough to read like a chief of staff brief. And you'll have done it by writing one paragraph and clicking save.</p>",
      },
      {
        type: "text",
        content:
          '<p><strong>Sources:</strong> <a href="https://claude.com/blog/introducing-routines-in-claude-code" target="_blank" rel="noopener">Introducing Routines in Claude Code</a> (April 14, 2026) — Anthropic. Docs at <a href="https://code.claude.com/docs/en/scheduled-tasks" target="_blank" rel="noopener">code.claude.com/docs/en/scheduled-tasks</a>.</p>',
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
    .select("id")
    .eq("course_id", COURSE_ID)
    .eq("slug", lesson.slug);
  if (existing && existing.length > 0) {
    console.error("Slug already exists. Aborting.");
    process.exit(1);
  }

  const { data: current, error: fetchErr } = await sb
    .from("lessons")
    .select("id, order_index")
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
      console.error("Shift failed:", updErr);
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
    .select("title, order_index")
    .eq("course_id", COURSE_ID)
    .order("order_index");
  console.log("\nFinal order:");
  console.table(final);
}

main();
