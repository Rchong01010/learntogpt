import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Zap, Shield, Play, Settings, Bug, FileCheck, Terminal } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-hooks`;

  const title = "Claude Code Hooks Tutorial: Automate Your Dev Workflow (2025)";
  const description =
    "Claude Code hooks are shell commands that run automatically before or after specific events — like pre-commit checks, post-edit formatting, or custom validation on every file change.";

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
          alt: "Claude Code Hooks Tutorial — Learn to GPT",
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
    q: "What is the difference between a hook and a slash command?",
    a: "Slash commands are user-triggered — you type /command to run them manually. Hooks are event-triggered — they run automatically when a specific event occurs (like a file edit or tool call). Think of slash commands as buttons you press, and hooks as automated reactions.",
  },
  {
    q: "How do I debug a hook that is not firing?",
    a: "Check three things: (1) the hook is in the correct settings.json file (project-level .claude/settings.json or user-level ~/.claude/settings.json), (2) the event matcher matches the actual event name (case-sensitive), and (3) the shell command is valid and executable. Run the command manually in your terminal first to verify it works.",
  },
  {
    q: "Do hooks impact Claude Code performance?",
    a: "Hooks run synchronously — Claude waits for them to complete before proceeding. Fast hooks (linting a single file, running a formatter) add negligible delay. Slow hooks (full test suites, large builds) will block Claude's workflow. Keep hooks under 5 seconds for the best experience, or use async patterns for heavier operations.",
  },
  {
    q: "Can I share hooks across my team?",
    a: "Yes. Project-level hooks live in .claude/settings.json within your repository, so they are version-controlled and shared with everyone who clones the repo. User-level hooks in ~/.claude/settings.json are personal and stay on your machine. Use project-level for team standards (linting, security checks) and user-level for personal preferences.",
  },
];

const hookEvents = [
  {
    name: "PreToolUse",
    description: "Fires before Claude executes any tool (file write, bash command, etc.). Use this to validate, block, or modify operations before they happen.",
    example: "Block writes to production config files",
    icon: Shield,
    color: "bg-[#ffecd2]",
    iconColor: "text-orange",
  },
  {
    name: "PostToolUse",
    description: "Fires after Claude completes a tool operation. Use this for post-processing — formatting code after edits, running tests after file changes, or logging what changed.",
    example: "Auto-format files after every edit",
    icon: FileCheck,
    color: "bg-[#d0f0ea]",
    iconColor: "text-teal",
  },
  {
    name: "SessionStart",
    description: "Fires once when a Claude Code session begins. Use this for environment setup — loading context files, checking prerequisites, or displaying project status.",
    example: "Load unreconciled Slack messages on startup",
    icon: Play,
    color: "bg-[#e8e0f0]",
    iconColor: "text-[#7c5cbf]",
  },
  {
    name: "Notification",
    description: "Fires when Claude sends a notification (e.g., when a background task completes). Use this to trigger alerts, sounds, or external integrations.",
    example: "Send a Slack message when a long task finishes",
    icon: Zap,
    color: "bg-[#ffecd2]",
    iconColor: "text-orange",
  },
];

const practicalExamples = [
  {
    title: "Auto-format on every file edit",
    description: "Run Prettier automatically after Claude edits any file, ensuring consistent formatting without manual intervention.",
    code: `{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "command": "npx prettier --write $CLAUDE_FILE_PATH"
    }]
  }
}`,
  },
  {
    title: "Security check before bash commands",
    description: "Block dangerous commands like rm -rf or force pushes before they execute.",
    code: `{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "command": "echo \\"$CLAUDE_TOOL_INPUT\\" | grep -qE 'rm -rf|--force|--hard' && exit 1 || exit 0"
    }]
  }
}`,
  },
  {
    title: "Run tests after code changes",
    description: "Automatically run relevant tests when Claude modifies source files, catching regressions immediately.",
    code: `{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit",
      "command": "npm test -- --findRelatedTests $CLAUDE_FILE_PATH"
    }]
  }
}`,
  },
  {
    title: "Load project context on session start",
    description: "Automatically surface unread messages, pending PRs, or project status when you start a Claude Code session.",
    code: `{
  "hooks": {
    "SessionStart": [{
      "command": "cat ~/project/STATUS.md && gh pr list --state open"
    }]
  }
}`,
  },
];

export default async function ClaudeHooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-hooks`;

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
                headline: "Claude Code Hooks Tutorial: Automate Your Dev Workflow",
                description:
                  "Claude Code hooks are shell commands that run automatically before or after specific events — like pre-commit checks, post-edit formatting, or custom validation on every file change.",
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
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code Hooks", item: pagePath },
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
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                {t("nav.curriculum")}
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
                {t("nav.logIn")}
              </Link>
              <Link href="/courses/why-chatgpt/meet-chatgpt" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Advanced Tutorial</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Automate Security Checks, Formatting, and Tests with Hooks
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Event-driven automation for your AI coding workflow
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code hooks are shell commands that run automatically before or after specific events — like pre-commit checks, post-edit formatting, or custom validation on every file change. They turn Claude Code from a smart assistant into a fully automated development pipeline.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Advanced Workflows Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Setup Guide
              </Link>
            </div>
          </div>
        </section>

        {/* What Are Hooks */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Core Concept</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">What Are Hooks?</h2>
            <div className="mt-8 space-y-5 text-[1.02rem] leading-[1.75] text-text-secondary">
              <p>
                Hooks are the automation layer of Claude Code. They let you define shell commands that fire automatically when specific events occur during a Claude Code session — before a tool runs, after a file is edited, when a session starts, or when Claude sends a notification.
              </p>
              <p>
                If you have used Git hooks (pre-commit, post-merge) or CI/CD pipeline triggers, the concept is identical. The difference is that Claude Code hooks operate at the AI interaction level: you can intercept and modify Claude&apos;s behavior in real time, not just at commit boundaries.
              </p>
              <p>
                Hooks are defined in your <code className="rounded bg-ink/10 px-2 py-0.5 text-[0.9rem] text-ink">settings.json</code> file — either at the project level (<code className="rounded bg-ink/10 px-2 py-0.5 text-[0.9rem] text-ink">.claude/settings.json</code> in your repo) or at the user level (<code className="rounded bg-ink/10 px-2 py-0.5 text-[0.9rem] text-ink">~/.claude/settings.json</code>). Project-level hooks are shared with your team via version control. User-level hooks are personal preferences.
              </p>
            </div>
          </div>
        </section>

        {/* Built-in Hook Events */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Event Reference</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Built-in Hook Events</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {hookEvents.map((event, i) => (
                <div key={i} className="rounded-[24px] border-[4px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${event.color} shadow-[2px_2px_0px_#1c1917]`}>
                      <event.icon className={`size-5 ${event.iconColor}`} />
                    </div>
                    <div>
                      <div className="font-mono text-[1.05rem] font-bold text-ink">{event.name}</div>
                    </div>
                  </div>
                  <p className="mb-3 text-[0.9rem] leading-[1.6] text-text-secondary">{event.description}</p>
                  <div className="rounded-lg bg-ink/5 px-3 py-2 text-[0.8rem] text-walnut">
                    <span className="font-semibold">Example: </span>{event.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creating Your First Hook */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Step by Step</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">Creating Your First Hook</h2>
            <div className="mt-8 space-y-6">
              {[
                {
                  step: "1",
                  title: "Create your settings file",
                  body: "If it does not already exist, create .claude/settings.json in your project root. This file configures Claude Code's behavior for this specific project.",
                },
                {
                  step: "2",
                  title: "Define the hook event and matcher",
                  body: "Choose which event to hook into (PreToolUse, PostToolUse, SessionStart, or Notification). If hooking tool events, add a matcher to filter by tool name — \"Edit\" for file edits, \"Bash\" for shell commands, \"Write\" for file creation.",
                },
                {
                  step: "3",
                  title: "Write the shell command",
                  body: "Your hook command is any valid shell expression. Environment variables like $CLAUDE_FILE_PATH and $CLAUDE_TOOL_INPUT give you context about what Claude is doing. Exit code 0 means success; non-zero exit codes block the operation (for PreToolUse hooks).",
                },
                {
                  step: "4",
                  title: "Test the hook",
                  body: "Start a new Claude Code session and trigger the event. Ask Claude to edit a file or run a command to verify your hook fires correctly. Check the Claude Code output for hook execution messages.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-[18px] border-[4px] border-ink bg-cream p-6 shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex size-[36px] items-center justify-center rounded-full border-[3px] border-ink bg-teal text-[0.9rem] font-bold text-white shadow-[2px_2px_0px_#1c1917]">{s.step}</span>
                    <h3 className="text-[1.1rem] font-bold text-ink">{s.title}</h3>
                  </div>
                  <p className="text-[0.92rem] leading-[1.65] text-text-secondary">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Practical Examples */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Copy-Paste Ready</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Practical Examples</h2>
            <div className="mt-10 space-y-6">
              {practicalExamples.map((ex, i) => (
                <div key={i}>
                  <h3 className="mb-1 text-[1.1rem] font-bold text-ink">{ex.title}</h3>
                  <p className="mb-3 text-[0.92rem] leading-[1.6] text-text-secondary">{ex.description}</p>
                  <div className="overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[4px_4px_0px_#1c1917]">
                    <div className="flex items-center gap-2 bg-ink px-6 py-3">
                      <div className="size-3 rounded-full bg-red-400"></div>
                      <div className="size-3 rounded-full bg-yellow-400"></div>
                      <div className="size-3 rounded-full bg-green-400"></div>
                      <span className="ml-2 font-mono text-[0.75rem] text-white/60">settings.json</span>
                    </div>
                    <pre className="overflow-x-auto bg-[#1c1917] p-6 font-mono text-[0.8rem] leading-[1.8] text-green-400">
                      <code>{ex.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Common Questions</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Frequently Asked Questions</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-[18px] border-[4px] border-ink bg-cream p-6 shadow-[4px_4px_0px_#1c1917]">
                  <h3 className="text-[1.05rem] font-bold text-ink">{faq.q}</h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.65] text-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="A">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Master Claude Code automation
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Stop reading about it. Build something.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Advanced Workflows Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                GPT Code Track
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
                { href: "/claude-code-setup", label: "Claude Code Setup", desc: "Install and configure from scratch" },
                { href: "/claude-mcp-servers", label: "MCP Servers", desc: "Extend Claude with external tools" },
                { href: "/claude-agents", label: "Claude Agents", desc: "Build autonomous AI workflows" },
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
            <Link href="/claude-code" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code</Link>
            <Link href="/claude-code-setup" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Setup</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
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
