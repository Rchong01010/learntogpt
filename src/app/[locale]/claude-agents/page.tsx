import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Cpu, Layers, Zap, GitBranch, Terminal, Brain } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-agents`;

  const title = "Building AI Agents with Claude: Architecture & Patterns";
  const description =
    "Learn how to build production AI agents with Claude — architecture patterns, multi-agent systems, tool use, memory, and agentic loop design. From simple pipelines to full agent networks.";

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
          alt: "Building AI Agents with Claude — Learn to GPT",
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

const architecturePatterns = [
  {
    icon: Terminal,
    title: "Single-agent loop",
    desc: "One Claude instance with access to a set of tools. It receives a task, calls tools as needed, reads results, and continues looping until the task is complete or it determines it cannot proceed. The foundation of every agent architecture.",
    badge: "Start here",
  },
  {
    icon: Layers,
    title: "Orchestrator + subagent",
    desc: "An orchestrator Claude breaks a complex task into subtasks and delegates each to a specialized subagent. The subagent runs its own loop, reports back, and the orchestrator synthesizes the results. Scales well for tasks with parallelizable steps.",
    badge: "Most common",
  },
  {
    icon: GitBranch,
    title: "Parallel subagents",
    desc: "The orchestrator fans out identical or similar tasks to multiple subagent instances simultaneously — research on 10 companies, translate into 7 languages, run 5 experiments. Results converge back to the orchestrator for synthesis.",
    badge: "High throughput",
  },
  {
    icon: Brain,
    title: "Specialist network",
    desc: "A router agent classifies incoming tasks and dispatches them to domain-specialist agents — one for finance, one for code, one for legal. Each specialist has its own tools and system prompt. No single agent tries to do everything.",
    badge: "Production-grade",
  },
  {
    icon: Cpu,
    title: "Human-in-the-loop",
    desc: "The agent pauses at defined checkpoints and surfaces a decision or approval request to a human before continuing. Essential for high-stakes or irreversible actions — sending emails, committing code, executing payments.",
    badge: "Safety-first",
  },
  {
    icon: Zap,
    title: "Event-driven pipeline",
    desc: "Agents triggered by external events — a new file in S3, a webhook from Stripe, a Slack message — rather than direct user input. The agent runs, completes its task, and exits. Ideal for automation and background processing.",
    badge: "Async / automation",
  },
];

const memoryTypes = [
  {
    name: "In-context memory",
    desc: "The conversation history within a single session. Claude can reference everything said so far. Limited by the context window (200K tokens) but requires no external storage.",
    tradeoff: "Ephemeral — cleared on session end",
  },
  {
    name: "External memory (vector store)",
    desc: "Relevant documents and past interactions retrieved via semantic search and injected into the context window. Enables memory that spans sessions and scales beyond context limits.",
    tradeoff: "Retrieval quality determines effectiveness",
  },
  {
    name: "Structured state (database)",
    desc: "Agent state written to a database between steps. The agent reads its own state at the start of each turn. Enables complex multi-step workflows that survive interruptions and restarts.",
    tradeoff: "Requires explicit state schema design",
  },
  {
    name: "Episodic summaries",
    desc: "At the end of each session, a summarization pass condenses the conversation into a compact memory entry. Future sessions load the summary, not the full history.",
    tradeoff: "Lossy — fine detail may be dropped",
  },
];

export default async function ClaudeAgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-agents`;

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
                headline: "Building AI Agents with Claude: Architecture & Patterns",
                description:
                  "Learn how to build production AI agents with Claude — architecture patterns, multi-agent systems, tool use, memory, and agentic loop design.",
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
                about: [
                  { "@type": "Thing", name: "AI Agents" },
                  { "@type": "Thing", name: "Multi-agent Systems" },
                  { "@type": "Thing", name: "Claude API" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Agents", item: pathForLocale(locale) },
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
              <Cpu className="size-4" />
              Agent Architecture · Track 4 & 7
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Ship Production AI Agents from Simple Loops to Multi-Agent
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              From simple loops to networked agent systems.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              An AI agent is a system where a language model decides what actions to take, executes them using tools, observes the results, and iterates — without a human steering each step. Claude&apos;s 200K context window, native tool use, and reliable instruction-following make it one of the strongest foundations for production agent systems available today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start the Agents Course <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                API Tutorial
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT IS AN AGENT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                What makes a system an &ldquo;agent&rdquo;?
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Three things separate agents from regular LLM calls:
              </p>
              <ol className="space-y-3">
                {[
                  { n: "1", title: "Autonomous decision-making", body: "The model decides what to do next — which tool to call, what parameters to use, whether to continue or stop — without a human specifying each action." },
                  { n: "2", title: "Tool access and action execution", body: "The agent can interact with the world: query APIs, read and write files, send messages, execute code. Actions have real effects beyond generating text." },
                  { n: "3", title: "Multi-step iteration", body: "The agent observes the result of each action and uses that to inform the next decision. It runs in a loop until the task is complete, handling intermediate failures along the way." },
                ].map(({ n, title, body }) => (
                  <li key={n} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-orange font-mono text-[0.8rem] font-bold text-white">
                      {n}
                    </span>
                    <div>
                      <span className="font-bold text-ink">{title}:</span>{" "}
                      <span className="text-[0.95rem] leading-[1.7] text-text-secondary">{body}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE PATTERNS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Architecture Patterns
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              6 agent architectures, from simple to advanced
            </h2>
            <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-2 lg:grid-cols-3">
              {architecturePatterns.map(({ icon: Icon, title, desc, badge }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-orange" />
                    </div>
                    <span className="rounded-full border-[2px] border-ink bg-[#ffecd2] px-3 py-1 font-mono text-[0.7rem] font-bold text-ink">
                      {badge}
                    </span>
                  </div>
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">{title}</div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MEMORY */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Memory Systems
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How agents remember things
            </h2>
            <div className="space-y-4">
              {memoryTypes.map(({ name, desc, tradeoff }) => (
                <div
                  key={name}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-2 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                    <h3 className="font-extrabold text-ink">{name}</h3>
                    <span className="shrink-0 rounded-full border-[2px] border-ink/30 bg-linen px-3 py-1 font-mono text-[0.72rem] text-text-secondary">
                      {tradeoff}
                    </span>
                  </div>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENTIC LOOP CODE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Code Pattern
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              The agentic loop in Python
            </h2>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[14px]">
                <div className="size-3 rounded-full border-2 border-white/30 bg-[#c94040]" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-gold" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">agent_loop.py</span>
              </div>
              <div className="sandbox-lined p-7 max-md:p-5 overflow-x-auto">
                <pre className="font-mono text-[0.82rem] leading-[1.8] text-ink">
                  <code>{`def run_agent(task: str, tools: list, max_turns: int = 10):
    messages = [{"role": "user", "content": task}]

    for turn in range(max_turns):
        response = client.messages.create(
            model="claude-opus-4-5",
            tools=tools,
            messages=messages,
        )

        # Task complete — no tool calls
        if response.stop_reason == "end_turn":
            return response.content[0].text

        # Execute tool calls and collect results
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                })

        # Add assistant turn + tool results to history
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    raise RuntimeError(f"Agent did not complete in {max_turns} turns")`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Agent safety: what to get right early
              </h2>
              <div className="space-y-3">
                {[
                  "Set a max_turns limit on every agentic loop — never allow unbounded iteration",
                  "Flag irreversible actions (send email, delete record, execute payment) for human confirmation",
                  "Log every tool call with inputs and outputs — agents are hard to debug without a full action trace",
                  "Use a minimal permission model — give the agent only the tools it needs for the current task",
                  "Return structured errors from tools, not exceptions — let the agent read and respond to failures",
                  "Test with low-stakes variants of production tools before connecting to real systems",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-orange font-mono text-[0.7rem] font-bold text-white">
                      ✓
                    </span>
                    <p className="text-[0.95rem] leading-[1.6] text-text-secondary">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Build your first Claude agent
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Track 4 covers tool use, agentic loops, and multi-step workflows end-to-end.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Developers <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the API Tutorial
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
                { href: "/claude-for-developers", label: "ChatGPT for Developers", desc: "Full developer resource hub" },
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Authentication, streaming, first call" },
                { href: "/claude-tool-use", label: "Tool Use Guide", desc: "Function calling patterns and examples" },
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
