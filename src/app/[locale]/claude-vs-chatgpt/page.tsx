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

  const title = "Claude vs ChatGPT: Honest Comparison for 2025";
  const description =
    "Claude vs ChatGPT — which AI is better for writing, coding, analysis, and research? An honest, fact-based comparison with real examples to help you choose.";

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
    category: "Long-form writing",
    claude: "Excellent — nuanced, structured, adapts to voice",
    chatgpt: "Good — can feel formulaic at scale",
    winner: "claude" as const,
  },
  {
    category: "Code generation",
    claude: "Strong — explains reasoning, catches edge cases",
    chatgpt: "Strong — large plugin ecosystem, GPT-4o speed",
    winner: "tie" as const,
  },
  {
    category: "Document analysis",
    claude: "200K token context — reads entire codebases or books",
    chatgpt: "128K tokens — good for most tasks",
    winner: "claude" as const,
  },
  {
    category: "Web browsing",
    claude: "Available via computer use / MCP tools",
    chatgpt: "Native browsing built in to Plus",
    winner: "chatgpt" as const,
  },
  {
    category: "Image generation",
    claude: "Not built in (uses Claude models for vision)",
    chatgpt: "DALL·E 3 built in",
    winner: "chatgpt" as const,
  },
  {
    category: "Safety & instruction-following",
    claude: "Trained with Constitutional AI — precise, low refusal rate",
    chatgpt: "Good — sometimes over-cautious on edge cases",
    winner: "claude" as const,
  },
  {
    category: "API & developer tools",
    claude: "Claude API + ChatGPT Codex CLI + MCP ecosystem",
    chatgpt: "OpenAI API + GPT-4o assistants + plugins",
    winner: "tie" as const,
  },
  {
    category: "Multilingual support",
    claude: "Strong across 100+ languages",
    chatgpt: "Strong across 100+ languages",
    winner: "tie" as const,
  },
];

const useCases = [
  {
    title: "Choose Claude for writing & analysis",
    body:
      "Long-form content, legal document review, research synthesis, nuanced editing — Claude's larger context window and Constitutional AI training make it more reliable for complex, high-stakes text work.",
    icon: "✍️",
  },
  {
    title: "Choose Claude for developer workflows",
    body:
      "Claude Code gives you a full agentic CLI that runs in your terminal, edits multi-file projects, writes tests, and deploys. The MCP ecosystem extends Claude into any tool you already use.",
    icon: "⚙️",
  },
  {
    title: "ChatGPT wins for multimedia & browsing",
    body:
      "If you need image generation, voice mode, or real-time web search baked in without extra setup, ChatGPT Plus has the edge today.",
    icon: "🖼️",
  },
  {
    title: "Both are excellent for most everyday tasks",
    body:
      "Summarizing emails, drafting messages, answering questions, explaining concepts — either model handles this well. The differences become meaningful at professional scale and complexity.",
    icon: "⚡",
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
                headline: "Claude vs ChatGPT: Honest Comparison for 2025",
                description:
                  "An honest, fact-based comparison of Claude and ChatGPT across writing, coding, analysis, and research use cases.",
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
                      text: "Claude excels at long-form writing, document analysis, and developer workflows via Claude Code. ChatGPT has the edge for built-in image generation and web browsing. For most professional use cases, Claude's larger context window and precise instruction-following give it an advantage.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which AI is better for coding?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Both Claude and ChatGPT are strong at code generation. Claude's unique advantage is Claude Code — an agentic CLI that edits multi-file projects, runs tests, and deploys. For raw code snippets, both are comparable.",
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
              Honest AI Comparison
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude vs ChatGPT
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Which AI is actually better for your work?
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[600px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Both are excellent models. The real question is which one fits
              your workflow. We break down the honest differences across writing,
              coding, analysis, and research — with no hype and no vendor bias.
            </p>
            <Link
              href="/courses/why-claude/meet-claude"
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
                Claude and ChatGPT are both frontier AI models, but they excel at different things. Claude (by Anthropic) is stronger at long-form writing, document analysis, and developer workflows via Claude Code. ChatGPT (by OpenAI) has the edge for built-in image generation and web browsing. For most professional knowledge work, Claude&apos;s 200K-token context window, precise instruction-following, and Constitutional AI training give it a measurable advantage in output quality and reliability.
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
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Context window: Claude handles more</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  Claude supports a 200,000-token context window, roughly 150,000 words. That means you can paste an entire codebase, a full research paper, or a 300-page legal document and Claude processes it in a single conversation. GPT-4o supports 128K tokens. For tasks that require reading and synthesizing long documents, Claude&apos;s larger context window is a concrete advantage.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Developer tools: Claude Code vs ChatGPT plugins</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  Claude Code is a standalone CLI that runs in your terminal, reads your project files, edits code, runs tests, and deploys. It operates autonomously on multi-step tasks. ChatGPT&apos;s developer experience centers on the Assistants API and plugin ecosystem. For developers who want an agentic coding tool, Claude Code is significantly more capable. For developers who want multi-model flexibility, ChatGPT&apos;s plugin marketplace offers broader integrations.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Writing quality: Claude tends to be less formulaic</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  For long-form writing, Claude consistently produces more nuanced, less repetitive output. It adapts better to voice-matching, maintains consistency across longer pieces, and avoids the predictable patterns that make ChatGPT output feel templated. This matters most for professional content creation, editing, and any task where the output needs to sound human.
                </p>
              </div>
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 text-[1.1rem] font-bold text-ink">Multimedia: ChatGPT has more built-in</h3>
                <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                  ChatGPT includes DALL-E 3 image generation, native voice mode, and built-in web browsing without any setup. Claude can browse the web via MCP tools and analyze images, but it does not generate images natively. If multimedia creation is central to your workflow, ChatGPT offers a more integrated out-of-box experience.
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
                Already decided on Claude?
              </h2>
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                Learn to GPT is the fastest way to go from "I have a Claude
                account" to actually using it in your daily work. Free tracks
                cover the foundations — prompting, context, professional
                workflows. The masterclass unlocks Claude Code, the API,
                and advanced agent patterns.
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
                  href="/courses/why-claude/meet-claude"
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
                  a: "Yes, and many professionals do. A common pattern is using Claude for long-form writing, document analysis, and coding (via Claude Code), while using ChatGPT for quick image generation and web browsing tasks. The models complement each other well.",
                },
                {
                  q: "Which is better for coding?",
                  a: "For raw code generation, both are comparable. Claude's advantage is Claude Code, an agentic CLI that reads your project, edits multiple files, runs tests, and commits. ChatGPT has a broader plugin ecosystem. If you want autonomous coding workflows, Claude Code is the stronger tool.",
                },
                {
                  q: "Is Claude more expensive than ChatGPT?",
                  a: "Both offer free tiers and paid subscriptions at similar price points. API pricing varies by model and usage. Claude's larger context window means you can process longer documents in a single call, which can be more cost-effective for document-heavy workflows.",
                },
                {
                  q: "Which should I learn first?",
                  a: "If your work involves writing, analysis, or software development, start with Claude. Its instruction-following precision and context window make it easier to get reliable results as a beginner. The skills you build transfer to other models.",
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
              Ready to master Claude?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free courses. No credit card. Start in 60 seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/why-claude/meet-claude"
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
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            Learn to GPT
          </p>
        </div>
      </footer>
    </div>
  );
}
