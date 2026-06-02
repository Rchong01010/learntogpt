import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, FileCode, Settings, Wrench } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-setup`;

  const title = "Claude Code Setup Guide: Install, Configure & CLAUDE.md";
  const description =
    "Complete Claude Code setup guide — installation, configuration, CLAUDE.md files, slash commands, and workflow integration. Get Claude Code running in your project in under 10 minutes.";

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
          alt: "Claude Code Setup Guide — Learn to GPT",
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

const setupSteps = [
  {
    step: "01",
    title: "Install Claude Code",
    icon: Terminal,
    body: "Claude Code is an npm package. Install it globally so you can run it from any project directory.",
    code: "npm install -g @anthropic-ai/claude-code",
  },
  {
    step: "02",
    title: "Authenticate",
    icon: Settings,
    body: "Claude Code authenticates via your Anthropic account. Run the command and follow the browser prompt.",
    code: "claude\n# Opens browser auth flow on first run",
  },
  {
    step: "03",
    title: "Create CLAUDE.md",
    icon: FileCode,
    body: "CLAUDE.md is the project memory file Claude reads on every session. Document your project's commands, conventions, and context here.",
    code: "# Project: My App\n\n## Commands\n- Build: `npm run build`\n- Test: `npm test`\n- Lint: `npm run lint`\n\n## Stack\n- Next.js 15 + TypeScript\n- Supabase (use service_role only behind auth)\n- Tailwind CSS\n\n## Style\n- Named exports only\n- No `any` types — use `unknown` + narrowing\n- Parameterized queries only",
  },
  {
    step: "04",
    title: "Configure slash commands",
    icon: Wrench,
    body: "Create custom slash commands for repeated workflows. Store them in .claude/commands/ — Claude loads them automatically.",
    code: "# .claude/commands/review.md\nReview the current changes for:\n- Security issues (injection, auth gaps)\n- TypeScript errors\n- Missing error handling\n- Rate limiting on public endpoints",
  },
];

const claudeMdSections = [
  {
    title: "Commands",
    desc: "Build, test, lint, and deploy commands. Claude runs these to verify its own changes.",
    example: "## Commands\n- Build: `npm run build`\n- Test: `npm test --watch`",
  },
  {
    title: "Architecture",
    desc: "Your tech stack, key services, and which patterns you use. Prevents Claude from suggesting incompatible approaches.",
    example: "## Stack\n- Next.js 15 App Router\n- Supabase PostgreSQL\n- Stripe for payments",
  },
  {
    title: "Code Style",
    desc: "Your naming conventions, formatting rules, and patterns to follow or avoid.",
    example: "## Style\n- Named exports only\n- No `any` types\n- Tailwind classes only",
  },
  {
    title: "Security Rules",
    desc: "Hardcode your security requirements so Claude always applies them without being asked.",
    example: "## Security\n- Rate limit every public endpoint\n- Validate all inputs server-side\n- No select(*) queries",
  },
];

export default async function ClaudeCodeSetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-setup`;

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
                name: "Claude Code Setup Guide",
                description:
                  "Install Claude Code, authenticate, create CLAUDE.md, and configure slash commands.",
                url: pagePath,
                inLanguage: locale,
                step: setupSteps.map((s) => ({
                  "@type": "HowToStep",
                  name: s.title,
                  text: s.body,
                })),
              },
              {
                "@type": "Product",
                name: "Claude Code Individual Setup",
                description:
                  "1:1 Claude Code setup call — your repo configured with CLAUDE.md, slash commands, and workflow integration.",
                provider: {
                  "@type": "Organization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code Setup", item: pagePath },
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
              Track 6 · Practitioner Setup
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Set Up Claude Code and Start Shipping in 10 Minutes
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code is Anthropic&apos;s agentic CLI. It lives in your terminal,
              reads your entire codebase, and handles multi-file edits, testing,
              and commits. This guide covers installation through a fully
              configured CLAUDE.md that makes Claude useful on day one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get the Masterclass
                <ArrowRight className="size-5" />
              </Link>
              <a
                href="mailto:reid@getateam.ai?subject=Claude%20Code%20Setup%20Call"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Book a Setup Call
              </a>
            </div>
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              Or follow the free guide below to set up on your own
            </p>
          </div>
        </section>

        {/* Step by step */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Step by Step
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Get Claude Code running in your project
            </h2>

            <div className="mt-10 space-y-6">
              {setupSteps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[16px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]"
                  >
                    <div className="flex items-start gap-4 p-[24px_28px]">
                      <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-orange font-mono text-[0.85rem] font-bold text-white">
                        {s.step}
                      </span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2 text-[1.05rem] font-bold text-ink">
                          <Icon className="size-4 text-teal" />
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
                        </div>
                        <pre className="overflow-x-auto p-6 font-mono text-[0.82rem] leading-[1.7] text-ink">
                          <code>{s.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLAUDE.md anatomy */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              CLAUDE.md Anatomy
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What goes in your CLAUDE.md
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-center text-[1rem] leading-[1.7] text-text-secondary">
              CLAUDE.md is project memory. Claude reads it at the start of every
              session. A well-written CLAUDE.md eliminates repeating yourself and
              makes Claude consistently apply your project&apos;s standards.
            </p>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {claudeMdSections.map((sec, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[20px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="p-[20px_24px_16px]">
                    <div className="mb-1 text-[1.05rem] font-bold text-ink">
                      {sec.title}
                    </div>
                    <p className="text-[0.85rem] leading-[1.6] text-text-secondary">
                      {sec.desc}
                    </p>
                  </div>
                  <div className="border-t-[2px] border-ink/20 bg-[#1c1917]">
                    <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7] text-teal">
                      <code>{sec.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upgrade offers */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <h2 className="text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Want it done right the first time?
            </h2>
            <p className="mx-auto mt-3 max-w-[600px] text-center text-[1rem] text-text-secondary">
              Two options for teams and individuals who want expert setup rather
              than DIY.
            </p>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {/* Masterclass */}
              <div className="rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange">
                  Self-Paced
                </div>
                <div className="mb-1 text-[1.4rem] font-bold text-ink">
                  Masterclass
                </div>
                <ul className="mb-6 space-y-2">
                  {[
                    "Private GitHub repo with pre-built agents",
                    "Complete CLAUDE.md templates",
                    "Slash command library",
                    "All 7 learning tracks unlocked",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                      <span className="mt-1 text-teal">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/masterclass"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Get Masterclass
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* 1:1 Setup */}
              <div className="relative rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]">
                <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-orange px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                  Done-For-You
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange">
                  1:1 Setup Call
                </div>
                <div className="mb-1 text-[1.4rem] font-bold text-ink">
                  Individual Setup
                </div>
                <ul className="mb-6 space-y-2">
                  {[
                    "Live setup on your actual codebase",
                    "Custom CLAUDE.md for your project",
                    "Slash commands built for your workflow",
                    "Recording to revisit later",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                      <span className="mt-1 text-teal">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:reid@getateam.ai?subject=Claude%20Code%20Setup%20Call"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-8 py-3 font-bold text-ink shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Book Setup Call
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Start free, upgrade when ready
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Track 6 is free. Masterclass unlocks the full Claude Code course.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Overview
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
            <Link href="/claude-code" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code</Link>
            <Link href="/masterclass" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Masterclass</Link>
            <Link href="/claude-api-tutorial" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">API Tutorial</Link>
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
