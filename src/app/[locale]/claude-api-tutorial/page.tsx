import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Code2, Zap, Shield, Layers } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-api-tutorial`;

  const title = "Claude API Tutorial: Getting Started with the OpenAI API";
  const description =
    "Step-by-step Claude API tutorial — authentication, your first request, streaming, tool use, and production patterns. Start building with the OpenAI API today.";

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
          alt: "Claude API Tutorial — Learn to GPT",
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

const steps = [
  {
    step: "01",
    title: "Get your API key",
    body: "Sign up at console.anthropic.com. Free tier includes enough credits to experiment. Production usage is pay-per-token.",
    code: null,
  },
  {
    step: "02",
    title: "Install the SDK",
    body: "The Anthropic SDK is available for Python and TypeScript/JavaScript. Both are officially maintained.",
    code: "npm install @anthropic-ai/sdk\n# or\npip install anthropic",
  },
  {
    step: "03",
    title: "Your first request",
    body: "Send a message to Claude claude-sonnet-4-5 and get a response. The API is stateless — you manage conversation history.",
    code: 'import Anthropic from "@anthropic-ai/sdk";\n\nconst client = new Anthropic();\nconst msg = await client.messages.create({\n  model: "claude-sonnet-4-5",\n  max_tokens: 1024,\n  messages: [{ role: "user", content: "Hello, Claude" }],\n});\nconsole.log(msg.content);',
  },
  {
    step: "04",
    title: "Add streaming",
    body: "For real-time UI responses, use the streaming API. Tokens arrive as they are generated — no waiting for the full response.",
    code: 'const stream = await client.messages.stream({\n  model: "claude-sonnet-4-5",\n  max_tokens: 1024,\n  messages: [{ role: "user", content: "Tell me a story" }],\n});\n\nfor await (const chunk of stream) {\n  process.stdout.write(chunk.delta?.text ?? "");\n}',
  },
  {
    step: "05",
    title: "Use tool use",
    body: "Give Claude tools like web search, database access, or custom functions. Claude decides when to call them and parses the results.",
    code: 'const response = await client.messages.create({\n  model: "claude-sonnet-4-5",\n  tools: [{\n    name: "get_weather",\n    description: "Get current weather",\n    input_schema: {\n      type: "object",\n      properties: { location: { type: "string" } },\n      required: ["location"],\n    },\n  }],\n  messages: [{ role: "user", content: "Weather in San Diego?" }],\n});',
  },
];

const concepts = [
  {
    icon: Layers,
    title: "Messages API",
    desc: "Stateless request/response. You send the full conversation history each time. Claude returns a message object with usage statistics.",
  },
  {
    icon: Zap,
    title: "Streaming",
    desc: "Server-sent events deliver tokens as they are generated. Critical for chat interfaces and long-running responses.",
  },
  {
    icon: Code2,
    title: "Tool use",
    desc: "Define tools with JSON Schema. Claude calls them intelligently, you execute them, and the results feed back into the conversation.",
  },
  {
    icon: Shield,
    title: "System prompts",
    desc: "Set Claude's persona, constraints, and context via the system parameter. Cached system prompts reduce latency and cost.",
  },
];

export default async function ClaudeApiTutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-api-tutorial`;

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
                "@type": "HowTo",
                name: "Getting Started with the Claude API",
                description:
                  "Step-by-step tutorial for the Anthropic Claude API — authentication, first request, streaming, tool use, and production patterns.",
                url: pagePath,
                inLanguage: locale,
                step: steps.map((s) => ({
                  "@type": "HowToStep",
                  name: s.title,
                  text: s.body,
                })),
              },
              {
                "@type": "Course",
                name: "Claude API & Agents — Track 4",
                description:
                  "Tool use, streaming, agentic loops, error handling, and production-ready patterns with the Claude API.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Intermediate",
                inLanguage: locale,
                url: `${baseUrl}/curriculum`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude API Tutorial", item: pagePath },
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
              Track 4 · API &amp; Agents
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Build Your First Claude API App in 5 Steps
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[600px] text-[1.05rem] leading-[1.7] text-text-secondary">
              The OpenAI API gives you direct access to Claude models. This
              guide walks you through authentication, your first message,
              streaming, tool use, and the patterns you need to build reliable
              production systems.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the API Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                All Dev Tracks
              </Link>
            </div>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Core Concepts
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How the Claude API works
            </h2>
            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {concepts.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-6 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.2rem] font-bold text-ink">{c.title}</div>
                    <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{c.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Step-by-step tutorial */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Tutorial
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Getting started step by step
            </h2>

            <div className="mt-10 space-y-6">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="flex items-start gap-4 p-[24px_28px]">
                    <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-orange font-mono text-[0.85rem] font-bold text-white">
                      {s.step}
                    </span>
                    <div>
                      <div className="mb-1 text-[1.05rem] font-bold text-ink">
                        {s.title}
                      </div>
                      <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                        {s.body}
                      </p>
                    </div>
                  </div>
                  {s.code && (
                    <div className="border-t-[2px] border-ink/20">
                      <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[10px]">
                        <div className="size-2.5 rounded-full bg-[#c94040]" />
                        <div className="size-2.5 rounded-full bg-gold" />
                        <div className="size-2.5 rounded-full bg-teal" />
                        <span className="ml-auto font-mono text-[0.7rem] text-white/60">
                          JavaScript / TypeScript
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-6 font-mono text-[0.82rem] leading-[1.7] text-ink">
                        <code>{s.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Course CTA */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Go deeper in the API &amp; Agents track
              </h2>
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                Track 4 covers the full production surface: error handling,
                retry logic, rate limiting, prompt caching, multi-agent
                orchestration, and evaluation. Interactive exercises with a live
                Claude sandbox so you practice every pattern hands-on.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  View Full Curriculum
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

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Ready to build with the Claude API?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free foundation tracks. Masterclass for advanced patterns.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
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
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/claude-for-developers" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Developers</Link>
            <Link href="/claude-code-setup" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code Setup</Link>
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
