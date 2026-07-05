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

  const title = "GitHub Copilot vs Claude Code vs Codex CLI: Developer Tooling Compared";
  const description =
    "Autocomplete in the IDE, an agent in the terminal, or OpenAI's Codex CLI: a working developer's comparison of GitHub Copilot and Claude Code, with the ChatGPT ecosystem angle included.";

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
          alt: "Claude Code vs GitHub Copilot | Learn to GPT",
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
    claudeCode: "Agentic by design: plans a task, edits across the repo, runs commands, iterates until done",
    copilot: "Agent features have arrived, but the product's center of gravity is still assistance while you type",
    winner: "claude" as const,
  },
  {
    category: "How much of your repo it sees",
    claudeCode: "Reads whatever files it decides are relevant, plus your CLAUDE.md conventions file",
    copilot: "Builds context from open files and workspace indexing; less direct control over what's in view",
    winner: "claude" as const,
  },
  {
    category: "IDE integration",
    claudeCode: "Lives in the terminal (including VS Code's integrated one); editor-agnostic as a result",
    copilot: "First-class citizen in VS Code, JetBrains, Neovim, and Visual Studio",
    winner: "copilot" as const,
  },
  {
    category: "Inline autocomplete",
    claudeCode: "Doesn't do keystroke completion; that's simply not the product",
    copilot: "The defining feature: ghost-text suggestions as you type, tuned over years",
    winner: "copilot" as const,
  },
  {
    category: "Multi-file refactoring",
    claudeCode: "Comfortable touching a dozen files off one instruction, then showing you the diff",
    copilot: "Multi-file edits exist via chat and agent mode; inline flow still favors local changes",
    winner: "claude" as const,
  },
  {
    category: "Debugging loops",
    claudeCode: "Reads the stack trace, reruns the failing test, patches, reruns again",
    copilot: "Chat explains the error well; the run-and-verify loop is more manual",
    winner: "claude" as const,
  },
  {
    category: "Model choice",
    claudeCode: "Anthropic models only",
    copilot: "Lets you pick the underlying model, including Claude and GPT variants, inside one subscription",
    winner: "copilot" as const,
  },
  {
    category: "GitHub platform hooks",
    claudeCode: "Full git fluency from the terminal, plus a GitHub Action; PR review is a separate setup",
    copilot: "Native PR summaries, code review, and Actions integration because GitHub owns it",
    winner: "copilot" as const,
  },
];

const useCases = [
  {
    icon: Terminal,
    title: "Pick a terminal agent (Claude Code or Codex CLI) if you…",
    points: [
      "Hand off whole tasks (\"add the endpoint, migrate the schema, make tests pass\") rather than lines",
      "Spend your day in backends, CLIs, and infra where autocomplete adds little",
      "Want the tool to run commands and read failures itself instead of narrating fixes to you",
      "Refactor across many files often enough that diff review beats hand-editing",
      "Already pay for Claude or ChatGPT and want the agent bundled with the subscription",
    ],
    accent: "bg-orange",
  },
  {
    icon: Code2,
    title: "Pick Copilot if you…",
    points: [
      "Feel the value of AI most between keystrokes, not between tasks",
      "Live in VS Code or JetBrains and want zero context-switching",
      "Ship through GitHub PRs and want review summaries where the review happens",
      "Want one subscription that can route to GPT or Claude models as they leapfrog",
      "Are on GitHub Enterprise where it's effectively already paid for",
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
                headline: "GitHub Copilot vs Claude Code vs Codex CLI: Developer Tooling Compared",
                description:
                  "A three-way look at AI developer tooling: GitHub Copilot's in-IDE assistance, Claude Code's terminal agent, and where OpenAI's Codex CLI fits for ChatGPT-ecosystem developers.",
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
                href="/courses/why-chatgpt/meet-chatgpt"
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
              Copilot, Claude Code, or Codex CLI?
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              The real split is autocomplete versus agent, not brand versus brand
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Developer AI tooling has settled into two shapes. In-IDE assistance, where GitHub Copilot defined the category, and terminal agents that take a whole task and drive it to done, where Anthropic&apos;s Claude Code and OpenAI&apos;s Codex CLI compete head-on. If you&apos;re coming from the ChatGPT side, this page maps all three: what each shape is for, where Copilot still wins, and how to decide without tribal loyalty.
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
                Short answer: they&apos;re different shapes of tool. Copilot assists inside your editor while you write each line. Claude Code (and OpenAI&apos;s Codex CLI, its closest rival) is an agent you hand a task to in the terminal; it edits files, runs tests, and comes back with a diff. Plenty of developers run one of each, and Copilot itself now lets you pick Claude or GPT models under the hood.
              </p>
            </div>
          </div>
        </section>

        {/* THE CORE DIFFERENCE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Two shapes of tool, three products
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Copilot&apos;s core loop is <strong>prediction while you type</strong>. Ghost text appears, you accept or reject, and the boilerplate tax on your day drops. It has grown chat and agent features, but the muscle memory it built the category on is keystroke-level assistance inside the editor.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The terminal agents invert the loop: <strong>you describe the outcome, the tool does the typing</strong>. Tell Claude Code or Codex CLI to add pagination, update the docs, and get the suite green, and it works through the repo, runs the tests, reads its own failures, and retries. Your job moves from writing code to reviewing diffs. Claude Code is the more mature of the two agents; Codex CLI is the natural pick if your subscription and habits are already in the ChatGPT ecosystem.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Neither shape is strictly better. Ask which part of your day you want compressed: the typing or the tasks.
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
              Claude Code and Copilot, category by category
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
              Orange checkmark = the stronger fit in that category. Both products ship updates constantly; treat this as a snapshot, and note Codex CLI tracks the Claude Code column&apos;s shape almost point for point.
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
                    <span className="text-ink">claude &quot;Every POST route needs rate limiting. Use upstash/ratelimit. Don&apos;t stop until the suite is green.&quot;</span>
                    {"\n\n"}
                    <span className="text-text-secondary"># scans the repo, finds the POST handlers</span>
                    {"\n"}
                    <span className="text-text-secondary"># adds the dependency, writes one middleware</span>
                    {"\n"}
                    <span className="text-text-secondary"># wires it into each route, extends the tests</span>
                    {"\n"}
                    <span className="text-text-secondary"># test run fails twice; it patches both causes</span>
                    {"\n\n"}
                    <span className="text-teal">✓ Suite green. Diff staged for your review.</span>
                  </code>
                </pre>
              </div>
            </div>
            <p className="mt-5 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              This is the agent shape. Codex CLI sessions look nearly identical.
            </p>
          </div>
        </section>

        {/* CAN YOU USE BOTH? */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                The pairing most developers land on
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                One in-IDE assistant plus one terminal agent. Copilot smooths the typing all day; the agent (Claude Code or Codex CLI) takes the chunky work: a feature branch, a debugging session, a refactor that touches twenty files. The two shapes don&apos;t compete for the same minutes of your day, which is why the combination feels natural rather than redundant.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Forced to pick one? Follow your bottleneck. If your slow part is producing lines of code, Copilot. If your slow part is finishing whole tasks, an agent. And if you want to defer the model question entirely, Copilot&apos;s model picker lets you run Claude or GPT under one bill while you decide.
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
                { q: "Where does OpenAI's Codex CLI fit in this comparison?", a: "Codex CLI is OpenAI's answer to Claude Code: a terminal agent that edits files, runs commands, and iterates on a task. If you already pay for ChatGPT, it's the zero-extra-cost way to try agentic coding. Claude Code is generally the more polished agent today; the gap moves with every release." },
                { q: "Is Copilot's agent mode the same thing as Claude Code?", a: "Same direction, different maturity. Copilot has been adding task-level agent features on top of an autocomplete product, while Claude Code and Codex CLI were built agent-first. For deep multi-file work with a run-test-fix loop, the terminal agents still feel more capable." },
                { q: "Which should a developer learn first in 2025?", a: "Learn the shape, not the brand. Spend a week with any terminal agent and a week with in-IDE assistance and you'll know which compresses your particular workday. The prompting skills transfer between Claude Code and Codex CLI almost unchanged." },
                { q: "Does Claude Code replace my IDE tooling?", a: "No. It runs in a terminal (including the one inside VS Code), edits files directly, and executes shell commands. It doesn't do ghost-text completion, so developers who value that keep Copilot alongside it rather than choosing between them." },
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
