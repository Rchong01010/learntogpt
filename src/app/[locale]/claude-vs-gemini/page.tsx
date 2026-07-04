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

  const title = "Claude vs Gemini: How the Two Stack Up (and vs ChatGPT)";
  const description =
    "Claude vs Gemini for writing, coding, and multimodal work — plus where each one fits if you're already using ChatGPT. A neutral, task-by-task comparison to help you pick.";

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
    claude: "Often preferred — holds a voice and stays consistent across long pieces",
    gemini: "Capable, tends toward a more factual, neutral tone",
    winner: "claude" as const,
  },
  {
    category: "Everyday coding help",
    claude: "Strong — explains its reasoning, catches edge cases",
    gemini: "Strong — ties into Google's dev tools",
    winner: "tie" as const,
  },
  {
    category: "Very long inputs",
    claude: "Large context, comfortable with whole codebases and long reports",
    gemini: "Even larger context on its Pro model — good for big data dumps",
    winner: "gemini" as const,
  },
  {
    category: "Multimodal (images, audio, video)",
    claude: "Reads images well; text-first overall",
    gemini: "Built multimodal from the start — audio and video included",
    winner: "gemini" as const,
  },
  {
    category: "Google Workspace integration",
    claude: "Used via claude.ai and API",
    gemini: "Native across Docs, Sheets, Gmail, and Meet",
    winner: "gemini" as const,
  },
  {
    category: "Real-time web search",
    claude: "Available with tools connected; not on by default",
    gemini: "Native Google Search, real-time and cited",
    winner: "gemini" as const,
  },
  {
    category: "Refusals & instruction-following",
    claude: "Tends to explain itself and refuse less arbitrarily",
    gemini: "Solid; safety filters can be on the cautious side",
    winner: "claude" as const,
  },
  {
    category: "vs ChatGPT (the default most people have)",
    claude: "The pick when you want careful writing or long-document work",
    gemini: "The pick when your day already runs on Google",
    winner: "tie" as const,
  },
];

const useCases = [
  {
    title: "Reach for Claude on careful text",
    body: "Long-form writing, contract or report review, research synthesis, and edits that need to hold a consistent voice. This is where people who don't live in Google tend to prefer it.",
    icon: "✍️",
  },
  {
    title: "Reach for Gemini inside Google",
    body: "If your work lives in Docs, Sheets, Gmail, and Meet, Gemini's native integration summarizes threads, drafts replies, and reads spreadsheets without any copy-paste.",
    icon: "📊",
  },
  {
    title: "Reach for Gemini on multimodal",
    body: "Audio, video, and image-heavy tasks play to Gemini's strengths — it was trained multimodal from the start. Claude reads images but is text-first overall.",
    icon: "🎬",
  },
  {
    title: "Don't forget ChatGPT",
    body: "Neither of these has to replace what you already use. Plenty of people keep ChatGPT as their default and add Claude or Gemini for the specific jobs each is better at. The skill is knowing which to open.",
    icon: "🔀",
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
                headline: "Claude vs Gemini: How the Two Stack Up in 2025",
                description:
                  "A neutral comparison of Claude and Gemini across writing, coding, multimodal work, and Google integration — plus where each fits alongside ChatGPT.",
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
              Claude vs Gemini, and where each beats ChatGPT
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Two strong alternatives, two very different strengths
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude (Anthropic) and Gemini (Google DeepMind) are two of the most capable models going, and both are common alternatives once ChatGPT stops being enough for a specific job. They split cleanly: Claude leans into careful writing and long documents, Gemini into Google integration and multimodal work. Here&apos;s the straight, model-agnostic breakdown.
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

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude leans toward writing quality and steady instruction-following; Gemini leans toward multimodal work and deep Google integration, with a larger maximum context on its top model. Neither is a universal winner. For text-heavy knowledge work Claude is the more common pick; for anything anchored in Google Docs, Sheets, or Search, Gemini is. Choose by where your work already lives.
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
                Bigger context isn&apos;t automatically better
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Gemini&apos;s top model advertises a much larger maximum context than Claude, and on paper that sounds decisive. In practice, a huge window and reliable recall from deep inside it are two different things. Every model&apos;s retrieval gets shakier the more you cram in, so the headline token number tells you the ceiling, not the day-to-day quality.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                For most real work — reading a codebase, reviewing a contract, synthesizing a few reports — Claude&apos;s window is more than enough and its recall holds up well. If you genuinely need to load an enormous data dump in one shot, Gemini&apos;s larger maximum is the reason to reach for it. Test both on your own material rather than trusting the spec sheet.
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
                { q: "Is Claude better than Gemini?", a: "Neither wins outright. Claude leans toward writing and instruction-following; Gemini toward multimodal work and Google integration. The better tool is the one that matches your task and where your work already lives." },
                { q: "Which one has the larger context window?", a: "Gemini's top model advertises a larger maximum context than Claude. But a bigger ceiling doesn't guarantee better recall from deep inside it, so treat the number as an upper limit rather than a quality score." },
                { q: "Do I have to pick just one?", a: "No. Many people keep ChatGPT as their default and add Claude for careful writing or Gemini for Google-based work, switching by task. The prompting skills carry across all three." },
                { q: "Is Gemini free to use?", a: "Yes, through the Gemini app and Google AI Studio. Claude has a free tier at claude.ai, and ChatGPT has one too. All three reserve their most capable models and higher limits for paid plans." },
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
              Whichever you pick, learn it properly
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Model-agnostic skills that transfer. Free courses, no credit card.
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
