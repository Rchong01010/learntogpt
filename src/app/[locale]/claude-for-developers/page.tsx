import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Code2, Cpu, Layers, Wrench, Zap } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-developers`;

  const title = "Claude for Developers: Where It Fits in a GPT-Centric Stack";
  const description =
    "A developer's map of the Claude side of the fence: Claude Code vs Codex CLI, the Anthropic API next to OpenAI's, MCP, and agent patterns that transfer between both ecosystems.";

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
          alt: "Claude for Developers | Learn to GPT",
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

const tracks = [
  {
    icon: Terminal,
    color: "teal",
    bgColor: "#d0f0ea",
    track: "Track 3",
    title: "Claude Code",
    desc: "The terminal agent, learned properly: scaffolding, multi-file edits, TDD loops, and shipping. Skills carry straight over to Codex CLI.",
    href: "/claude-code",
  },
  {
    icon: Code2,
    color: "orange",
    bgColor: "#ffecd2",
    track: "Track 4",
    title: "API & Agents",
    desc: "Tool use, streaming, agentic loops, and error handling with the OpenAI API. The same patterns port to Anthropic's API with minor syntax changes.",
    href: "/curriculum",
  },
  {
    icon: Layers,
    color: "teal",
    bgColor: "#d0f0ea",
    track: "Track 5",
    title: "Architect",
    desc: "Evals, observability, cost control, and deployment patterns that don't care which model vendor sits underneath.",
    href: "/curriculum",
  },
  {
    icon: Cpu,
    color: "orange",
    bgColor: "#ffecd2",
    track: "Track 7",
    title: "Advanced Workflows",
    desc: "Slash commands, memory systems, hooks, and multi-agent orchestration: the deep end of agentic tooling.",
    href: "/masterclass",
  },
];

const features = [
  {
    icon: Terminal,
    title: "Claude Code vs Codex CLI",
    desc: "Two terminal agents, one shape: type the task, the agent reads the repo, edits files, runs tests. Learn one and you've mostly learned the other; we teach with Claude Code and flag the differences.",
  },
  {
    icon: Wrench,
    title: "Tool Use & MCP",
    desc: "Wiring models to web search, databases, and file systems. The Model Context Protocol started at Anthropic and has been adopted across the industry, including by OpenAI, so it's worth learning regardless of your model.",
  },
  {
    icon: Code2,
    title: "Streaming APIs",
    desc: "Token-by-token responses for chat UIs and pipelines. Anthropic's and OpenAI's streaming interfaces differ in event names more than in concept; we show both shapes.",
  },
  {
    icon: Layers,
    title: "Multi-Agent Architectures",
    desc: "Planner, executor, validator. Orchestration patterns with real error handling, built vendor-neutral so a model swap is a config change, not a rewrite.",
  },
  {
    icon: Zap,
    title: "Project Convention Files",
    desc: "CLAUDE.md for Claude Code, AGENTS.md for Codex CLI: persistent files that teach the agent your stack, commands, and style guide once instead of every session.",
  },
  {
    icon: Cpu,
    title: "Evals & Cost Optimization",
    desc: "Eval suites, quality tracking over time, and token cost control. The discipline that separates demos from production, on any provider.",
  },
];

export default async function ClaudeForDevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-for-developers`;

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
                name: "Claude for Developers: Where It Fits in a GPT-Centric Stack",
                description:
                  "Claude Code vs Codex CLI, the Anthropic API next to OpenAI's, MCP, and agent patterns that transfer between ecosystems.",
                url: pagePath,
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: "AI Developer Tracks: Claude Code, APIs, and Agents",
                description:
                  "Developer-focused tracks covering Claude Code, the OpenAI and Anthropic APIs, tool use, agent architectures, and production deployment.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Intermediate to Advanced",
                teaches: [
                  "Claude Code and Codex CLI",
                  "OpenAI and Anthropic APIs",
                  "Tool use and MCP",
                  "Multi-agent architectures",
                  "Production deployment",
                  "Evals and observability",
                ],
                inLanguage: locale,
                url: pagePath,
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
                    name: "Claude for Developers",
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
                href="/courses/practitioner-setup/claude-md-project-spine"
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Terminal className="size-4" />
              Tracks 3 · 4 · 5 · 7
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              The{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude
              </em>{" "}
              side of the developer stack, mapped for GPT builders
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Learn the patterns once; the vendor is a config value
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-text-secondary">
              If you build with the OpenAI API, the Claude ecosystem will look
              familiar: Claude Code mirrors Codex CLI in the terminal, the
              Anthropic API mirrors chat completions with different event names,
              and MCP works across both. These tracks teach the transferable
              layer: agents, tool use, streaming, and the production discipline
              around them.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Explore Claude Code
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

        {/* What you'll learn */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              What You&apos;ll Learn
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What transfers between the GPT and Claude ecosystems
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">
                      {feature.title}
                    </div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                      {feature.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Developer Tracks */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Course Tracks
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Your developer learning path
            </h2>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {tracks.map((track, i) => {
                const Icon = track.icon;
                return (
                  <Link
                    key={i}
                    href={track.href}
                    className="relative block rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0px_#1c1917]"
                  >
                    <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-ink px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                      {track.track}
                    </div>
                    <div
                      className="mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink shadow-[2px_2px_0px_#1c1917]"
                      style={{ backgroundColor: track.bgColor }}
                    >
                      <Icon className={`size-6 text-${track.color}`} />
                    </div>
                    <div className="mb-2 text-[1.2rem] font-bold text-ink">
                      {track.title}
                    </div>
                    <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                      {track.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-orange">
                      Explore track
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Terminal preview */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[14px]">
                <div className="size-3 rounded-full border-2 border-white/30 bg-[#c94040]" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-gold" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">
                  Terminal
                </span>
              </div>
              <div className="sandbox-lined relative min-h-[180px] p-7 max-md:p-5">
                <pre className="font-mono text-[0.85rem] leading-[32px] text-ink">
                  <code>
                    <span className="text-text-secondary">$ </span>
                    <span className="text-orange">npm install</span>
                    {" -g @anthropic-ai/claude-code\n"}
                    <span className="text-text-secondary">$ </span>
                    <span className="text-orange">claude</span>
                    {"\n\n"}
                    <span className="text-teal">
                      {"> "}
                    </span>
                    {"Add rate limiting to all POST endpoints\n"}
                    <span className="text-text-secondary">
                      {"  ✓ Reading src/app/api/...\n"}
                      {"  ✓ Applying changes to 4 files\n"}
                      {"  ✓ Tests passing\n"}
                    </span>
                  </code>
                </pre>
                <div className="absolute bottom-5 right-5 rotate-[6deg] rounded-[12px] border-[3px] border-ink bg-teal px-4 py-2 font-mono text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917]">
                  +75 XP
                </div>
              </div>
            </div>
            <p className="mt-5 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              Claude Code in practice. Swap the install line and this is a Codex CLI session.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-[100px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Add the Claude column to your toolbox
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Free tracks to start. Masterclass when you&apos;re shipping agents for real.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
                <ArrowRight className="size-5" />
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
              href="/masterclass"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              Masterclass
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
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
