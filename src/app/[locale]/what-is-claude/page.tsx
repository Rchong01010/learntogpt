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

  const title = "What is Claude AI? How It Compares to ChatGPT & Gemini";
  const description =
    "A plain-English look at Claude, Anthropic's AI model, and where it sits in the wider AI landscape next to ChatGPT and Gemini. What it's good at, what it isn't, and when to reach for it instead of the others.";

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
    q: "Should I use Claude or ChatGPT?",
    a: "Use whichever fits the job. Most people who work with AI daily keep both open: ChatGPT for image generation, voice, and its huge plugin and app ecosystem; Claude when they want careful long-document reasoning or writing that holds a consistent voice. Neither is 'better' across the board. Our take at Learn to GPT is model-agnostic: learn the workflow once and it transfers to any of them.",
  },
  {
    q: "Who makes Claude, and how is that different from ChatGPT and Gemini?",
    a: "Claude comes from Anthropic, an AI company started in 2021 by former OpenAI researchers. ChatGPT is OpenAI's product; Gemini is Google's. All three are frontier large language models. The practical differences are in defaults and ecosystem, not some secret capability gap.",
  },
  {
    q: "Is Claude free?",
    a: "Claude.ai has a free tier with daily usage limits, the same shape as ChatGPT's and Gemini's free tiers. Paid plans lift the limits and add faster models. You can learn the fundamentals on the free tier of any of them.",
  },
  {
    q: "What is Claude actually good at compared to the others?",
    a: "Its long-context reasoning and its writing tend to be where people reach for it: pasting a long contract, a codebase, or a research report and asking questions across all of it. ChatGPT is often the default for multimodal work and quick everyday tasks; Gemini leans on Google Search and Workspace integration. Pick by task, not by loyalty.",
  },
  {
    q: "Do I have to learn Claude separately from ChatGPT?",
    a: "No. The core skills — writing clear prompts, giving context, iterating on output — are the same across every chat model. Learn them once on any tool and you can switch between Claude, ChatGPT, and Gemini without starting over.",
  },
  {
    q: "What is Constitutional AI?",
    a: "It's the training method Anthropic uses to shape Claude's behavior against a written set of principles rather than case-by-case human ratings alone. In practice it's why Claude tends to explain its reasoning and refuse less arbitrarily. It's a design choice, not a benchmark you can compare head-to-head with ChatGPT or Gemini.",
  },
];

const capabilities = [
  {
    icon: MessageSquare,
    title: "Where Claude tends to win: long writing",
    body: "Longer reports, essays, and edits that need to hold one voice across thousands of words. People who write for a living often prefer its drafts here. ChatGPT and Gemini write well too; this is a lean, not a law.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Brain,
    title: "Where Claude tends to win: long documents",
    body: "Paste a full contract, a hundred-page report, or a codebase and ask questions across all of it. Its large context window makes this comfortable. Gemini also handles very long inputs; test both on your own files.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Zap,
    title: "Where ChatGPT usually wins: multimodal",
    body: "Image generation, voice mode, and the deepest app and plugin ecosystem live in ChatGPT today. If a task needs pictures or spoken conversation, that's usually the faster path.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: BookOpen,
    title: "Where Gemini usually wins: Google's stack",
    body: "If your work lives in Google Search, Docs, and Gmail, Gemini's built-in integration is hard to beat. Choose by where your data already sits, not by brand.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Code,
    title: "A near-tie: everyday coding help",
    body: "Writing, explaining, and debugging code is strong on all three. Claude, ChatGPT, and Gemini are close enough that most people pick by habit or by which one their team already pays for.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Shield,
    title: "Claude's design choice: fewer arbitrary refusals",
    body: "Anthropic trains Claude to reason against written principles, which is why it often explains its thinking and declines less randomly. It's a defaults difference, not a capability the others lack.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
];

const models = [
  {
    name: "Sonnet (the middle tier)",
    badge: "Everyday pick",
    badgeColor: "bg-teal",
    desc: "The balanced model most people land on: fast enough for daily use, capable enough for real work. Roughly the slot ChatGPT's default GPT model or Gemini Flash fill on the other platforms.",
  },
  {
    name: "Opus (the top tier)",
    badge: "Most capable",
    badgeColor: "bg-[#6b5aed]",
    desc: "Anthropic's heaviest model, for hard reasoning where you'll trade speed for depth. Comparable in intent to ChatGPT's top reasoning models and Gemini Pro.",
  },
  {
    name: "Haiku (the fast tier)",
    badge: "Fastest",
    badgeColor: "bg-orange",
    desc: "Small and quick, for simple, high-volume tasks like sorting or summarizing. Every major provider ships a tier like this — pick by cost and speed.",
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
                headline: "What is Claude AI? How It Compares to ChatGPT and Gemini",
                description:
                  "A model-agnostic look at Claude from Anthropic: where it sits in the AI landscape next to ChatGPT and Gemini, what it's genuinely good at, and when to pick it over the others.",
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
                href="/courses/why-chatgpt/meet-chatgpt"
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
              The AI Landscape
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              What is Claude AI, and where does it sit next to ChatGPT?
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              One of the three frontier chat models, explained without the hype
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude is the AI model built by Anthropic. Alongside OpenAI&apos;s ChatGPT and Google&apos;s Gemini, it&apos;s one of the three tools most people actually reach for. This is a straight read on what Claude is, what it&apos;s good and not good at, and when it&apos;s the right pick versus the other two.
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
                Claude is Anthropic&apos;s AI model — a direct alternative to ChatGPT and Gemini. It&apos;s known for careful writing and for handling very long documents in one go. Like the others, it ships in a fast tier, a balanced tier, and a top tier, and you use it through a chat site or an API. There&apos;s no single &quot;best&quot; model; there&apos;s the one that fits the task in front of you.
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
              How Claude fits in the AI landscape
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  Same category as ChatGPT and Gemini
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude is a large language model: a system trained on huge amounts of text to understand and generate language. So are ChatGPT and Gemini. None of the three &quot;looks things up&quot; the way a search engine does by default; they reason from patterns learned in training. Anthropic, the company behind Claude, was started by former OpenAI researchers and leans hard on safety and alignment as its differentiator.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  What actually differs is defaults, not magic
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  People ask which model is &quot;smartest.&quot; In real use the frontier models are close, and the gap shifts with every release. What you actually feel day to day is defaults: how each one writes, how it handles long inputs, whether it refuses, and what it plugs into. Claude&apos;s reputation is careful writing and long-document reasoning. ChatGPT&apos;s is breadth and multimodal features. Gemini&apos;s is Google integration.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">
                  Long context is where Claude earned its name
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude can take a very large amount of text at once — enough to paste a full codebase or a hundred-page report and ask questions across all of it. Gemini also handles very long inputs, and ChatGPT&apos;s limits have grown too, so this is less of a moat than it was a year ago. It&apos;s still a practical reason people reach for Claude on document-heavy work.
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
              Claude&apos;s tiers, and their ChatGPT/Gemini equivalents
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
              Claude vs The Field
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Where Claude wins, and where ChatGPT or Gemini do
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
              Claude vs ChatGPT vs Gemini: common questions
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
