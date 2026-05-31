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

const LESSON_ID = "3070cff0-9fab-422a-b85c-da1c810fcfb1";

const exercises = [
  {
    order_index: 1,
    type: "multiple_choice",
    prompt:
      "Google published their AI search optimization guide in May 2026. According to Google, what is the single most important factor for appearing in AI search features?",
    options_json: [
      "Adding llms.txt files and special AI markup to your site.",
      "Creating content that people find unique, compelling, and useful.",
      "Chunking your content into small pieces so AI can parse it faster.",
      "Rewriting your content in a more structured, machine-readable format.",
    ],
    correct_answer: "1",
    explanation:
      "Google's guide explicitly says creating unique, compelling content will influence AI search presence more than any other factor. They specifically warn against llms.txt files, chunking, and rewriting content for machines.",
    hints_json: [],
    xp_reward: 10,
  },
  {
    order_index: 2,
    type: "multiple_choice",
    prompt:
      "You want Claude Code to audit your Next.js site for AEO issues. What is the best way to frame the request?",
    options_json: [
      '"Make my site AEO optimized."',
      '"Check if my site will rank in AI search."',
      '"Audit this site for AEO compliance. Check: semantic HTML, structured data, meta tags, robots.txt, image alt text, internal linking, heading hierarchy, SSR. Report findings as a prioritized checklist with file paths."',
      '"Add JSON-LD to every page."',
    ],
    correct_answer: "2",
    explanation:
      "A specific, checklist-based prompt with named categories and a requested output format gives Claude Code clear scope and structure. Vague requests produce vague results. Narrow requests (like only adding JSON-LD) miss the bigger picture.",
    hints_json: [],
    xp_reward: 10,
  },
  {
    order_index: 3,
    type: "multiple_choice",
    prompt:
      "Claude Code's audit finds that your site's header component renders the brand name as <h1> on every page. Your homepage also has its own <h1> for the main heading. What should you fix?",
    options_json: [
      "Remove the homepage h1 and keep the header h1.",
      "Change the header brand name from h1 to a span element.",
      "Keep both h1 tags. Multiple h1 tags are fine in HTML5.",
      "Add an aria-label to distinguish the two h1 elements.",
    ],
    correct_answer: "1",
    explanation:
      "Each page should have exactly one h1 representing its primary content. The brand name in the header is navigation, not the page's main topic. Changing it to a span fixes the duplicate h1 without losing the visual styling.",
    hints_json: [],
    xp_reward: 10,
  },
  {
    order_index: 4,
    type: "multiple_choice",
    prompt:
      'You are adding JSON-LD structured data to an ecommerce product page. Your Product schema includes a price of $1,299 and "In Stock" availability. But the product is actually sold out and the price recently changed to $1,199. What is the risk?',
    options_json: [
      "No risk. Search engines only read the visible page content, not JSON-LD.",
      "Google may show the wrong price and availability in search results, and flag the mismatch as a trust issue.",
      "The JSON-LD will override the visible content automatically.",
      "This is fine as long as you update the JSON-LD within 30 days.",
    ],
    correct_answer: "1",
    explanation:
      "Structured data must match what is visible on the page. If your JSON-LD says a product costs $1,299 and is in stock, but the page shows $1,199 and sold out, Google may show incorrect rich results and flag it as a structured data quality issue.",
    hints_json: [],
    xp_reward: 10,
  },
];

async function main() {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Insert exercises with correct column names
  for (const ex of exercises) {
    const { error: exErr } = await sb.from("exercises").insert({
      ...ex,
      lesson_id: LESSON_ID,
    });
    if (exErr) {
      console.error("Exercise insert failed:", { orderIndex: ex.order_index, error: exErr });
    } else {
      console.log("  Exercise inserted at order_index", ex.order_index);
    }
  }

  // Verify
  const { data: exes } = await sb
    .from("exercises")
    .select("id, type, order_index, prompt")
    .eq("lesson_id", LESSON_ID)
    .order("order_index");
  console.log("\nExercises for AEO lesson:", exes?.length || 0);
  if (exes) {
    for (const e of exes) {
      console.log("  ", e.order_index, e.prompt.slice(0, 60) + "...");
    }
  }
}

main();
