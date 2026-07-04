import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, XCircle, Minus, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-vs-chatgpt`;

  const title = "Claude vs ChatGPT: An Even-Handed 2025 Comparison";
  const description =
    "Most people start on ChatGPT and wonder if Claude is worth adding. A neutral, task-by-task comparison of the two AI models — what each is genuinely better at, and how to decide which to open for a given job.";

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
          alt: "Claude vs ChatGPT — Learn to GPT",
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

const comparisons = [
  {
    category: "Everyday questions & drafts",
    claude: "Strong, clear answers",
    chatgpt: "Strong, and the one most people already have open",
    winner: "tie" as const,
  },
  {
    category: "Long-form writing",
    claude: "Often preferred — holds a voice, less repetitive over long pieces",
    chatgpt: "Very capable, occasionally more formulaic at length",
    winner: "claude" as const,
  },
  {
    category: "Very long documents",
    claude: "Large context window handles a full book or codebase in one go",
    chatgpt: "Context has grown a lot; fine for most real documents",
    winner: "claude" as const,
  },
  {
    category: "Image generation",
    claude: "Not built in — reads images but doesn't create them",
    chatgpt: "Built-in image generation",
    winner: "chatgpt" as const,
  },
  {
    category: "Voice conversation",
    claude: "Text-first",
    chatgpt: "Built-in voice mode",
    winner: "chatgpt" as const,
  },
  {
    category: "Web browsing & real-time info",
    claude: "Available with the right tools set up",
    chatgpt: "Browsing built in on paid plans",
    winner: "chatgpt" as const,
  },
  {
    category: "Apps, plugins & integrations",
    claude: "Growing, but smaller catalog",
    chatgpt: "The largest third-party ecosystem today",
    winner: "chatgpt" as const,
  },
  {
    category: "Refusals & instruction-following",
    claude: "Tends to explain itself and refuse less arbitrarily",
    chatgpt: "Good, occasionally more cautious on edge cases",
    winner: "claude" as const,
  },
];

const useCases = [
  {
    title: "Stay on ChatGPT for anything visual or spoken",
    body:
      "Image generation, voice conversations, and the deepest app ecosystem live in ChatGPT. If a task needs pictures, speech, or a specific integration, it's usually the faster route.",
    icon: "🖼️",
  },
  {
    title: "Reach for Claude on long, careful text",
    body:
      "Long documents, drafting that needs to hold a consistent voice, or reviewing a big contract or report in one pass. This is where people who already use ChatGPT tend to open Claude instead.",
    icon: "✍️",
  },
  {
    title: "Either one handles everyday work",
    body:
      "Summarizing email, drafting messages, explaining a concept, quick research — both models do this well. Use whichever you already have open; the difference here is small.",
    icon: "⚡",
  },
  {
    title: "The pros keep both",
    body:
      "Plenty of heavy users pay for both and switch by task rather than picking a side. The skill that matters is knowing which one fits the job, and that's exactly what Learn to GPT teaches.",
    icon: "🔀",
  },
];

export default async function ClaudeVsChatGPTPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-vs-chatgpt`;

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
                headline: "Claude vs ChatGPT: An Even-Handed Comparison for 2025",
                description:
                  "A neutral, task-by-task comparison of Claude and ChatGPT for people who already use one and want to know when the other is worth opening.",
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
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Is Claude better than ChatGPT?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Neither is better across the board. Claude tends to be preferred for long-form writing and long-document work; ChatGPT leads on image generation, voice, and its app ecosystem, and it's the tool most people already have open. Pick by the task in front of you rather than by brand.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do I need both Claude and ChatGPT?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Not to get started — one is plenty to learn the fundamentals. Many heavy users do keep both and switch by task: ChatGPT for visual and multimodal work, Claude for careful long-form text. The prompting skills transfer either way.",
                    },
                  },
                ],
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
                    name: "Claude vs ChatGPT",
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
              Honest AI Comparison
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude vs ChatGPT
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              You&apos;re probably on one already. Is the other worth it?
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[600px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Most people meet ChatGPT first and later wonder where Claude fits. We&apos;re model-agnostic here, so this is a straight, task-by-task read: what each one is genuinely better at, and how to decide which to open for the job in front of you.
            </p>
            <Link
              href="/courses/why-chatgpt/meet-chatgpt"
              className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              Try Learn to GPT Free
              <ArrowRight className="size-5" />
            </Link>
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              Free forever — no credit card required
            </p>
          </div>
        </section>

        {/* DIRECT ANSWER */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude (by Anthropic) and ChatGPT (by OpenAI) are both frontier AI models, and for everyday work they&apos;re close. The differences show up at the edges: Claude tends to be stronger on long-form writing and reading very long documents in one pass, while ChatGPT leads on built-in image generation, voice, and its large app ecosystem — and it&apos;s the one most people already have open. There is no single winner. The useful question is which one fits the task, not which brand to pledge to.
              </p>
            </div>
          </div>
        </section>

        {/* KEY DIFFERENCES DEEP DIVE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Deep Dive
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Where Each Model Wins
            </h2>
            <div className="space-y-6">
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Multimedia and ecosystem: ChatGPT&apos;s home turf</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  ChatGPT ships image generation, a voice mode, web browsing, and the largest catalog of third-party apps and plugins, all with no setup. For most people this is the reason it&apos;s the default. If your task involves pictures, spoken conversation, or a specific integration, ChatGPT is usually the shorter path. Claude can read images and, with the right tools connected, browse the web, but it doesn&apos;t generate images.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Long documents: where Claude pulls ahead</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  Claude&apos;s large context window lets you paste a full codebase, a long research paper, or a lengthy contract and ask questions across all of it in one conversation. ChatGPT&apos;s context has grown a lot and is fine for most real documents, but on the longest inputs Claude is still the more comfortable pick. Test both on your own files before deciding.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Writing: a real but subjective edge for Claude</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  A lot of people who write for a living prefer Claude&apos;s drafts: it tends to hold a consistent voice and stay less repetitive across a long piece. This is a lean, not a law, and it&apos;s partly taste. The honest move is to give both the same brief and keep whichever output you&apos;d actually send.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Everyday coding help: close enough to call a tie</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  For writing, explaining, and debugging code in a chat window, both are strong and the gap moves with each release. Most people pick by habit or by which one their team already pays for. Both companies also ship command-line coding tools for developers who want AI working directly in a terminal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Head to Head
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Feature by Feature
            </h2>

            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_80px] bg-ink px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-white max-md:grid-cols-[1fr_1fr] max-md:gap-2">
                <span>Category</span>
                <span className="max-md:hidden">Claude</span>
                <span className="max-md:hidden">ChatGPT</span>
                <span className="text-center">Winner</span>
              </div>

              {comparisons.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr_80px] items-start gap-4 px-6 py-5 max-md:grid-cols-1 ${
                    i % 2 === 0 ? "bg-cream" : "bg-linen"
                  } border-t-[2px] border-ink/20 first:border-t-0`}
                >
                  <div className="font-bold text-ink">{row.category}</div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary max-md:hidden">
                    <span className="mb-1 block text-[0.75rem] font-bold uppercase tracking-wide text-orange md:hidden">
                      Claude
                    </span>
                    {row.claude}
                  </div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary max-md:hidden">
                    <span className="mb-1 block text-[0.75rem] font-bold uppercase tracking-wide text-text-secondary md:hidden">
                      ChatGPT
                    </span>
                    {row.chatgpt}
                  </div>
                  <div className="flex justify-center">
                    {row.winner === "claude" && (
                      <CheckCircle2 className="size-6 text-teal" />
                    )}
                    {row.winner === "chatgpt" && (
                      <XCircle className="size-6 text-text-secondary" />
                    )}
                    {row.winner === "tie" && (
                      <Minus className="size-6 text-walnut" />
                    )}
                  </div>
                  {/* Mobile detail rows */}
                  <div className="space-y-1 text-[0.85rem] text-text-secondary md:hidden">
                    <div>
                      <span className="font-semibold text-orange">Claude: </span>
                      {row.claude}
                    </div>
                    <div>
                      <span className="font-semibold text-text-secondary">GPT: </span>
                      {row.chatgpt}
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex flex-wrap gap-6 border-t-[3px] border-ink bg-linen px-6 py-4">
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <CheckCircle2 className="size-4 text-teal" />
                  Claude wins
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <XCircle className="size-4 text-text-secondary" />
                  ChatGPT wins
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <Minus className="size-4 text-walnut" />
                  Comparable
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case Guidance */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              When to Use Which
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              The honest recommendation
            </h2>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]"
                >
                  <div className="mb-3 text-[2rem]">{uc.icon}</div>
                  <div className="mb-2 text-[1.2rem] font-bold text-ink">
                    {uc.title}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                    {uc.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Learn to GPT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Pick either — the skills transfer
              </h2>
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                Learn to GPT teaches the fundamentals that carry across every chat
                model: writing clear prompts, giving good context, and iterating
                on output. Learn them once on ChatGPT or Claude and you can move
                between the two without starting over. Free tracks cover the
                foundations; deeper courses go into real professional workflows.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Browse Curriculum
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/courses/why-chatgpt/meet-chatgpt"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-cream px-8 py-3 font-bold text-ink shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Start Free
                </Link>
              </div>
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
                {
                  q: "Can I use Claude and ChatGPT together?",
                  a: "Yes, and many people do. A common pattern is ChatGPT for image generation, voice, and quick everyday tasks, and Claude for long-form writing and reading long documents. They complement each other, and you don't have to pick a side.",
                },
                {
                  q: "Which is better for coding?",
                  a: "For everyday coding help in a chat window, they're close, and the gap shifts with each release. Most people choose by habit or by which one their team already pays for. Both also offer command-line tools for developers who want AI working inside a terminal.",
                },
                {
                  q: "Is Claude more expensive than ChatGPT?",
                  a: "Both have free tiers and paid subscriptions at broadly similar price points, and API pricing varies by model and usage. For document-heavy work, Claude's larger context can mean fewer calls, which can offset cost. For most individuals the monthly plans land in the same ballpark.",
                },
                {
                  q: "Which should I learn first?",
                  a: "The one you already have open. ChatGPT is where most people start, and that's fine. The prompting and context skills you build there transfer directly to Claude and Gemini, so you're not locked in whichever you begin with.",
                },
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

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Ready to get more out of any AI?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free courses. No credit card. Start in 60 seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Try Learn to GPT Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                View Masterclass
              </Link>
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
            <Link
              href="/"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Home
            </Link>
            <Link
              href="/curriculum"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Curriculum
            </Link>
            <Link
              href="/claude-code"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Claude Code
            </Link>
            <Link
              href="/for-teams"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              For Teams
            </Link>
            <Link
              href="/terms"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Privacy
            </Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            Learn to GPT
          </p>
        </div>
      </footer>
    </div>
  );
}
