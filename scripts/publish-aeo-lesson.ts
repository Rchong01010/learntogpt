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

// Track 6: practitioner-setup course
// Find the course ID dynamically by slug + locale
const COURSE_SLUG = "practitioner-setup";
const LOCALE = "en";

const lesson = {
  title: "Make your site visible to AI search",
  slug: "ai-search-visibility",
  description:
    "Use Claude Code to audit and fix your website for Google AI search. Semantic HTML, structured data, meta tags, crawlability. Based on Google's official May 2026 guide.",
  order_index: 6,
  xp_reward: 75,
  estimated_minutes: 8,
  is_free: true,
  content_json: {
    sections: [
      {
        type: "text",
        content:
          "<p><strong>Google published their official guide to AI search optimization in May 2026.</strong> The punchline: it's still SEO. No special markup, no llms.txt files, no content chunking. But most sites still get the basics wrong.</p><p>This lesson teaches you how to use Claude Code to audit your own site against Google's actual checklist and fix what it finds.</p>",
      },
      {
        type: "text",
        content:
          "<p><strong>What Google says matters (direct from the guide):</strong></p><ul><li><strong>Content with a unique point of view</strong> that goes beyond what a generative AI model could produce on its own</li><li><strong>Semantic HTML</strong> with clear headings, proper page structure, and meaningful elements (header, main, nav, article, footer)</li><li><strong>Structured data</strong> (JSON-LD) that matches what's visible on the page</li><li><strong>Fast page experience</strong> across devices</li><li><strong>Internal linking</strong> that makes content findable without relying on search</li><li><strong>High-quality images and video</strong> with descriptive alt text</li><li><strong>Crawlable and indexable pages</strong> with proper robots.txt and sitemap</li></ul>",
      },
      {
        type: "text",
        content:
          "<p><strong>What Google says does NOT matter:</strong></p><ul><li>Creating llms.txt files or special AI markup</li><li>\"Chunking\" content into tiny pieces for AI systems</li><li>Rewriting content in unnatural language so AI can parse it</li><li>Chasing inauthentic mentions across the web</li><li>Creating separate pages for every keyword variation (this actually violates Google's spam policy)</li></ul><p>Google's exact quote: <em>\"From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.\"</em></p>",
      },
      {
        type: "exercise",
        exercise_id: "ex_aeo_01",
      },
      {
        type: "text",
        content:
          '<p><strong>The audit prompt.</strong> Open Claude Code in any web project and try this:</p><pre><code>Audit this site for AEO compliance based on Google\'s May 2026 guide.\nCheck:\n1. Semantic HTML (header, main, nav, article, section, footer)\n2. Structured data / JSON-LD (Organization, Article, Product, FAQ, BreadcrumbList)\n3. Meta tags and Open Graph (title, description, og:image, twitter:card)\n4. Robots.txt and sitemap\n5. Image alt text\n6. Internal linking between pages\n7. Heading hierarchy (h1 > h2 > h3, no skipping)\n8. Server-side rendering vs client-only content\n\nReport findings as a prioritized checklist with file paths.</code></pre><p>Claude Code will read every file that matters, check each item, and give you a punch list with exact file paths and line numbers. This is the kind of task where AI tools are genuinely faster than doing it by hand.</p>',
      },
      {
        type: "exercise",
        exercise_id: "ex_aeo_02",
      },
      {
        type: "text",
        content:
          "<p><strong>Common fixes Claude Code can make in one session:</strong></p><ul><li>Wrap <code>&lt;nav&gt;</code> in <code>&lt;header&gt;</code> elements</li><li>Change logo <code>&lt;h1&gt;</code> tags to <code>&lt;span&gt;</code> (prevents duplicate h1 on every page)</li><li>Add JSON-LD structured data scripts to layout files</li><li>Fix Open Graph meta tags (missing images, wrong type)</li><li>Remove dead links (href=\"#\" placeholders crawlers flag as broken)</li><li>Update stale llms.txt or robots.txt files</li><li>Add missing alt text to images</li></ul><p>After fixing, run the audit prompt again to confirm everything passes. Then deploy.</p>",
      },
      {
        type: "exercise",
        exercise_id: "ex_aeo_03",
      },
      {
        type: "text",
        content:
          "<p><strong>Structured data cheat sheet.</strong> The most common JSON-LD types and when to use them:</p><ul><li><strong>Organization</strong> — every site's root layout. Name, URL, logo, social links.</li><li><strong>WebSite</strong> — root layout. Name, URL, optional SearchAction.</li><li><strong>Article</strong> — blog posts, guides, any long-form content page.</li><li><strong>Product</strong> — product detail pages. Name, price, availability, reviews.</li><li><strong>FAQPage</strong> — any page with question-and-answer pairs.</li><li><strong>BreadcrumbList</strong> — any page with hierarchical navigation (Home > Category > Page).</li><li><strong>Course</strong> — educational content. Name, provider, difficulty, free/paid.</li></ul><p>Rule: structured data must match what's visible on the page. Inventing metadata that isn't shown to users creates trust problems, not SEO gains.</p>",
      },
      {
        type: "exercise",
        exercise_id: "ex_aeo_04",
      },
      {
        type: "summary",
        content:
          "<p>AI search optimization is SEO done well. Use Claude Code to audit semantic HTML, structured data, meta tags, crawlability, and internal linking. Fix what the audit finds. Deploy. The source document is free: Google's \"Optimizing for generative AI features on Google Search\" guide.</p>",
      },
    ],
  },
};

const exercises = [
  {
    id: "ex_aeo_01",
    order_index: 1,
    type: "multiple_choice",
    prompt:
      "Google published their AI search optimization guide in May 2026. According to Google, what is the single most important factor for appearing in AI search features?",
    options: [
      "Adding llms.txt files and special AI markup to your site.",
      "Creating content that people find unique, compelling, and useful.",
      "Chunking your content into small pieces so AI can parse it faster.",
      "Rewriting your content in a more structured, machine-readable format.",
    ],
    correct_answer: "1",
    explanation:
      "Google's guide explicitly says creating unique, compelling content will influence AI search presence more than any other factor. They specifically warn against llms.txt files, chunking, and rewriting content for machines.",
    xp_reward: 10,
  },
  {
    id: "ex_aeo_02",
    order_index: 2,
    type: "multiple_choice",
    prompt:
      "You want Claude Code to audit your Next.js site for AEO issues. What is the best way to frame the request?",
    options: [
      "\"Make my site AEO optimized.\"",
      "\"Check if my site will rank in AI search.\"",
      "\"Audit this site for AEO compliance. Check: semantic HTML, structured data, meta tags, robots.txt, image alt text, internal linking, heading hierarchy, SSR. Report findings as a prioritized checklist with file paths.\"",
      "\"Add JSON-LD to every page.\"",
    ],
    correct_answer: "2",
    explanation:
      "A specific, checklist-based prompt with named categories and a requested output format gives Claude Code clear scope and structure. Vague requests produce vague results. Narrow requests (like only adding JSON-LD) miss the bigger picture.",
    hints: [
      "Think about what makes a prompt actionable vs vague.",
    ],
    xp_reward: 10,
  },
  {
    id: "ex_aeo_03",
    order_index: 3,
    type: "multiple_choice",
    prompt:
      "Claude Code's audit finds that your site's header component renders the brand name as <h1> on every page. Your homepage also has its own <h1> for the main heading. What should you fix?",
    options: [
      "Remove the homepage h1 and keep the header h1.",
      "Change the header brand name from h1 to a span element.",
      "Keep both h1 tags. Multiple h1 tags are fine in HTML5.",
      "Add an aria-label to distinguish the two h1 elements.",
    ],
    correct_answer: "1",
    explanation:
      "Each page should have exactly one h1 representing its primary content. The brand name in the header is navigation, not the page's main topic. Changing it to a span (or p, or div) fixes the duplicate h1 without losing the visual styling. While HTML5 technically allows multiple h1 tags, search engines strongly prefer a single h1 per page.",
    hints: [
      "Think about what the h1 tag signals to search engines about a page's primary topic.",
    ],
    xp_reward: 10,
  },
  {
    id: "ex_aeo_04",
    order_index: 4,
    type: "multiple_choice",
    prompt:
      "You are adding JSON-LD structured data to an ecommerce product page. Your Product schema includes a price of $1,299 and \"In Stock\" availability. But the product is actually sold out and the price recently changed to $1,199. What is the risk?",
    options: [
      "No risk. Search engines only read the visible page content, not JSON-LD.",
      "Google may show the wrong price and availability in search results, and flag the mismatch as a trust issue.",
      "The JSON-LD will override the visible content automatically.",
      "This is fine as long as you update the JSON-LD within 30 days.",
    ],
    correct_answer: "1",
    explanation:
      "Structured data must match what is visible on the page. If your JSON-LD says a product costs $1,299 and is in stock, but the page shows $1,199 and sold out, Google may show incorrect rich results and flag it as a structured data quality issue. This is why structured data should be generated dynamically from the same data source as the visible content, not hardcoded.",
    hints: [
      "Google's guide emphasizes alignment between structured data and visible content.",
    ],
    xp_reward: 10,
  },
];

async function main() {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Find the course by slug + locale
  const { data: course, error: courseErr } = await sb
    .from("courses")
    .select("id, slug, title")
    .eq("slug", COURSE_SLUG)
    .eq("locale", LOCALE)
    .single();

  if (courseErr || !course) {
    console.error("Could not find course:", courseErr?.message || "not found");
    process.exit(1);
  }
  console.log(`Found course: ${course.title} (${course.id})`);

  // 2. Check slug doesn't already exist
  const { data: existing } = await sb
    .from("lessons")
    .select("id, slug")
    .eq("course_id", course.id)
    .eq("slug", lesson.slug);
  if (existing && existing.length > 0) {
    console.error(
      `Lesson with slug '${lesson.slug}' already exists. Aborting.`
    );
    process.exit(1);
  }

  // 3. Insert lesson (at the end, no shifting needed)
  const { data: inserted, error: insErr } = await sb
    .from("lessons")
    .insert({ ...lesson, course_id: course.id })
    .select("id, slug, order_index")
    .single();
  if (insErr) {
    console.error("Insert failed:", insErr);
    process.exit(1);
  }
  console.log(
    `\nInserted lesson: ${inserted.slug} at order_index ${inserted.order_index}`
  );
  console.log(`Lesson id: ${inserted.id}`);

  // 4. Insert exercises
  for (const ex of exercises) {
    const { error: exErr } = await sb.from("exercises").insert({
      ...ex,
      lesson_id: inserted.id,
    });
    if (exErr) {
      console.error("Exercise insert failed:", { id: ex.id, error: exErr });
    } else {
      console.log("  Exercise inserted:", { id: ex.id });
    }
  }

  // 5. Update lesson_count on the course
  const { data: allLessons } = await sb
    .from("lessons")
    .select("id")
    .eq("course_id", course.id);
  const newCount = allLessons?.length || 0;
  await sb
    .from("courses")
    .update({ lesson_count: newCount })
    .eq("id", course.id);
  console.log(`\nUpdated course lesson_count to ${newCount}`);

  // 6. Verify
  const { data: final } = await sb
    .from("lessons")
    .select("title, slug, order_index")
    .eq("course_id", course.id)
    .order("order_index");
  console.log("\nFinal lesson order:");
  console.table(final);
}

main();
