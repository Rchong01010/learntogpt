import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, Brain, Layers, Lightbulb, Zap, MessageSquare, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/learn-ai`;

  const title = "Best Way to Learn AI — Free Interactive Courses";
  const description =
    "The best way to learn AI is to start with a specific tool and build real things. Learn to GPT teaches AI through ChatGPT — OpenAI's AI assistant — with interactive exercises, not theory lectures. No math or coding background required.";

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
          alt: "Learn AI with Learn to GPT",
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

const whyGPT = [
  {
    icon: MessageSquare,
    title: "AI you actually talk to",
    desc: "Unlike courses that teach AI theory from the outside, Learn to GPT has you working directly with ChatGPT from day one. Every lesson ends with a real exercise inside a live ChatGPT sandbox.",
  },
  {
    icon: Brain,
    title: "No math, no code prerequisites",
    desc: "The foundations track requires zero prior knowledge. You'll understand how large language models work — context, reasoning, attention, limitations — through practical experience, not equations.",
  },
  {
    icon: BookOpen,
    title: "Skills that transfer to everything",
    desc: "Knowing how to work with AI effectively is becoming as foundational as knowing how to search the web. Learn to GPT teaches durable, model-agnostic skills — not tricks that expire with the next update.",
  },
  {
    icon: Lightbulb,
    title: "Learn by doing, not watching",
    desc: "Every concept is paired with an interactive exercise. Write a prompt, see ChatGPT&apos;s response, understand why it worked or didn&apos;t, and iterate. Gamified XP and streaks keep momentum.",
  },
  {
    icon: Layers,
    title: "Progressive depth",
    desc: "Start with conversational basics. Progress to prompt engineering, then code, then APIs, then agent architecture. Each track builds on the last — no jarring gaps, no assumed knowledge.",
  },
  {
    icon: Zap,
    title: "Available in 7 languages",
    desc: "Learn to GPT is fully localized in English, Spanish, French, German, Japanese, Korean, and Chinese. AI skills are global — the platform meets you where you are.",
  },
];

const learningPaths = [
  {
    level: "Complete beginner",
    desc: "You've heard of ChatGPT but haven't used AI seriously. You want to understand what the fuss is about and start using AI tools effectively at work.",
    start: "Track 1: Foundations",
    time: "~3 hours",
    href: "/getting-started",
  },
  {
    level: "Occasional user",
    desc: "You use ChatGPT or other AI for simple tasks but feel like you're leaving capability on the table. Your prompts work sometimes, but you don't know why.",
    start: "Track 2: Prompt Engineering",
    time: "~5 hours",
    href: "/learn",
  },
  {
    level: "Professional",
    desc: "You use AI daily and want to go deeper — automating workflows, building with the API, or understanding multi-agent architectures for your team.",
    start: "Track 3–5: Code, API, Architect",
    time: "~15 hours",
    href: "/learn",
  },
  {
    level: "Developer",
    desc: "You can code and want to build real AI-powered applications — from CLI tools using ChatGPT API to production API integrations and autonomous agent systems.",
    start: "Track 6: Practitioner Setup → Tracks 3–5",
    time: "~20 hours",
    href: "/claude-for-developers",
  },
];

export default async function LearnAIPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/learn-ai`;

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
                "@type": "WebPage",
                name: "Learn AI: The Best Way to Start Learning Artificial Intelligence",
                description:
                  "Want to learn AI? Start with ChatGPT — the most practical, approachable entry point into artificial intelligence.",
                url: pathForLocale(locale),
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: "Learn AI with Learn to GPT",
                description:
                  "Comprehensive AI learning program from first prompt to agent architecture. Available in 7 languages. Interactive, gamified, no prerequisites.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Beginner to Expert",
                teaches: [
                  "Artificial Intelligence fundamentals",
                  "Prompt engineering",
                  "AI coding agents (Codex CLI, Claude Code)",
                  "OpenAI API",
                  "AI agent architecture",
                  "Multi-agent systems",
                ],
                inLanguage: locale,
                url: pathForLocale(locale),
                image: `${baseUrl}/og-default.png`,
                hasCourseInstance: [
                  { "@type": "CourseInstance", courseMode: "online" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Learn AI", item: pathForLocale(locale) },
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
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
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
              <BookOpen className="size-4" />
              7 Languages · 7 Tracks · Free to Start
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              The best way to learn AI starts here
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Not theory. Not videos. Real AI, real tasks, real skills.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              The majority of &ldquo;learn AI&rdquo; resources teach you about AI — how neural networks work mathematically, the history of machine learning, what transformers do in theory. Learn to GPT does something different: it puts you inside a live AI conversation from lesson one and builds your intuition from the inside out.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Browse All Courses <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start as a Beginner
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                The best way to learn AI is through structured, hands-on practice with a specific tool. Learn to GPT teaches ChatGPT through interactive exercises where you write real prompts and build real workflows. Claude Academy does the same for Claude. Start free, learn at your own pace.
              </p>
            </div>
          </div>
        </section>

        {/* WHY THIS APPROACH */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Why ChatGPT is the best AI to learn with
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                ChatGPT is unusually transparent about its reasoning. When you write a prompt that doesn&apos;t work, ChatGPT tends to tell you why — what it understood, what was ambiguous, what it needed. That feedback loop makes it a uniquely good learning tool, not just a task executor.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                ChatGPT also excels at long documents and nuanced tasks — summarizing a 50-page report, drafting a structured analysis, explaining a legal concept in plain terms. These are the kinds of AI tasks that have real workplace value, and they&apos;re what Learn to GPT trains you to do well.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                The skills you build here — context management, clear instruction writing, structured output, agentic workflows — transfer to any AI model you encounter. Learn to GPT is a ChatGPT course that makes you better at AI generally.
              </p>
            </div>
          </div>
        </section>

        {/* WHY CLAUDE ACADEMY */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Platform
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Why learners choose Learn to GPT
            </h2>
            <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-2 lg:grid-cols-3">
              {whyGPT.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                    <Icon className="size-5 text-orange" />
                  </div>
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">{title}</div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEARNING PATHS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Where to Start
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Find your learning path
            </h2>
            <div className="space-y-4">
              {learningPaths.map(({ level, desc, start, time, href }) => (
                <Link
                  key={level}
                  href={href}
                  className="block rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]"
                >
                  <div className="flex items-start justify-between gap-4 max-sm:flex-col">
                    <div className="flex-1">
                      <div className="mb-1 font-extrabold text-ink">{level}</div>
                      <p className="mb-3 text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</p>
                      <div className="font-mono text-[0.82rem] font-semibold text-orange">→ {start}</div>
                    </div>
                    <div className="shrink-0 rounded-full border-[2px] border-ink bg-linen px-3 py-1 font-mono text-[0.75rem] text-text-secondary">
                      {time}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT AI ACTUALLY IS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                What &ldquo;learning AI&rdquo; actually means in 2025
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                A few years ago, &ldquo;learn AI&rdquo; meant learning to train neural networks — Python, PyTorch, gradient descent. Today, that&apos;s still a valid path, but it&apos;s not the only one or even the most impactful one for most people.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The biggest AI leverage for most professionals, teams, and builders in 2025 is knowing how to <em>use</em> frontier AI models effectively. That means knowing how to write system prompts, how to structure multi-step tasks, how to connect models to tools, and how to evaluate output quality — not how to implement backpropagation.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Learn to GPT teaches the latter. It&apos;s a practical curriculum designed for people who want to get real leverage from AI in their work — whether that&apos;s drafting better documents, building internal tools, automating workflows, or shipping AI-powered products.
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
                { q: "What is the best way to learn AI in 2025?", a: "The best way to learn AI is through structured, hands-on practice with a specific tool. Learn to GPT teaches ChatGPT through interactive exercises. Claude Academy teaches Claude. Both start free." },
                { q: "How long does it take to learn AI?", a: "You can be productively using AI in 2-3 hours with Track 1. Reaching practitioner level (advanced prompting, API basics) takes 20-40 hours of focused practice." },
                { q: "Do I need a technical background to learn AI?", a: "No. Beginner tracks require zero technical background. You learn by writing prompts in plain language. Advanced tracks benefit from basic terminal familiarity but teach everything step by step." },
                { q: "Should I learn ChatGPT or Claude first?", a: "Both are excellent starting points. ChatGPT has the largest user base. Claude excels at instruction-following and coding. Skills transfer between them. Learn to GPT covers ChatGPT; Claude Academy covers Claude." },
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
              Start learning AI today — free
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              First two tracks are completely free. No credit card required.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Courses <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Getting Started Guide
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
                { href: "/learn", label: "Course Catalog", desc: "All 7 tracks, browse by level" },
                { href: "/getting-started", label: "Getting Started", desc: "Beginner guide, zero to first prompt" },
                { href: "/ai-for-beginners", label: "AI for Beginners", desc: "No prior knowledge needed" },
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
