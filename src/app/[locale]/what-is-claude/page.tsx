import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Brain, MessageSquare, Shield, Zap, BookOpen, Code, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/what-is-claude`;

  const title = "What is Claude AI? Best Beginner Guide (2025)";
  const description =
    "Claude is Anthropic's AI assistant — built for safety, nuance, and long-context reasoning. Learn what Claude is, how it works, and how it differs from ChatGPT and Gemini.";

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
          alt: "What is Claude AI — Learn to GPT",
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

const faqs = [
  {
    q: "Is Claude free to use?",
    a: "Claude.ai has a free tier with limited usage. Learn to GPT offers free interactive courses to learn how to use Claude effectively — no credit card required.",
  },
  {
    q: "Who made Claude?",
    a: "Claude is made by Anthropic, an AI safety company founded in 2021. Anthropic's research focuses on building AI systems that are safe, interpretable, and steerable.",
  },
  {
    q: "How is Claude different from ChatGPT?",
    a: "Claude has a 200K-token context window (compared to 128K for GPT-4o), was trained with Constitutional AI for more precise instruction-following, and excels at long-form writing and document analysis. ChatGPT has built-in image generation and web browsing.",
  },
  {
    q: "What is Claude's context window?",
    a: "Claude 3.5 Sonnet and Claude 3 Opus support a 200,000-token context window — roughly 150,000 words. This lets you paste entire codebases, books, or research papers for analysis.",
  },
  {
    q: "Can Claude write code?",
    a: "Yes. Claude excels at code generation, debugging, and explanation across Python, JavaScript, TypeScript, Go, Rust, and more. Claude Code is a dedicated agentic CLI for software development.",
  },
  {
    q: "What is Constitutional AI?",
    a: "Constitutional AI is Anthropic's training method that teaches Claude to evaluate its own outputs against a set of principles — making it more reliable, honest, and less prone to harmful outputs without excessive refusals.",
  },
];

const capabilities = [
  {
    icon: MessageSquare,
    title: "Long-form writing & editing",
    body: "Reports, essays, emails, scripts, and creative content. Claude adapts to your voice and maintains consistency across thousands of words.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Code,
    title: "Code generation & debugging",
    body: "Write, explain, and debug code in Python, JS, TS, Go, Rust, SQL, and more. Claude Code (the CLI) edits multi-file projects end-to-end.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Brain,
    title: "Research & document analysis",
    body: "Paste entire PDFs, papers, or codebases. Claude's 200K context window reads it all and synthesizes key findings with citations.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Zap,
    title: "Structured data & extraction",
    body: "Turn unstructured text into JSON, tables, or databases. Claude follows schemas reliably — great for data pipelines and automation.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Shield,
    title: "Safe, precise instruction-following",
    body: "Constitutional AI training makes Claude less likely to hallucinate or over-refuse. It follows complex multi-step instructions more reliably.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: BookOpen,
    title: "Multilingual communication",
    body: "Claude communicates fluently in 100+ languages. It can translate, localize, and adapt tone across cultures — not just convert words.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const models = [
  {
    name: "Claude 3.5 Sonnet",
    badge: "Recommended",
    badgeColor: "bg-teal",
    desc: "The best balance of intelligence and speed. Handles writing, code, and analysis at production scale. This is the model most developers use via API.",
  },
  {
    name: "Claude 3 Opus",
    badge: "Most Intelligent",
    badgeColor: "bg-[#6b5aed]",
    desc: "Anthropic's most capable model. Best for complex reasoning, nuanced strategy, and tasks where accuracy matters more than speed.",
  },
  {
    name: "Claude 3 Haiku",
    badge: "Fastest",
    badgeColor: "bg-orange",
    desc: "Lightweight and fast. Great for classification, summarization, simple extraction, and high-volume API use cases.",
  },
];

export default async function WhatIsClaudePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/what-is-claude`;

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
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.a,
                  },
                })),
              },
              {
                "@type": "Article",
                headline: "What is Claude AI? A Complete Beginner's Guide",
                description:
                  "Claude is Anthropic's AI assistant built for safety, nuance, and long-context reasoning. Learn what Claude is, how it works, and how it differs from other AI models.",
                url: pagePath,
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
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Learn to GPT",
                    item: baseUrl,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "What is Claude AI?",
                    item: pagePath,
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Nav */}
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
                {t("nav.curriculum")}
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/courses/why-claude/meet-claude"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pb-16 pt-[80px] text-center">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Beginner Guide
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              What is Claude AI? The AI That Reads More and Reasons Better
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              The AI built for safe, nuanced, and long-context reasoning
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude is Anthropic&apos;s AI assistant — a large language model trained with Constitutional AI to be helpful, harmless, and honest. It&apos;s used by millions of people for writing, coding, research, and automation, and by developers via the Claude API and ChatGPT Codex CLI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Learning Claude
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Free Courses
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude is an AI assistant built by Anthropic. It excels at writing, analysis, coding, and following complex instructions. Claude uses Constitutional AI training for safety and offers models ranging from fast (Haiku) to powerful (Opus), all accessible through claude.ai or the API.
              </p>
            </div>
          </div>
        </section>

        {/* What is Claude — explainer */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Basics
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How Claude works
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  A large language model trained by Anthropic
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude is a large language model (LLM) — a neural network trained on vast amounts of text to understand and generate human language. Unlike search engines, Claude doesn&apos;t look things up. It reasons from patterns learned during training. Anthropic, founded by former OpenAI researchers including Dario Amodei, built Claude with a primary focus on safety and alignment.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  Constitutional AI: how Claude learns to be safe
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Anthropic pioneered a training approach called Constitutional AI (CAI). Instead of relying solely on human feedback for every edge case, Claude is trained to evaluate its own responses against a set of principles — like &quot;be helpful&quot;, &quot;avoid harm&quot;, and &quot;be honest.&quot; This makes Claude more consistent, less prone to hallucination, and less likely to refuse reasonable requests out of over-caution.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  200K-token context — the biggest practical difference
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude&apos;s 200,000-token context window is one of its defining features. That&apos;s roughly 150,000 words — enough to paste an entire novel, a full codebase, or a hundred-page research report and have Claude reason across all of it in a single conversation. Most practical AI tasks hit this ceiling with other models. Claude rarely does.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Model lineup */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Model Family
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Which Claude model should you use?
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="relative rounded-[24px] border-[4px] border-ink bg-cream p-[32px_24px_24px] shadow-[4px_4px_0px_#1c1917]"
                >
                  <div className={`absolute -top-[14px] right-5 rounded-full border-[3px] border-ink ${model.badgeColor} px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]`}>
                    {model.badge}
                  </div>
                  <div className="mb-2 text-[1.1rem] font-bold text-ink">
                    {model.name}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                    {model.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              What Claude Can Do
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Six areas where Claude excels
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${cap.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <cap.icon className={`size-5 ${cap.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {cap.title}
                  </div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    {cap.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              FAQ
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Common questions about Claude
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-teal" />
                    <h3 className="text-[1rem] font-bold text-ink">{faq.q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Ready to start using Claude?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free interactive courses. No credit card. Start in 60 seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Free Lessons
              </Link>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-vs-chatgpt", label: "Claude vs ChatGPT", desc: "Honest feature-by-feature comparison" },
                { href: "/getting-started", label: "Getting Started", desc: "Your first steps with Claude" },
                { href: "/learn", label: "Free Courses", desc: "Interactive lessons from beginner to pro" },
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

      {/* Footer */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/claude-vs-chatgpt" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude vs ChatGPT</Link>
            <Link href="/getting-started" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Getting Started</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
