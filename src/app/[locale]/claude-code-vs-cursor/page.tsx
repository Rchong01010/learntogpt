import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2, XCircle, Minus, Terminal, Code2, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-vs-cursor`;

  const title = "Claude Code vs Cursor: Which AI Dev Tool Wins in 2025?";
  const description =
    "Claude Code vs Cursor — a developer-focused comparison. Terminal CLI vs IDE editor, agentic autonomy vs inline edits, MCP ecosystem vs Cursor rules. Which fits your workflow?";

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
          alt: "Claude Code vs Cursor — Learn to GPT",
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
    category: "Interface",
    claudeCode: "Terminal CLI — runs anywhere bash runs, no GUI required",
    cursor: "VS Code fork — familiar IDE with AI panel built in",
    winner: "tie" as const,
  },
  {
    category: "Autonomy & agentic work",
    claudeCode: "High — reads files, writes code, runs tests, deploys end-to-end",
    cursor: "Medium — suggests and applies edits, you retain more control",
    winner: "claudecode" as const,
  },
  {
    category: "Multi-file editing",
    claudeCode: "Native — edits any file in the project tree autonomously",
    cursor: "Good via Composer — works within VS Code file context",
    winner: "claudecode" as const,
  },
  {
    category: "CI/CD and bash integration",
    claudeCode: "Native — runs shell commands, git, npm, docker as part of workflow",
    cursor: "Limited — IDE-focused, not designed for terminal automation",
    winner: "claudecode" as const,
  },
  {
    category: "Inline code completion",
    claudeCode: "Not its focus — use it for task execution, not autocomplete",
    cursor: "Excellent — Tab completion, ghost text, instant suggestions",
    winner: "cursor" as const,
  },
  {
    category: "IDE familiarity",
    claudeCode: "CLI only — steeper learning curve for GUI-first developers",
    cursor: "Drop-in VS Code replacement — zero learning curve for VS Code users",
    winner: "cursor" as const,
  },
  {
    category: "Context: CLAUDE.md / rules",
    claudeCode: "CLAUDE.md — project-specific instructions loaded automatically",
    cursor: ".cursorrules — similar per-project instruction system",
    winner: "tie" as const,
  },
  {
    category: "Model choice",
    claudeCode: "Claude 3.5 Sonnet and Opus — Anthropic models only",
    cursor: "Claude, GPT-4o, Gemini — multi-model support",
    winner: "cursor" as const,
  },
  {
    category: "Tool/MCP ecosystem",
    claudeCode: "MCP servers — connect Claude to any external tool or data source",
    cursor: "Cursor tools — growing but smaller ecosystem than MCP",
    winner: "claudecode" as const,
  },
  {
    category: "Headless / server usage",
    claudeCode: "Yes — runs on remote servers, in Docker, CI pipelines",
    cursor: "No — requires a desktop environment",
    winner: "claudecode" as const,
  },
];

const workflows = [
  {
    title: "Claude Code shines for agentic tasks",
    body: "\"Fix the failing tests, update the types, and push a commit\" — Claude Code handles this end-to-end in one command. It reads your project, makes the changes, runs the test suite, and can even open a PR. This autonomous loop is hard to replicate in a GUI editor.",
    icon: "🤖",
    tag: "Claude Code",
  },
  {
    title: "Cursor wins for inline development",
    body: "When you're in flow — writing a function, implementing a feature step by step — Cursor's Tab completion and Cmd+K inline edits are frictionless. The AI feels like a thought-completing extension of your keyboard.",
    icon: "⚡",
    tag: "Cursor",
  },
  {
    title: "Claude Code for CI and DevOps",
    body: "Claude Code runs on servers. You can invoke it from GitHub Actions, run it on a remote machine over SSH, or embed it in a deployment pipeline. Cursor requires a desktop. For server-side automation, it's not in the running.",
    icon: "🏗️",
    tag: "Claude Code",
  },
  {
    title: "Both: use CLAUDE.md / .cursorrules",
    body: "Both tools support project-level instruction files. Your CLAUDE.md (or .cursorrules) should specify your stack, conventions, testing requirements, and any rules the AI must follow. This is what separates a 10x output from a 1x output.",
    icon: "📋",
    tag: "Both",
  },
];

export default async function ClaudeCodeVsCursorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-vs-cursor`;

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
                headline: "Claude Code vs Cursor: Which AI Dev Tool Wins in 2025?",
                description:
                  "A developer-focused comparison of Claude Code (terminal CLI) and Cursor (VS Code fork) across autonomy, inline editing, CI/CD integration, and model flexibility.",
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
                  { "@type": "ListItem", position: 2, name: "Claude Code vs Cursor", item: pagePath },
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
              <Link href="/courses/why-claude/meet-claude" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Developer Comparison</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude Code vs Cursor: Terminal Power vs IDE Comfort
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Terminal autonomy vs inline IDE — pick the right tool for the job
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code is Anthropic&apos;s agentic CLI — it lives in your terminal and executes multi-step tasks autonomously. Cursor is a VS Code fork with deeply integrated AI assistance. Both are powerful. They solve different problems, and many senior engineers use both.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Learn ChatGPT Code
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

        {/* DIRECT ANSWER */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude Code is a terminal CLI that executes multi-step coding tasks autonomously &mdash; it reads your project, edits files, runs tests, and deploys. Cursor is a VS Code fork with inline AI assistance &mdash; tab completion, ghost text, and Cmd+K edits. The short answer: use Claude Code for agentic, end-to-end tasks; use Cursor for interactive, in-flow editing. Many senior engineers use both daily for different parts of their workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Quick summary cards */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[900px]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border-[4px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                    <Terminal className="size-5 text-teal" />
                  </div>
                  <div className="text-[1.3rem] font-bold text-ink">Claude Code</div>
                </div>
                <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                  Anthropic&apos;s agentic CLI. Runs in your terminal. Reads your entire project, writes code, executes commands, runs tests, and commits — all from a single natural language prompt. Built for autonomous, multi-step tasks.
                </p>
                <div className="space-y-2">
                  {["Terminal-first, works over SSH", "Reads + edits any file autonomously", "MCP ecosystem — connect any tool", "Runs in CI/CD and Docker", "CLAUDE.md for project context"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-[0.85rem] text-text-secondary">
                      <CheckCircle2 className="size-4 shrink-0 text-teal" />{f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border-[4px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                    <Code2 className="size-5 text-orange" />
                  </div>
                  <div className="text-[1.3rem] font-bold text-ink">Cursor</div>
                </div>
                <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                  A VS Code fork with AI deeply embedded in the editing experience. Tab completion, Cmd+K inline edits, and Composer for multi-file changes. The best AI coding experience for developers who want to stay in a GUI editor.
                </p>
                <div className="space-y-2">
                  {["VS Code UX — zero learning curve", "Tab completion and ghost text", "Multi-model: Claude, GPT-4o, Gemini", ".cursorrules for project context", "Composer for multi-file changes"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-[0.85rem] text-text-secondary">
                      <CheckCircle2 className="size-4 shrink-0 text-orange" />{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Feature by Feature</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Detailed comparison</h2>

            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              <div className="grid grid-cols-[1fr_1fr_1fr_100px] bg-ink px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-white max-md:grid-cols-[1fr_100px]">
                <span>Category</span>
                <span className="max-md:hidden">Claude Code</span>
                <span className="max-md:hidden">Cursor</span>
                <span className="text-center">Edge</span>
              </div>

              {comparisons.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr_100px] items-start gap-4 px-6 py-5 max-md:grid-cols-1 ${i % 2 === 0 ? "bg-cream" : "bg-linen"} border-t-[2px] border-ink/20`}
                >
                  <div className="font-bold text-ink">{row.category}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-text-secondary max-md:hidden">{row.claudeCode}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-text-secondary max-md:hidden">{row.cursor}</div>
                  <div className="flex justify-center">
                    {row.winner === "claudecode" && <CheckCircle2 className="size-6 text-teal" />}
                    {row.winner === "cursor" && <XCircle className="size-6 text-text-secondary" />}
                    {row.winner === "tie" && <Minus className="size-6 text-walnut" />}
                  </div>
                  <div className="space-y-1 text-[0.85rem] text-text-secondary md:hidden">
                    <div><span className="font-semibold text-orange">Claude Code: </span>{row.claudeCode}</div>
                    <div><span className="font-semibold text-text-secondary">Cursor: </span>{row.cursor}</div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-6 border-t-[3px] border-ink bg-linen px-6 py-4">
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary"><CheckCircle2 className="size-4 text-teal" /> Claude Code wins</div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary"><XCircle className="size-4 text-text-secondary" /> Cursor wins</div>
                <div className="flex items-center gap-2 text-[0.8rem] text-text-secondary"><Minus className="size-4 text-walnut" /> Comparable</div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow examples */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Real Workflows</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">When to use which</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {workflows.map((w, i) => (
                <div key={i} className="rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-[1.6rem]">{w.icon}</span>
                    <span className={`rounded-full border-[2px] border-ink px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-wide ${w.tag === "Claude Code" ? "bg-teal text-white" : w.tag === "Both" ? "bg-walnut text-white" : "bg-orange text-white"}`}>{w.tag}</span>
                  </div>
                  <div className="mb-2 mt-3 text-[1.1rem] font-bold text-ink">{w.title}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code example */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What a Claude Code session looks like
            </h2>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-ink px-6 py-3">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[0.75rem] text-white/60">terminal</span>
              </div>
              <div className="bg-[#1c1917] p-6 font-mono text-[0.85rem] leading-[1.8] text-green-400">
                <div><span className="text-white/40">$</span> claude</div>
                <div className="mt-2 text-white/70">&gt; Fix the failing auth tests, update the JWT expiry from 1h to 24h, and open a PR</div>
                <div className="mt-3 text-white/50">Reading project structure...</div>
                <div className="text-white/50">Found: src/auth/jwt.ts, src/auth/__tests__/jwt.test.ts</div>
                <div className="text-white/50">Editing jwt.ts — updating TOKEN_EXPIRY from 3600 to 86400...</div>
                <div className="text-white/50">Running: npm test src/auth/</div>
                <div className="text-green-400">✓ 12 tests passed</div>
                <div className="text-white/50">Running: git add -p &amp;&amp; git commit -m &quot;fix: extend JWT expiry to 24h&quot;</div>
                <div className="text-white/50">Running: gh pr create --title &quot;Fix auth tests + extend JWT expiry&quot;</div>
                <div className="text-green-400">✓ PR opened: github.com/org/repo/pull/142</div>
              </div>
            </div>
            <p className="mt-4 text-center text-[0.85rem] text-text-secondary">
              This entire flow — read, edit, test, commit, PR — happens in one Claude Code session without you touching a file.
            </p>
          </div>
        </section>

        {/* USING BOTH TOGETHER */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                The professional setup: use both
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Claude Code and Cursor are not competing for the same job. The most productive developers run Cursor as their primary editor for interactive coding &mdash; tab completion, inline edits, quick iterations &mdash; and invoke Claude Code when they need a task executed end-to-end: &quot;refactor this module, update the tests, and push a commit.&quot;
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Both tools support project-level instruction files (CLAUDE.md and .cursorrules) that tell the AI about your codebase. Keeping these in sync means both tools understand your conventions, tech stack, and coding standards.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                The decision is not either/or. It is about knowing which tool to reach for based on the task. Interactive coding in an IDE? Cursor. Autonomous multi-step workflows from the terminal? Claude Code.
              </p>
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
                  q: "Do I need to choose one or the other?",
                  a: "No. Claude Code and Cursor solve different problems. Many professional developers use Cursor for interactive editing and Claude Code for autonomous tasks like refactoring, test generation, and deployment scripts.",
                },
                {
                  q: "Can Cursor use Claude as its AI model?",
                  a: "Yes. Cursor supports multiple models including Claude, GPT-4o, and Gemini. You can use Claude inside Cursor for inline editing while also using Claude Code separately for terminal-based agentic workflows.",
                },
                {
                  q: "Which has a steeper learning curve?",
                  a: "Cursor has nearly zero learning curve if you already use VS Code. Claude Code requires comfort with the terminal and takes a few sessions to learn the command patterns and CLAUDE.md configuration. The payoff is significantly higher autonomy.",
                },
                {
                  q: "Can Claude Code replace Cursor entirely?",
                  a: "For developers who are comfortable working entirely in the terminal, yes. Claude Code can handle everything from editing to testing to deployment. But most developers prefer the visual feedback of an IDE for reading and navigating code, making the combined setup more productive.",
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

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Ready to master Claude Code?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Full track: setup, workflows, MCP, agents. Free to start.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                GPT Code Track
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

        {/* Related */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Explore More</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-code", label: "Claude Code Course", desc: "Full agentic dev track" },
                { href: "/claude-code-setup", label: "Setup Guide", desc: "Install, configure, CLAUDE.md" },
                { href: "/claude-mcp-servers", label: "MCP Servers", desc: "Extend Claude with any tool" },
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
