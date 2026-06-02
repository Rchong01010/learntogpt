import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, XCircle, Minus, Terminal, Code2, GitBranch, Layers, Cpu, Zap, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-vs-copilot`;

  const title = "Claude vs Copilot: Complete AI Coding Comparison (2025)";
  const description =
    "Claude Code vs GitHub Copilot — which AI coding tool is right for you? Honest feature-by-feature comparison covering IDE integration, autonomous tasks, context window, and real-world use cases.";

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
          alt: "Claude Code vs GitHub Copilot — Learn to GPT",
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
    category: "Autonomous task execution",
    claudeCode: "Full agentic mode — reads, edits, runs, and tests multi-file projects end-to-end",
    copilot: "Copilot Workspace (preview) — still mostly single-file suggestions",
    winner: "claude" as const,
  },
  {
    category: "Context window",
    claudeCode: "200K tokens — ingests entire codebases, READMEs, and docs in one pass",
    copilot: "~8K–128K (model-dependent) — truncates large files silently",
    winner: "claude" as const,
  },
  {
    category: "IDE integration",
    claudeCode: "Terminal-native; VS Code extension available; works in any editor via terminal",
    copilot: "Deep VS Code, JetBrains, Neovim, and Visual Studio integration out of the box",
    winner: "copilot" as const,
  },
  {
    category: "Inline autocomplete",
    claudeCode: "Not the primary mode — optimized for agentic sessions, not keystroke completions",
    copilot: "Industry-leading inline suggestions — trained on billions of code lines",
    winner: "copilot" as const,
  },
  {
    category: "Multi-file refactoring",
    claudeCode: "Natively understands whole-project structure; modifies 10+ files in one command",
    copilot: "Improving, but Workspace still beta; single-file edits more reliable",
    winner: "claude" as const,
  },
  {
    category: "Debugging & root cause analysis",
    claudeCode: "Reads stack traces, runs tests, proposes and applies fixes autonomously",
    copilot: "Chat explains errors; does not execute or iterate automatically",
    winner: "claude" as const,
  },
  {
    category: "Test generation",
    claudeCode: "Writes tests, runs them, reads failures, and fixes the implementation",
    copilot: "Generates test stubs well; does not close the write-run-fix loop",
    winner: "claude" as const,
  },
  {
    category: "GitHub workflow integration",
    claudeCode: "Works with git via terminal; no native PR review or Actions hooks",
    copilot: "Native PR review summaries, Actions integration, and Copilot for Docs",
    winner: "copilot" as const,
  },
];

const useCases = [
  {
    icon: Terminal,
    title: "Choose Claude Code if you…",
    points: [
      "Work on large codebases that exceed typical context limits",
      "Want an agent that can take a task from prompt to tested commit autonomously",
      "Build APIs, backends, or CLIs where IDE autocomplete is less critical",
      "Run complex refactors across dozens of files in a single session",
      "Prefer a conversation-first interface over keystroke-level suggestions",
    ],
    accent: "bg-orange",
  },
  {
    icon: Code2,
    title: "Choose Copilot if you…",
    points: [
      "Live in VS Code or JetBrains and rely on inline completions all day",
      "Work in a GitHub-first team that uses PRs and Actions heavily",
      "Need suggestions as you type, not just when you ask a question",
      "Code primarily in one or two files at a time, not whole projects",
      "Are already on a GitHub Enterprise plan where Copilot is bundled",
    ],
    accent: "bg-teal",
  },
];

export default async function ClaudeVsCopilotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-vs-copilot`;

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
                headline: "Claude Code vs GitHub Copilot: Full Comparison 2025",
                description:
                  "Honest feature-by-feature comparison of Claude Code and GitHub Copilot covering autonomous task execution, IDE integration, context window, and real-world use cases.",
                url: pathForLocale(locale),
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
                image: `${baseUrl}/og-default.png`,
                dateModified: new Date().toISOString(),
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code vs GitHub Copilot", item: pathForLocale(locale) },
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
              <Link
                href="/curriculum"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden"
              >
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                Log In
              </Link>
              <Link
                href="/courses/why-claude/meet-claude"
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
          <div className="mx-auto max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <GitBranch className="size-4" />
              AI Coding Tools Compared
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude Code vs GitHub Copilot
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Two tools. Different philosophies. One right choice for your workflow.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              GitHub Copilot pioneered AI-assisted coding with keystroke-level autocomplete. Claude Code takes a different bet: an autonomous agent that reads your whole project, plans, edits, runs tests, and iterates — without you steering every step. This comparison breaks down what each tool actually does well, where each falls short, and which one fits your workflow.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Explore Claude Code <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude Code and GitHub Copilot solve different problems. Claude Code is a terminal agent that handles multi-file refactoring, testing, and deployment autonomously. Copilot is an IDE plugin that provides inline code suggestions as you type. Many developers use both together.
              </p>
            </div>
          </div>
        </section>

        {/* THE CORE DIFFERENCE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                The fundamental difference
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Copilot is a <strong>suggestion engine</strong>. It watches you type and predicts the next line, block, or function. It&apos;s exceptionally good at this — trained on billions of lines of public code, it catches patterns you might miss and autocompletes boilerplate at speed.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Claude Code is an <strong>autonomous agent</strong>. You describe a task — &quot;add pagination to the user list, write tests, update the API docs&quot; — and it reads your project structure, understands your patterns, makes changes across multiple files, runs your test suite, reads the failures, and fixes them. You review the diff when it&apos;s done.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Neither approach is universally better. The question is which workflow matches how you actually build software.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Feature Breakdown
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Head-to-head comparison
            </h2>

            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b-[4px] border-ink bg-[#1c1917] px-6 py-4 max-md:hidden">
                <div className="font-mono text-[0.8rem] font-bold uppercase tracking-widest text-white/60">Category</div>
                <div className="font-mono text-[0.8rem] font-bold uppercase tracking-widest text-orange">Claude Code</div>
                <div className="font-mono text-[0.8rem] font-bold uppercase tracking-widest text-white/60">GitHub Copilot</div>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr] gap-4 px-6 py-5 max-md:grid-cols-1 ${i < comparisons.length - 1 ? "border-b-[2px] border-ink/20" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {row.winner === "claude" ? (
                        <CheckCircle2 className="size-4 text-orange" />
                      ) : row.winner === "copilot" ? (
                        <XCircle className="size-4 text-text-secondary" />
                      ) : (
                        <Minus className="size-4 text-text-secondary" />
                      )}
                    </div>
                    <span className="font-bold text-ink max-md:text-[0.95rem]">{row.category}</span>
                  </div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary max-md:pl-6">
                    <span className="mb-1 block font-semibold text-orange md:hidden">Claude Code</span>
                    {row.claudeCode}
                  </div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary max-md:pl-6">
                    <span className="mb-1 block font-semibold text-ink md:hidden">GitHub Copilot</span>
                    {row.copilot}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[0.8rem] text-text-secondary">
              Orange checkmark = stronger in that category. Comparison reflects capabilities as of 2025.
            </p>
          </div>
        </section>

        {/* USE CASE SPLIT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Which tool fits your workflow?
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Use cases by tool
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {useCases.map(({ icon: Icon, title, points, accent }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]"
                >
                  <div className={`mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink ${accent} shadow-[2px_2px_0px_#1c1917]`}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <h3 className="mb-4 text-[1.15rem] font-extrabold text-ink">{title}</h3>
                  <ul className="space-y-2">
                    {points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REAL-WORLD WORKFLOW */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              In Practice
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What a real session looks like
            </h2>

            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[14px]">
                <div className="size-3 rounded-full border-2 border-white/30 bg-[#c94040]" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-gold" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">claude-code session</span>
              </div>
              <div className="sandbox-lined p-7 max-md:p-5">
                <pre className="font-mono text-[0.85rem] leading-[32px] text-ink">
                  <code>
                    <span className="text-orange">$ </span>
                    <span className="text-ink">claude &quot;Add rate limiting to all POST endpoints. Use upstash/ratelimit. Tests must pass.&quot;</span>
                    {"\n\n"}
                    <span className="text-text-secondary"># Claude reads your project structure</span>
                    {"\n"}
                    <span className="text-text-secondary"># Identifies 6 POST endpoints across 3 files</span>
                    {"\n"}
                    <span className="text-text-secondary"># Installs dependency, writes middleware</span>
                    {"\n"}
                    <span className="text-text-secondary"># Applies to each route, updates tests</span>
                    {"\n"}
                    <span className="text-text-secondary"># Runs: npm test → 2 failures → fixes them</span>
                    {"\n\n"}
                    <span className="text-teal">✓ All 47 tests pass. Ready to review.</span>
                  </code>
                </pre>
              </div>
            </div>
            <p className="mt-5 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              One prompt. Full task loop. No manual steering.
            </p>
          </div>
        </section>

        {/* CAN YOU USE BOTH? */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Can you use both?
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Yes — and many developers do. Copilot handles inline suggestions while you type. Claude Code handles the bigger, higher-effort tasks: feature implementation, debugging sessions, refactoring runs. Think of Copilot as your typing accelerator and Claude Code as your autonomous junior developer.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                If you have to pick one, the decision comes down to your primary workflow. Autocomplete-heavy coding in a single IDE? Copilot wins. Agentic, multi-file tasks with an AI that closes the loop? Claude Code wins.
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
                { q: "Is Claude Code better than GitHub Copilot?", a: "They solve different problems. Claude Code is a terminal agent for multi-step tasks (refactoring, testing, deployment). Copilot is an IDE tool for inline suggestions. Claude Code handles complexity; Copilot handles flow." },
                { q: "Can I use Claude Code and Copilot together?", a: "Yes. Many developers use Copilot for inline code suggestions while coding and Claude Code for larger tasks like refactoring, debugging, and multi-file operations. They complement each other." },
                { q: "Which AI coding tool should I learn first?", a: "Start with Claude Code if you want autonomous development capabilities. Start with Copilot if you want inline coding assistance." },
                { q: "Does Claude Code work in VS Code?", a: "Claude Code runs in the terminal, including the integrated terminal in VS Code. It reads your entire project directory, edits files directly, and runs shell commands. It is not an inline autocomplete extension like Copilot." },
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

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Ready to try Claude Code?
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Learn the agentic workflow from first install to production.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                See Claude Code <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-code", label: "Claude Code", desc: "Agentic coding from first install" },
                { href: "/claude-for-developers", label: "ChatGPT for Developers", desc: "API, agents, and CLI deep dive" },
                { href: "/claude-vs-chatgpt", label: "Claude vs ChatGPT", desc: "Full model comparison" },
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
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            © {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
