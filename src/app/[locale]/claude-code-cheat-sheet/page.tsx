import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Zap, Command } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-cheat-sheet`;

  const title = "Claude Code Cheat Sheet: Commands, Shortcuts & Slash Commands Reference";
  const description =
    "The complete Claude Code quick reference: slash commands, keyboard shortcuts, CLI flags, CLAUDE.md directives, and workflow patterns. Bookmark this before every session.";

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
          alt: "Claude Code Cheat Sheet — Learn to GPT",
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

const slashCommands = [
  { cmd: "/help", desc: "Show all available slash commands" },
  { cmd: "/clear", desc: "Clear conversation history and start fresh" },
  { cmd: "/compact", desc: "Compress conversation to save context window space" },
  { cmd: "/memory", desc: "View and manage memory files Claude is tracking" },
  { cmd: "/model", desc: "Switch between Claude models (opus, sonnet, haiku)" },
  { cmd: "/cost", desc: "Show token usage and cost for the current session" },
  { cmd: "/doctor", desc: "Diagnose Claude Code configuration issues" },
  { cmd: "/init", desc: "Initialize a new CLAUDE.md in the current directory" },
  { cmd: "/review", desc: "Run a code review on staged or specified files" },
  { cmd: "/commit", desc: "Generate a commit message and stage changes" },
];

const cliFlags = [
  { flag: "--print / -p", desc: "Print Claude's response to stdout without interactive mode" },
  { flag: "--model", desc: "Specify model: claude-opus-4-5, claude-sonnet-4-5, claude-haiku-4-5" },
  { flag: "--no-wait", desc: "For Vercel deploys — avoids hanging log streams" },
  { flag: "--dangerously-skip-permissions", desc: "Skip all permission prompts (CI/CD pipelines only)" },
  { flag: "--add-dir", desc: "Add a directory to Claude's allowed read paths" },
  { flag: "--max-turns", desc: "Cap agentic turns for automated runs" },
];

const claudeMdDirectives = [
  { directive: "## Commands", desc: "Build, test, lint, and deploy commands Claude should know" },
  { directive: "## Style Guide", desc: "Code formatting, naming conventions, preferred libraries" },
  { directive: "## Architecture", desc: "Tech stack, database patterns, auth setup" },
  { directive: "## Context", desc: "Who is the developer, what is the project, what matters most" },
  { directive: "## Don'ts", desc: "Explicit constraints — never select(\"*\"), never shell=True, etc." },
  { directive: "@path/to/file.md", desc: "Import another Markdown file into CLAUDE.md scope" },
];

const keyboardShortcuts = [
  { keys: "Ctrl+C", desc: "Cancel current Claude response mid-stream" },
  { keys: "Ctrl+L", desc: "Clear the terminal screen" },
  { keys: "↑ Arrow", desc: "Cycle through previous prompts" },
  { keys: "Tab", desc: "Autocomplete file paths and slash commands" },
  { keys: "Shift+Enter", desc: "Insert newline without submitting (multiline prompts)" },
];

export default async function ClaudeCodeCheatSheetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-cheat-sheet`;

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
                headline: "Claude Code Cheat Sheet: Commands, Shortcuts & Slash Commands Reference",
                description:
                  "The complete Claude Code quick reference: slash commands, keyboard shortcuts, CLI flags, CLAUDE.md directives, and workflow patterns.",
                url: pathForLocale(locale),
                inLanguage: locale,
                author: { "@type": "Organization", name: "Learn to GPT", url: baseUrl },
                publisher: { "@type": "EducationalOrganization", name: "Learn to GPT", url: baseUrl },
                isPartOf: { "@type": "WebSite", name: "Learn to GPT", url: baseUrl },
                image: `${baseUrl}/og-default.png`,
              },
              {
                "@type": "ItemList",
                name: "Claude Code Slash Commands",
                description: "All Claude Code slash commands and their descriptions",
                itemListElement: slashCommands.map((item, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: item.cmd,
                  description: item.desc,
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code Cheat Sheet", item: pathForLocale(locale) },
                ],
              },
            ],
          }),
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-[4px] border-ink bg-linen">
        <nav>
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
            <Link href="/" className="logo-serif text-[1.75rem] text-ink">
              <span className="text-gpt-green">Learn to</span> GPT
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
                Log In
              </Link>
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="px-6 pb-16 pt-[100px] text-center">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Terminal className="size-4" />
              Quick Reference Card
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Every Claude Code Command and Shortcut in One Place
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Stop reading about it. Build something.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Bookmark this page. It covers every major Claude Code command, shortcut, CLAUDE.md directive, and workflow pattern you need for productive daily development.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Full Claude Code Guide
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Setup Guide
              </Link>
            </div>
          </div>
        </section>

        {/* SLASH COMMANDS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-2 flex items-center gap-3">
              <Command className="size-6 text-orange" />
              <h2 className="text-[1.8rem] font-extrabold text-ink">Slash Commands</h2>
            </div>
            <p className="mb-6 text-[0.95rem] leading-[1.6] text-text-secondary">
              Type these inside an active Claude Code session. Press <kbd className="rounded border border-ink bg-cream px-2 py-0.5 font-mono text-[0.8rem]">Tab</kbd> to autocomplete.
            </p>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[12px]">
                <div className="size-3 rounded-full bg-[#c94040]" />
                <div className="size-3 rounded-full bg-gold" />
                <div className="size-3 rounded-full bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">slash commands</span>
              </div>
              <div className="divide-y divide-ink/10">
                {slashCommands.map(({ cmd, desc }) => (
                  <div key={cmd} className="flex items-start gap-4 px-6 py-4">
                    <code className="w-[180px] flex-shrink-0 rounded bg-[#d0f0ea] px-2 py-0.5 font-mono text-[0.85rem] font-bold text-teal">
                      {cmd}
                    </code>
                    <span className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CLI FLAGS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-2 flex items-center gap-3">
              <Terminal className="size-6 text-orange" />
              <h2 className="text-[1.8rem] font-extrabold text-ink">CLI Flags</h2>
            </div>
            <p className="mb-6 text-[0.95rem] leading-[1.6] text-text-secondary">
              Flags you pass to the <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-[0.85rem]">claude</code> command at startup.
            </p>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[12px]">
                <div className="size-3 rounded-full bg-[#c94040]" />
                <div className="size-3 rounded-full bg-gold" />
                <div className="size-3 rounded-full bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">$ claude [flags]</span>
              </div>
              <div className="divide-y divide-ink/10">
                {cliFlags.map(({ flag, desc }) => (
                  <div key={flag} className="flex items-start gap-4 px-6 py-4">
                    <code className="w-[220px] flex-shrink-0 rounded bg-[#fef3e2] px-2 py-0.5 font-mono text-[0.82rem] font-bold text-orange">
                      {flag}
                    </code>
                    <span className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CLAUDE.MD DIRECTIVES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-2 flex items-center gap-3">
              <Zap className="size-6 text-orange" />
              <h2 className="text-[1.8rem] font-extrabold text-ink">CLAUDE.md Sections</h2>
            </div>
            <p className="mb-6 text-[0.95rem] leading-[1.6] text-text-secondary">
              Recommended sections for your CLAUDE.md. Claude reads this file at session start — make every line count.
            </p>
            <div className="space-y-3">
              {claudeMdDirectives.map(({ directive, desc }) => (
                <div key={directive} className="flex items-start gap-4 rounded-[14px] border-[3px] border-ink bg-cream px-5 py-4 shadow-[3px_3px_0px_#1c1917]">
                  <code className="flex-shrink-0 rounded bg-[#d0f0ea] px-2 py-0.5 font-mono text-[0.85rem] font-bold text-teal">
                    {directive}
                  </code>
                  <span className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEYBOARD SHORTCUTS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-[1.8rem] font-extrabold text-ink">Keyboard Shortcuts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {keyboardShortcuts.map(({ keys, desc }) => (
                <div key={keys} className="flex items-center gap-4 rounded-[14px] border-[3px] border-ink bg-cream px-5 py-4 shadow-[3px_3px_0px_#1c1917]">
                  <kbd className="flex-shrink-0 rounded border-2 border-ink bg-linen px-3 py-1.5 font-mono text-[0.85rem] font-bold shadow-[2px_2px_0px_#1c1917]">
                    {keys}
                  </kbd>
                  <span className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRO TIPS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Power User Patterns
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "Start every session with /memory",
                  body: "Check what Claude remembers before diving in. Stale memory entries cause bad output. Delete outdated entries before they corrupt your session.",
                },
                {
                  title: "Use /compact aggressively on long sessions",
                  body: "Context window pressure is real. Running /compact mid-session compresses history without losing the important bits. Cheaper and faster than starting over.",
                },
                {
                  title: "Pipe output with -p for scripts",
                  body: "claude -p 'review this diff for security issues' < git.diff pipes cleanly into shell scripts. Use it in pre-commit hooks, CI checks, or batch review pipelines.",
                },
                {
                  title: "Layer CLAUDE.md files",
                  body: "Root CLAUDE.md for project-wide rules. Subdirectory CLAUDE.md for module-specific context. Claude reads both — narrower files override broader ones.",
                },
                {
                  title: "/model haiku for simple edits",
                  body: "Switch to Haiku for rename, format, or boilerplate tasks. Faster, cheaper, and frees Sonnet/Opus quota for complex reasoning work.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">→ {title}</div>
                  <p className="text-[0.9rem] leading-[1.7] text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Learn ChatGPT Code{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                hands-on
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Free interactive lessons. No credit card required.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Tutorial
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Setup Guide
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
                { href: "/claude-code", label: "Claude Code", desc: "Full tutorial and guide" },
                { href: "/claude-code-setup", label: "Setup Guide", desc: "Install and configure Claude Code" },
                { href: "/claude-memory", label: "Claude Memory", desc: "CLAUDE.md deep dive" },
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

      {/* FOOTER */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            © {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
