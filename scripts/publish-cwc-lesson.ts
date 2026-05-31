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
  title: "Claude Code Limits Doubled — Plus a SpaceX Compute Deal",
  slug: "higher-limits-spacex-may-6",
  description:
    "May 6 launch: Claude Code 5-hour rate limits doubled for Pro / Max / Team / Enterprise, peak-hours penalty removed, and Anthropic just signed a SpaceX deal for 220,000 GPUs with orbital compute on the horizon.",
  order_index: 1,
  xp_reward: 40,
  estimated_minutes: 3,
  content_json: {
    sections: [
      {
        type: "text",
        content:
          "<p><strong>Anthropic shipped two things on May 6, 2026, and most people will only notice one of them.</strong></p><p>The headline most users will feel today: <strong>Claude Code 5-hour rate limits doubled</strong> for Pro, Max, Team, and Enterprise. The peak-hours penalty that used to throttle you between 1pm and 7pm PT is gone for Pro and Max. Claude Opus API rate limits also went up.</p><p>The headline most users will miss: <strong>Anthropic just bought 220,000 NVIDIA GPUs from SpaceX</strong>, with multi-gigawatt orbital compute on the roadmap.</p><p>Here's what each piece means for you.</p>",
      },
      {
        type: "text",
        content:
          "<p>First: the rate limit changes are <em>effective today</em>.</p><p>If you've been hitting the wall on long Claude Code sessions, the wall just moved. Your usual 5-hour window now buys you double the work. The peak-hours reduction (the thing that made afternoon sessions feel slower than morning ones) is removed for Pro and Max plans.</p><p>Translation: the deep-work block you've been saving for early morning because that's when limits felt generous? You can run it whenever you want now.</p>",
      },
      {
        type: "text",
        content:
          "<p>Second: <strong>Anthropic's compute story changed shape today.</strong></p><p>The SpaceX partnership puts <strong>more than 300 megawatts of new capacity (over 220,000 NVIDIA GPUs)</strong> online <em>within the month</em>. That's the supply side of why limits could double overnight without breaking the system.</p><p>The line buried in the announcement is the one worth reading twice: Anthropic signaled interest in <strong>\"multiple gigawatts of orbital AI compute capacity.\"</strong> AI compute. In low-earth orbit. SpaceX is the natural partner because they're the only company with the launch cadence to put that much hardware up there.</p>",
      },
      {
        type: "text",
        content:
          "<p>What this means if you're a builder:</p><p>The rate ceiling you've been planning around is no longer the same ceiling. Workflows that used to require splitting work across multiple sessions can collapse into one. Long agentic runs with Claude Code, the kind that used to bonk on hour 3, now have headroom.</p><p>Open Claude Code in your next deep-work block. Run something genuinely long: a multi-file refactor, a long agent loop, a research task that needs many tool calls. Notice you don't get throttled. That's the change.</p>",
      },
      {
        type: "text",
        content:
          '<p><strong>Source:</strong> <a href="https://www.anthropic.com/news/higher-limits-spacex" target="_blank" rel="noopener">Higher usage limits for Claude and a compute deal with SpaceX</a> — Anthropic, May 6, 2026.</p>',
      },
    ],
  },
};

async function main() {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Confirm slug doesn't already exist
  const { data: existing } = await sb
    .from("lessons")
    .select("id, slug")
    .eq("course_id", COURSE_ID)
    .eq("slug", lesson.slug);
  if (existing && existing.length > 0) {
    console.error(`Lesson with slug '${lesson.slug}' already exists. Aborting.`);
    process.exit(1);
  }

  // 2. Fetch existing lessons sorted DESC so we can shift them up safely
  const { data: current, error: fetchErr } = await sb
    .from("lessons")
    .select("id, slug, order_index")
    .eq("course_id", COURSE_ID)
    .order("order_index", { ascending: false });
  if (fetchErr) {
    console.error("Fetch failed:", fetchErr);
    process.exit(1);
  }
  console.log(`Shifting ${current?.length || 0} existing lessons up by 1...`);

  // 3. Shift existing lessons (DESC order avoids any transient overlap)
  for (const row of current || []) {
    const { error: updErr } = await sb
      .from("lessons")
      .update({ order_index: row.order_index + 1 })
      .eq("id", row.id);
    if (updErr) {
      console.error(`Failed to shift '${row.slug}':`, updErr);
      process.exit(1);
    }
    console.log("  %s: %d -> %d", row.slug, row.order_index, row.order_index + 1);
  }

  // 4. Insert new lesson at order_index 1
  const { data: inserted, error: insErr } = await sb
    .from("lessons")
    .insert(lesson)
    .select("id, slug, order_index")
    .single();
  if (insErr) {
    console.error("Insert failed:", insErr);
    process.exit(1);
  }
  console.log(`\nInserted: ${inserted.slug} at order_index ${inserted.order_index}`);
  console.log(`New lesson id: ${inserted.id}`);

  // 5. Verify final order
  const { data: final } = await sb
    .from("lessons")
    .select("title, slug, order_index")
    .eq("course_id", COURSE_ID)
    .order("order_index");
  console.log("\nFinal lesson order:");
  console.table(final);
}

main();
