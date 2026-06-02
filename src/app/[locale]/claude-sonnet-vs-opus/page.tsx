import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Zap, Brain, Cpu, CheckCircle2, Minus, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-sonnet-vs-opus`;

  const title = "Claude Sonnet vs Opus: Complete Comparison Guide (2025)";
  const description =
    "Claude Sonnet vs Opus vs Haiku — which model should you use? Honest comparison of capability, speed, and context window to help you pick the right Claude model for each task.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Claude Sonnet vs Opus vs Haiku — Learn to GPT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-default.png`],
    },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, pathForLocale(loc)])
      ),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const modelCards = [
  {
    name: "Claude Haiku",
    tagline: "Fast. Cheap. High-volume.",
    icon: Zap,
    color: "bg-teal",
    strengths: [
      "Fastest response times in the Claude family",
      "Lowest input/output cost per token",
      "Ideal for classification, routing, and extraction tasks",
      "Customer-facing chatbots with high concurrency",
      "Summarization of large batches of documents",
      "Autocomplete and inline suggestion use cases",
    ],
    weaknesses: [
      "Less nuanced reasoning on complex problems",
      "Shorter, simpler responses by nature",
      "Not ideal for multi-step agentic tasks",
    ],
    sweetSpot: "When you need AI at scale and latency or cost is the constraint, not depth of reasoning.",
  },
  {
    name: "Claude Sonnet",
    tagline: "The daily driver. Balanced at every level.",
    icon: Brain,
    color: "bg-orange",
    strengths: [
      "Excellent at complex coding tasks and multi-file changes",
      "Strong reasoning and analysis — significantly better than Haiku",
      "Reliable at following long, detailed instructions",
      "Good for most content generation and writing tasks",
      "Competitive speed — meaningfully faster than Opus",
      "200K context window handles large codebases",
    ],
    weaknesses: [
      "Not as strong as Opus on the hardest open-ended reasoning",
      "Occasional gaps in nuance on the most ambiguous tasks",
    ],
    sweetSpot: "The default choice for almost everything. Use Sonnet unless you have a specific reason to go up or down.",
  },
  {
    name: "Claude Opus",
    tagline: "Maximum reasoning. Complex tasks.",
    icon: Cpu,
    color: "bg-[#6b5cff]",
    strengths: [
      "Best performance on complex, open-ended reasoning",
      "Strongest at multi-step planning and strategy",
      "Handles the most ambiguous, nuanced instructions reliably",
      "Deep document analysis and synthesis across 200K tokens",
      "Security audits, architecture reviews, legal analysis",
      "Content that requires strong voice and judgment",
    ],
    weaknesses: [
      "Significantly slower than Sonnet — perceivable latency",
      "Higher token cost — expensive for high-volume pipelines",
      "Overkill for most day-to-day tasks",
    ],
    sweetSpot: "When the task is hard enough that Sonnet's quality isn't sufficient and the stakes justify slower, more expensive processing.",
  },
];

const taskGuide = [
  { task: "Classify customer support tickets", model: "Haiku", reason: "Simple categorization, high volume, speed matters" },
  { task: "Write a product description", model: "Sonnet", reason: "Solid writing quality, no need for Opus" },
  { task: "Debug a complex multi-service bug", model: "Sonnet / Opus", reason: "Sonnet often sufficient; Opus for systemic architectural issues" },
  { task: "Draft an investor memo", model: "Opus", reason: "High-stakes, nuanced judgment, voice matters" },
  { task: "Extract structured data from 500 PDFs", model: "Haiku", reason: "Batch extraction — cost and speed over depth" },
  { task: "Security audit a production codebase", model: "Opus", reason: "Needs deep reasoning and won't miss subtle patterns" },
  { task: "Translate UI strings to 7 languages", model: "Haiku", reason: "Repetitive, parallel, low reasoning demand" },
  { task: "Refactor a 2,000-line module", model: "Sonnet", reason: "Multi-file code changes — Sonnet's wheelhouse" },
  { task: "Build a 6-month strategy plan", model: "Opus", reason: "Strategic depth and judgment across competing priorities" },
  { task: "Answer FAQ questions in a chatbot", model: "Haiku", reason: "Low latency, high frequency, simple responses" },
  { task: "Generate an agentic task plan", model: "Opus", reason: "Orchestrator tasks benefit from maximum reasoning quality" },
  { task: "Summarize a meeting transcript", model: "Sonnet", reason: "Balanced: quality summary without Opus overhead" },
];

export default async function ClaudeSonnetVsOpusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-sonnet-vs-opus`;

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: "Claude Sonnet vs Opus vs Haiku: When to Use Each Model",
                description:
                  "Honest comparison of Claude Sonnet, Opus, and Haiku — capability, speed, and ideal use cases for each model in the Claude family.",
                url: pathForLocale(locale),
                inLanguage: locale,
                author: {
                  "@type": "Organization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                publisher: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                image: `${baseUrl}/og-default.png`,
                dateModified: new Date().toISOString(),
                about: [
                  { "@type": "SoftwareApplication", name: "Claude Sonnet" },
                  { "@type": "SoftwareApplication", name: "Claude Opus" },
                  { "@type": "SoftwareApplication", name: "Claude Haiku" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Sonnet vs Opus", item: pathForLocale(locale) },
                ],
              },
            ],
          }),
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-[4px] border-ink bg-linen">
        <nav>
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
            <Link href="/" className="logo-serif text-[1.75rem] text-ink">
              <span className="text-gpt-green">Learn to</span> GPT
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/curriculum"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden"
              >
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                Log In
              </Link>
              <Link
                href="/courses/why-claude/meet-claude"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="px-6 pb-16 pt-[100px] text-center">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Brain className="size-4" />
              Claude Model Family · 2025
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Pick the Right Claude Model and Stop Overpaying
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Which model for which task — a practical guide.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Anthropic&apos;s Claude comes in three tiers — Haiku, Sonnet, and Opus — each making a different tradeoff between speed, capability, and cost. Picking the wrong model for a task either wastes money (Opus on a simple classification job) or produces underwhelming results (Haiku on a complex architecture decision). Here&apos;s how to get it right.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start Free Course <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                API Tutorial
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude Sonnet is the best general-purpose model for everyday tasks: writing, coding, analysis, and research. Claude Opus is the most capable model for complex reasoning, nuanced writing, and multi-step problem solving. Default to Sonnet; escalate to Opus when quality matters more than speed.
              </p>
            </div>
          </div>
        </section>

        {/* MENTAL MODEL */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                The mental model: start with Sonnet
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The most practical rule: <strong>default to Sonnet.</strong> It handles the vast majority of tasks well — coding, writing, analysis, summarization — at a speed and cost that works for most use cases. Go down to Haiku when you need to scale a high-frequency task cheaply. Go up to Opus when the task genuinely demands maximum reasoning and Sonnet&apos;s output isn&apos;t good enough.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                The mistake most developers make is defaulting to Opus for everything because it feels safer. In practice, Sonnet handles 80-90% of tasks at the same quality, and you pay significantly more for Opus when it isn&apos;t warranted.
              </p>
            </div>
          </div>
        </section>

        {/* MODEL CARDS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Model Deep Dives
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What each model is actually good at
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {modelCards.map(({ name, tagline, icon: Icon, color, strengths, weaknesses, sweetSpot }) => (
                <div
                  key={name}
                  className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]"
                >
                  <div className={`flex items-center gap-3 rounded-t-[15px] border-b-[3px] border-ink ${color} px-6 py-4`}>
                    <Icon className="size-5 text-white" />
                    <div>
                      <div className="font-extrabold text-white">{name}</div>
                      <div className="font-mono text-[0.75rem] text-white/80">{tagline}</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="mb-2 font-mono text-[0.72rem] font-bold uppercase tracking-widest text-text-secondary">Strengths</div>
                      <ul className="space-y-1.5">
                        {strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[0.88rem] leading-[1.5] text-text-secondary">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-orange" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <div className="mb-2 font-mono text-[0.72rem] font-bold uppercase tracking-widest text-text-secondary">Limitations</div>
                      <ul className="space-y-1.5">
                        {weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-[0.88rem] leading-[1.5] text-text-secondary">
                            <Minus className="mt-0.5 size-3.5 shrink-0 text-text-secondary" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[10px] border-[2px] border-ink/20 bg-linen px-4 py-3">
                      <div className="mb-1 font-mono text-[0.7rem] font-bold uppercase tracking-widest text-orange">Sweet spot</div>
                      <p className="text-[0.85rem] leading-[1.6] text-text-secondary">{sweetSpot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TASK-BY-TASK GUIDE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Quick Reference
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Model by task type
            </h2>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="grid grid-cols-[1fr_140px_1fr] border-b-[4px] border-ink bg-[#1c1917] px-6 py-3 max-sm:hidden">
                <div className="font-mono text-[0.78rem] font-bold uppercase tracking-widest text-white/60">Task</div>
                <div className="font-mono text-[0.78rem] font-bold uppercase tracking-widest text-orange">Model</div>
                <div className="font-mono text-[0.78rem] font-bold uppercase tracking-widest text-white/60">Why</div>
              </div>
              {taskGuide.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_140px_1fr] gap-3 px-6 py-4 max-sm:grid-cols-1 ${i < taskGuide.length - 1 ? "border-b-[2px] border-ink/15" : ""}`}
                >
                  <div className="font-medium text-ink max-sm:font-bold">{row.task}</div>
                  <div>
                    <span className={`inline-block rounded-full border-[2px] border-ink px-3 py-1 font-mono text-[0.75rem] font-bold ${row.model === "Opus" ? "bg-[#ede9ff] text-[#6b5cff]" : row.model === "Haiku" ? "bg-[#e0f7f5] text-teal" : "bg-[#ffecd2] text-orange"}`}>
                      {row.model}
                    </span>
                  </div>
                  <div className="text-[0.88rem] leading-[1.5] text-text-secondary max-sm:pl-0">{row.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENTIC ROUTING */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Model routing in agent systems
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                In multi-agent architectures, you often want different models at different levels. A common pattern: use <strong>Opus as the orchestrator</strong> (high reasoning, plans the full task), <strong>Sonnet for specialist subagents</strong> (executes subtasks, writes code, reads docs), and <strong>Haiku for lightweight operations</strong> (classify inputs, route tasks, extract structured data).
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                This tiered approach gives you Opus-quality planning without paying Opus rates for every low-complexity step in the pipeline. In production agent systems, cost optimization at the model selection layer often matters as much as the prompting itself.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: "Which Claude model should I use?", a: "Default to Claude Sonnet for most tasks. Escalate to Opus for complex reasoning, nuanced writing, strategic analysis, and tasks requiring deep thinking. Sonnet is faster and cheaper; Opus is more capable for hard problems." },
                { q: "Is Claude Opus worth the extra cost?", a: "Opus is worth it for tasks where accuracy and depth matter more than speed: complex debugging, architectural decisions, legal analysis, and creative writing that requires nuanced voice matching." },
                { q: "What is the difference between Sonnet and Haiku?", a: "Sonnet is the balanced, general-purpose model. Haiku is the fastest and cheapest model, best for simple tasks like classification, extraction, and formatting. Use Haiku for high-volume, low-complexity tasks." },
                { q: "Can I switch between Claude models mid-conversation?", a: "Yes. In Claude.ai you can change models between messages. In the API, you specify the model per request. A common pattern is starting with Sonnet for exploration, then switching to Opus for the final critical output." },
              ].map((item) => (
                <div key={item.q} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-teal" />
                    <h3 className="text-[1rem] font-bold text-ink">{item.q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Learn to use every Claude model well
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Track 4 covers model selection, API configuration, and agent routing end-to-end.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Courses <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                API Tutorial
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/learn", label: "Course Catalog", desc: "All tracks from beginner to architect" },
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Call any Claude model from code" },
                { href: "/claude-agents", label: "Claude Agents", desc: "Multi-model agent architectures" },
              ].map(({ href, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-[18px_20px] shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]"
                >
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">{label}</div>
                  <p className="text-[0.8rem] leading-[1.5] text-text-secondary">{desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-orange">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            © {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
