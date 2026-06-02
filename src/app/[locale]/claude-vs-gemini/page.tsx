import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-vs-gemini`;

  const title = "Claude vs Gemini: Complete AI Comparison Guide (2025)";
  const description =
    "Claude vs Gemini — which AI is better for writing, coding, reasoning, and multimodal tasks? An honest, fact-based comparison to help you choose the right model.";

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
          alt: "Claude vs Gemini — Learn to GPT",
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
    claude: "Excellent — nuanced voice, consistent tone across thousands of words, adapts to style",
    gemini: "Good — tends toward factual tone, less adaptive to creative voice",
    winner: "claude" as const,
  },
  {
    category: "Code generation",
    claude: "Strong — explains reasoning, catches edge cases, ChatGPT Codex CLI for agentic dev",
    gemini: "Strong — deep integration with Google IDEs and Workspace tools",
    winner: "tie" as const,
  },
  {
    category: "Context window",
    claude: "200K tokens — full codebases, entire books, 100-page reports",
    gemini: "1M tokens (Gemini 1.5 Pro) — massive, but real-world retrieval quality varies",
    winner: "gemini" as const,
  },
  {
    category: "Multimodal (images, video)",
    claude: "Strong image understanding and analysis",
    gemini: "Native multimodal — audio, video, images trained from the ground up",
    winner: "gemini" as const,
  },
  {
    category: "Google Workspace integration",
    claude: "Available via Claude.ai and API",
    gemini: "Deep native — Docs, Sheets, Gmail, Meet all built in",
    winner: "gemini" as const,
  },
  {
    category: "Developer API & tooling",
    claude: "Claude API + ChatGPT Codex CLI + MCP ecosystem",
    gemini: "Google AI Studio + Vertex AI — strong GCP integration",
    winner: "tie" as const,
  },
  {
    category: "Safety & instruction-following",
    claude: "Constitutional AI — precise, low hallucination, low refusal rate",
    gemini: "Good — Google safety filters can be conservative",
    winner: "claude" as const,
  },
  {
    category: "Document analysis",
    claude: "200K context — reads entire codebases or books in one session",
    gemini: "Strong, especially for Google Docs natively",
    winner: "claude" as const,
  },
  {
    category: "Real-time web search",
    claude: "Via MCP tools or computer use — not built in by default",
    gemini: "Native Google Search integration — real-time and cited",
    winner: "gemini" as const,
  },
];

const useCases = [
  {
    title: "Choose Claude for writing & research",
    body: "Long-form content, legal document review, research synthesis, nuanced editing. Claude's Constitutional AI training and precise instruction-following make it more reliable for complex text work.",
    icon: "✍️",
  },
  {
    title: "Choose Claude for developer workflows",
    body: "Claude Code gives you a full agentic CLI that runs in your terminal. MCP connects Claude to any tool. For multi-file projects, autonomous coding, and API integration, Claude has the edge.",
    icon: "⚙️",
  },
  {
    title: "Choose Gemini for Google Workspace",
    body: "If your team lives in Docs, Sheets, Gmail, and Meet, Gemini's native integration is hard to beat. It summarizes threads, drafts replies, and analyzes spreadsheets without copy-paste.",
    icon: "📊",
  },
  {
    title: "Choose Gemini for multimodal tasks",
    body: "Audio transcription, video understanding, image analysis at scale — Gemini was built multimodal from the start. Claude handles images but Gemini's native training gives it an edge.",
    icon: "🎬",
  },
];

export default async function ClaudeVsGeminiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-vs-gemini`;

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
                headline: "Claude vs Gemini: Honest AI Comparison for 2025",
                description:
                  "A fact-based comparison of Claude and Gemini across writing, coding, multimodal tasks, and Google Workspace integration.",
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
                    name: "Claude vs Gemini",
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
              Claude vs Gemini: Which AI Wins for Your Workflow?
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Two powerful models, different strengths — which fits your workflow?
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude (Anthropic) and Gemini (Google DeepMind) are two of the most capable AI models available today. Both excel at reasoning and code. The real differences emerge in writing quality, developer tooling, Google Workspace integration, and multimodal tasks. Here&apos;s the honest breakdown.
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

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude excels at writing, code generation (via Claude Code), and precise instruction-following with a 200K-token context window. Gemini excels at multimodal tasks and Google ecosystem integration with up to 1M tokens. For professional knowledge work, Claude's accuracy throughout long contexts gives it an edge.
              </p>
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
              <div className="grid grid-cols-[1fr_1fr_1fr_80px] bg-ink px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-white max-md:grid-cols-[1fr_80px]">
                <span>Category</span>
                <span className="max-md:hidden">Claude</span>
                <span className="max-md:hidden">Gemini</span>
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
                    {row.claude}
                  </div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary max-md:hidden">
                    {row.gemini}
                  </div>
                  <div className="flex justify-center">
                    {row.winner === "claude" && (
                      <CheckCircle2 className="size-6 text-teal" />
                    )}
                    {row.winner === "gemini" && (
                      <XCircle className="size-6 text-text-secondary" />
                    )}
                    {row.winner === "tie" && (
                      <Minus className="size-6 text-walnut" />
                    )}
                  </div>
                  {/* Mobile */}
                  <div className="space-y-1 text-[0.85rem] text-text-secondary md:hidden">
                    <div><span className="font-semibold text-orange">Claude: </span>{row.claude}</div>
                    <div><span className="font-semibold text-text-secondary">Gemini: </span>{row.gemini}</div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex flex-wrap gap-6 border-t-[3px] border-ink bg-linen px-6 py-4">
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <CheckCircle2 className="size-4 text-teal" /> Claude wins
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <XCircle className="size-4 text-text-secondary" /> Gemini wins
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary">
                  <Minus className="size-4 text-walnut" /> Comparable
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Context window deep dive */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                The context window myth
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Gemini 1.5 Pro&apos;s 1M-token context window sounds decisive — and it is impressive. But raw context size isn&apos;t the full story. In the <strong>Needle in a Haystack</strong> benchmark, which tests whether models can reliably retrieve information from deep within their context, Claude consistently outperforms Gemini 1.5 Pro on retrieval accuracy at equivalent depths.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                For most professional use cases — analyzing a codebase, reviewing a contract, synthesizing research — Claude&apos;s 200K window is sufficient, and the retrieval quality is more reliable. For tasks requiring a true million-token context (e.g., loading entire data dumps), Gemini 1.5 Pro is the stronger choice.
              </p>
            </div>
          </div>
        </section>

        {/* Use case guidance */}
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
                  <div className="mb-2 text-[1.2rem] font-bold text-ink">{uc.title}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{uc.body}</p>
                </div>
              ))}
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
                { q: "Is Claude better than Gemini?", a: "Claude and Gemini have different strengths. Claude excels at writing, code generation, and instruction-following. Gemini excels at multimodal tasks and Google ecosystem integration. The best choice depends on your use case." },
                { q: "Which AI has the larger context window?", a: "Gemini supports up to 1M tokens with Gemini 1.5 Pro, while Claude supports up to 200K tokens. However, Claude's instruction-following accuracy remains higher throughout long contexts." },
                { q: "Can I use both Claude and Gemini?", a: "Yes. Many professionals use Claude for writing and development (via Claude Code) and Gemini for tasks integrated with Google Workspace. They serve complementary roles." },
                { q: "Is Gemini free to use?", a: "Gemini offers a free tier through Google AI Studio and the Gemini app. Claude also has a free tier at claude.ai. Both have paid plans for higher usage limits and more capable models." },
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

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Already choosing Claude?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Learn it systematically. Free courses, no credit card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free Courses
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Curriculum
              </Link>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Explore More</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-vs-chatgpt", label: "Claude vs ChatGPT", desc: "Compare Claude and GPT-4o" },
                { href: "/learn", label: "Free Courses", desc: "Start learning Claude today" },
                { href: "/curriculum", label: "Full Curriculum", desc: "All tracks from beginner to Architect" },
              ].map(({ href, label, desc }) => (
                <Link key={href} href={href} className="rounded-[16px] border-[3px] border-ink bg-cream p-[18px_20px] shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">{label}</div>
                  <p className="text-[0.8rem] leading-[1.5] text-text-secondary">{desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-orange">Explore <ArrowRight className="size-3" /></span>
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
            <Link href="/for-teams" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Teams</Link>
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
