import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Users, Network, GitBranch, Cpu, MessageSquare, Shield } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-multi-agent`;

  const title = "Multi-Agent Architecture with Claude Code: Complete Guide";
  const description =
    "Multi-agent architecture with Claude means running multiple specialized AI agents that coordinate to solve complex tasks — each agent handles one domain while a coordinator orchestrates the workflow.";

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
          alt: "Multi-Agent Architecture with Claude — Learn to GPT",
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
    icon: Users,
    title: "Coordinator pattern",
    desc: "A primary agent receives the task, breaks it into subtasks, and dispatches them to specialist agents. The coordinator collects results, resolves conflicts, and assembles the final output. This is the most common pattern for complex development workflows.",
  },
  {
    icon: Network,
    title: "Pipeline pattern",
    desc: "Agents are arranged in a sequential chain. Each agent processes the output of the previous one — research feeds into planning, planning feeds into implementation, implementation feeds into review. Simple to reason about, easy to debug.",
  },
  {
    icon: GitBranch,
    title: "Fan-out / fan-in",
    desc: "A dispatcher sends the same task to multiple agents working in parallel on different aspects. Results are collected and merged. Ideal for tasks like multi-file refactoring where each file can be handled independently.",
  },
  {
    icon: MessageSquare,
    title: "Peer-to-peer",
    desc: "Agents communicate directly with each other without a central coordinator. Each agent has a defined role and knows which other agents to consult. Best for loosely coupled systems where agents operate semi-autonomously.",
  },
];

const examples = [
  {
    title: "Code review + testing agents",
    description: "One agent writes feature code. A second agent reviews it for bugs, security issues, and style violations. A third agent writes and runs tests against the new code. Each agent operates in its own worktree so file changes do not conflict. The coordinator merges approved changes into the main branch.",
  },
  {
    title: "Research + writing agents",
    description: "A research agent scans documentation, APIs, and codebases to gather context. It passes structured findings to a writing agent that drafts technical documentation, README files, or architecture decision records. A review agent validates accuracy against the source material.",
  },
  {
    title: "Monitoring + remediation agents",
    description: "A monitoring agent watches logs, error rates, and deployment status on a schedule. When it detects an anomaly, it triggers a diagnostic agent that investigates root cause. If the fix is straightforward, a remediation agent applies the patch and runs regression tests before notifying the team.",
  },
  {
    title: "Full-stack development agents",
    description: "A frontend agent builds UI components while a backend agent implements API endpoints and database migrations. A third agent handles infrastructure — environment variables, deployment configs, and CI/CD pipeline updates. All three work in parallel on separate worktrees, coordinated by a planning agent that manages dependencies between tasks.",
  },
];

const faqs = [
  {
    question: "How much does multi-agent architecture cost compared to single-agent?",
    answer: "Each agent consumes its own token context, so multi-agent setups use more total tokens than a single agent. However, the tradeoff is often worth it: specialized agents with focused contexts tend to produce higher-quality output than a single agent juggling everything. You can manage costs by using lighter models (Haiku or Sonnet) for simple specialist agents and reserving Opus for the coordinator or complex reasoning tasks.",
  },
  {
    question: "What is the coordination overhead of running multiple agents?",
    answer: "The main overhead is in context passing between agents. Each handoff requires serializing the relevant state — what was done, what needs to happen next, and any constraints. In Claude Code, worktrees handle file isolation automatically, and the subagent spawning mechanism manages context passing. The overhead is typically 10-15% of total tokens, which is small compared to the quality gains from specialization.",
  },
  {
    question: "When should I use multi-agent instead of a single agent?",
    answer: "Use multi-agent when your task crosses domain boundaries (frontend + backend + infrastructure), requires parallel execution for speed, or when a single context window cannot hold all the relevant information. For tasks that fit within one domain and one context window, a single well-prompted agent is simpler and cheaper. The breakpoint is usually around 3-4 files or 2+ distinct skill domains.",
  },
  {
    question: "Can I use multi-agent architecture in production?",
    answer: "Yes. Multi-agent patterns are used in production for CI/CD pipelines, automated code review, content generation systems, and monitoring infrastructure. The key to production readiness is deterministic coordination (not relying on agents to self-organize), clear failure handling at each handoff point, and human approval gates for any destructive actions like deployments or database migrations.",
  },
];

export default async function ClaudeCodeMultiAgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-multi-agent`;

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
                headline: "Multi-Agent Architecture with Claude Code: Complete Guide",
                description:
                  "Multi-agent architecture with Claude means running multiple specialized AI agents that coordinate to solve complex tasks.",
                url: pathForLocale(locale),
                inLanguage: locale,
                image: `${baseUrl}/og-default.png`,
                author: {
                  "@type": "EducationalOrganization",
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
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Multi-Agent Architecture", item: pathForLocale(locale) },
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
              <Users className="size-4" />
              Claude Code · Multi-Agent
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Run Parallel AI Agents and Ship Full-Stack Features Faster
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Specialized agents that coordinate to solve complex problems.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Multi-agent architecture with Claude means running multiple specialized AI agents that coordinate to solve complex tasks — each agent handles one domain (code, research, testing) while a coordinator orchestrates the workflow. Instead of one agent trying to do everything, you build a team of focused agents that communicate, share state, and produce higher-quality results through specialization.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/claude-agents"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Claude Agents Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Claude Code Overview
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT IS MULTI-AGENT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Fundamentals
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What Is Multi-Agent Architecture?
            </h2>

            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-6 text-[1rem] leading-[1.7] text-text-secondary">
                In traditional single-agent setups, one Claude instance handles everything: reading code, writing code, running tests, reviewing changes, and deploying. This works for simple tasks, but it hits limits fast. A single agent&apos;s context window fills up. It loses track of earlier decisions. It switches between roles inefficiently.
              </p>
              <p className="mb-6 text-[1rem] leading-[1.7] text-text-secondary">
                Multi-agent architecture solves this by splitting responsibilities across specialized agents. Each agent has a focused role with its own context window, tools, and instructions. A coding agent only sees code. A testing agent only sees test files and results. A research agent only processes documentation and API references.
              </p>
              <p className="text-[1rem] leading-[1.7] text-text-secondary">
                The result is better output quality, faster execution (agents can work in parallel), and more reliable results because each agent operates within a narrower, well-defined scope. Think of it as the difference between a solo developer and a cross-functional team — the team has more total capacity and each member is better at their specific role.
              </p>
            </div>
          </div>
        </section>

        {/* HOW CLAUDE CODE HANDLES IT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Implementation
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How Claude Code Handles Multi-Agent
            </h2>

            <div className="space-y-6">
              {[
                {
                  icon: Cpu,
                  title: "Subagent spawning",
                  detail: "Claude Code can spawn subagents — child instances that inherit project context but operate independently. The parent agent delegates a specific task, the subagent completes it, and the result flows back. Subagents have their own context windows, so the parent agent stays focused on coordination rather than filling up its context with implementation details.",
                },
                {
                  icon: GitBranch,
                  title: "Git worktree isolation",
                  detail: "Each agent can operate in its own git worktree — a separate working directory linked to the same repository. This means multiple agents can edit files simultaneously without merge conflicts during execution. When all agents finish, changes are reviewed and merged back into the main branch. Worktrees provide true filesystem isolation with zero overhead.",
                },
                {
                  icon: Network,
                  title: "Parallel execution",
                  detail: "Independent tasks can run simultaneously across multiple agents. A frontend agent builds components while a backend agent writes API routes. Neither blocks the other. The coordinator waits for both to finish, then validates the integration points between their outputs. This cuts wall-clock time significantly for multi-domain tasks.",
                },
              ].map(({ icon: Icon, title, detail }) => (
                <div key={title} className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-center gap-4 border-b-[3px] border-ink px-7 py-4">
                    <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-4 text-orange" />
                    </div>
                    <h3 className="text-[1.1rem] font-extrabold text-ink">{title}</h3>
                  </div>
                  <div className="p-7">
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ARCHITECTURE PATTERNS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Design Patterns
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Designing Your Agent Network
            </h2>
            <p className="mx-auto mt-4 mb-10 max-w-[660px] text-center text-[1rem] leading-[1.7] text-text-secondary">
              When should you split into multiple agents? When your task crosses two or more skill domains, when parallel execution would save significant time, or when a single context window cannot hold all the information needed. Here are the four main patterns:
            </p>

            <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2">
              {architecturePatterns.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                    <Icon className="size-5 text-orange" />
                  </div>
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">{title}</div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REAL-WORLD EXAMPLES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Shield className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                In Practice
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Real-World Examples
            </h2>

            <div className="space-y-4">
              {examples.map((ex) => (
                <div key={ex.title} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                  <h3 className="mb-2 text-[1.05rem] font-bold text-ink">{ex.title}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{ex.description}</p>
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
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                  <h3 className="mb-2 text-[1.05rem] font-bold text-ink">{faq.question}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center" data-variant="A">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Build your own agent network
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Stop reading about it. Build something.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-agents"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Agents Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-tool-use"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Tool Use Guide
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
                { href: "/claude-agents", label: "Claude Agents", desc: "Agent fundamentals and patterns" },
                { href: "/claude-tool-use", label: "Tool Use", desc: "Function calling and API integration" },
                { href: "/claude-mcp-servers", label: "MCP Servers", desc: "Model Context Protocol explained" },
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
            &copy; {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
