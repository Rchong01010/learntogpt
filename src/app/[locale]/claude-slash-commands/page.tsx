import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Slash, Settings, Workflow, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-slash-commands`;

  const title = "Claude Code Slash Commands: Complete Reference Guide";
  const description =
    "Claude Code slash commands are shortcuts you type in the terminal to trigger specific actions — like /init to create a CLAUDE.md, /review to check your code, or /commit to stage and commit changes with an AI-generated message.";

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
          alt: "Claude Code Slash Commands — Learn to GPT",
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

const builtInCommands = [
  {
    command: "/init",
    description: "Creates a CLAUDE.md file in your project root. This file acts as persistent memory for Claude Code — it stores project conventions, architecture notes, and instructions that Claude reads at the start of every session. Running /init in an existing project scans your codebase and generates a starter CLAUDE.md automatically.",
  },
  {
    command: "/review",
    description: "Triggers a code review of your current changes. Claude examines your staged and unstaged diffs, checks for bugs, security issues, style violations, and potential improvements. It returns structured feedback you can act on immediately — no need to push to a remote and wait for CI.",
  },
  {
    command: "/commit",
    description: "Stages your changes and creates a commit with an AI-generated message. Claude analyzes the diff, writes a concise commit message that captures the 'why' rather than the 'what,' and commits. You can review and edit the message before it finalizes.",
  },
  {
    command: "/clear",
    description: "Clears the current conversation context. Useful when you are switching tasks or when the context window is getting long. Claude starts fresh with only your CLAUDE.md and project files for context.",
  },
  {
    command: "/model",
    description: "Switches the active model mid-session. Use /model opus for complex reasoning, /model sonnet for standard coding, or /model haiku for simple tasks. This lets you optimize cost and speed without restarting your session.",
  },
  {
    command: "/help",
    description: "Displays a reference of all available slash commands, keyboard shortcuts, and configuration options. A quick way to discover commands you might not know about yet.",
  },
  {
    command: "/bug",
    description: "Reports a bug to the Claude Code team. Captures your current context, session state, and the issue description so the team can reproduce and fix the problem.",
  },
  {
    command: "/config",
    description: "Opens or modifies your Claude Code configuration. You can adjust permissions, set default behaviors, configure allowed and denied commands, and manage other settings without manually editing JSON files.",
  },
];

const faqs = [
  {
    question: "Where can I find the full list of Claude Code slash commands?",
    answer: "Type /help in any Claude Code session to see every available command with descriptions. The list updates as new commands are added in Claude Code releases. You can also check the official Anthropic documentation for the most current reference.",
  },
  {
    question: "Can I share custom slash commands with my team?",
    answer: "Yes. Custom slash commands defined in your project's .claude/settings.json are committed to version control and shared with anyone who clones the repo. Team members get the same commands automatically when they start a Claude Code session in that project.",
  },
  {
    question: "Do slash commands work in VS Code or other IDEs?",
    answer: "Claude Code slash commands work in the ChatGPT Codex CLI terminal. If you use the Claude Code extension for VS Code, slash commands work in the integrated terminal panel. The commands are not IDE-specific — they work anywhere Claude Code runs.",
  },
  {
    question: "How do I create complex multi-step slash commands?",
    answer: "Define a custom slash command with a detailed prompt that describes the multi-step workflow. For example, a /deploy command could instruct Claude to run tests, build the project, check for linting errors, and then deploy — all in sequence. Claude interprets the prompt and executes each step.",
  },
];

export default async function ClaudeSlashCommandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-slash-commands`;

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
                headline: "Claude Code Slash Commands: Complete Reference Guide",
                description:
                  "Claude Code slash commands are shortcuts you type in the terminal to trigger specific actions — like /init, /review, /commit, and more.",
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
                  { "@type": "ListItem", position: 2, name: "Claude Slash Commands", item: pathForLocale(locale) },
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
              <Terminal className="size-4" />
              Claude Code · Slash Commands
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Replace Multi-Step Tasks with Single Keystrokes
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Terminal shortcuts that supercharge your workflow.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Claude Code slash commands are shortcuts you type in the terminal to trigger specific actions — like <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.95rem]">/init</code> to create a CLAUDE.md, <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.95rem]">/review</code> to check your code, or <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.95rem]">/commit</code> to stage and commit changes with an AI-generated message. They replace multi-step manual processes with single keystrokes, letting you stay in flow while Claude handles the heavy lifting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Learn ChatGPT Code <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-cheat-sheet"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Cheat Sheet
              </Link>
            </div>
          </div>
        </section>

        {/* BUILT-IN COMMANDS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Slash className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Reference
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Built-in Slash Commands
            </h2>

            <div className="space-y-4">
              {builtInCommands.map((cmd) => (
                <div key={cmd.command} className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-start gap-4 p-7">
                    <code className="mt-0.5 shrink-0 rounded-lg border-2 border-ink bg-[#1c1917] px-3 py-1.5 font-mono text-[0.95rem] font-bold text-teal">
                      {cmd.command}
                    </code>
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">
                      {cmd.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOM SLASH COMMANDS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Settings className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Customization
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Custom Slash Commands
            </h2>

            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-6 text-[1rem] leading-[1.7] text-text-secondary">
                You can define your own slash commands to automate repetitive workflows. Custom commands live in your project&apos;s <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9rem]">.claude/settings.json</code> file or in your <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9rem]">CLAUDE.md</code>. When you type the command, Claude reads the associated prompt and executes it as if you had typed it manually.
              </p>

              <div className="mb-6 overflow-hidden rounded-[12px] border-[3px] border-ink">
                <div className="flex items-center gap-2 bg-[#1c1917] px-4 py-3">
                  <div className="size-2.5 rounded-full bg-[#c94040]" />
                  <div className="size-2.5 rounded-full bg-gold" />
                  <div className="size-2.5 rounded-full bg-teal" />
                  <span className="ml-2 font-mono text-[0.75rem] text-white/50">.claude/settings.json</span>
                </div>
                <pre className="sandbox-lined p-5 font-mono text-[0.82rem] leading-[1.7] text-ink overflow-x-auto">
                  <code>{`{
  "slash_commands": {
    "/test": "Run the full test suite and report failures",
    "/deploy": "Run tests, build, then deploy to staging",
    "/doc": "Generate JSDoc comments for all exports",
    "/security": "Audit the current file for vulnerabilities"
  }
}`}</code>
                </pre>
              </div>

              <div className="space-y-4">
                <div className="border-b-[2px] border-ink/10 pb-4">
                  <div className="mb-1 font-bold text-ink">Project-level commands</div>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                    Define commands in <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.85rem]">.claude/settings.json</code> at your project root. These are shared with your team through version control. Everyone who works on the repo gets the same commands automatically.
                  </p>
                </div>
                <div className="border-b-[2px] border-ink/10 pb-4">
                  <div className="mb-1 font-bold text-ink">User-level commands</div>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                    Define personal commands in <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.85rem]">~/.claude/settings.json</code> for commands you want everywhere. These apply across all your projects and stay on your machine — not committed to any repo.
                  </p>
                </div>
                <div className="pb-0">
                  <div className="mb-1 font-bold text-ink">CLAUDE.md-based commands</div>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">
                    You can also reference slash commands in your CLAUDE.md with detailed instructions. This lets you write multi-paragraph prompts that Claude follows when the command is invoked — ideal for complex, context-heavy workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLASH COMMANDS VS REGULAR PROMPTS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <HelpCircle className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                When to Use What
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Slash Commands vs. Regular Prompts
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                  <Slash className="size-5 text-orange" />
                </div>
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Use slash commands when...</div>
                <ul className="space-y-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  <li>You repeat the same action multiple times a day</li>
                  <li>The task has a predictable, well-defined outcome</li>
                  <li>You want consistency across team members</li>
                  <li>Speed matters more than nuance</li>
                  <li>The workflow can be described in a single instruction</li>
                </ul>
              </div>

              <div className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#e0f5f1] shadow-[2px_2px_0px_#1c1917]">
                  <Terminal className="size-5 text-teal" />
                </div>
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Use regular prompts when...</div>
                <ul className="space-y-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  <li>The task requires back-and-forth conversation</li>
                  <li>You need to explain context or constraints</li>
                  <li>The problem is exploratory or ambiguous</li>
                  <li>You want Claude to ask clarifying questions</li>
                  <li>Each instance is different enough to need custom instructions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* BUILDING A WORKFLOW */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Workflow className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Workflows
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Building a Workflow with Slash Commands
            </h2>

            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-6 text-[1rem] leading-[1.7] text-text-secondary">
                The real power of slash commands emerges when you chain them into a development workflow. Here is a typical feature development cycle using slash commands at each stage:
              </p>

              <div className="space-y-4">
                {[
                  {
                    step: "1. Initialize the project",
                    command: "/init",
                    detail: "Start by running /init to ensure Claude understands your project structure. This creates or updates the CLAUDE.md with architecture details, conventions, and dependencies that Claude references throughout the session.",
                  },
                  {
                    step: "2. Write the feature",
                    command: "Regular prompt",
                    detail: "Describe the feature you want to build. Claude reads your CLAUDE.md context and implements the code across relevant files. This is conversational — you can iterate, ask questions, and refine.",
                  },
                  {
                    step: "3. Review the changes",
                    command: "/review",
                    detail: "Before committing, run /review. Claude examines every change, flags potential bugs, security issues, and style violations. Fix anything it catches before moving to the next step.",
                  },
                  {
                    step: "4. Run custom checks",
                    command: "/test or /security",
                    detail: "If you have defined custom commands for testing or security scanning, run them now. These can invoke your test suite, linters, or any project-specific validation.",
                  },
                  {
                    step: "5. Commit the work",
                    command: "/commit",
                    detail: "Claude stages the relevant files, generates a descriptive commit message based on the actual diff, and creates the commit. You review the message and approve.",
                  },
                ].map(({ step, command, detail }) => (
                  <div key={step} className="border-b-[2px] border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="font-bold text-ink">{step}</span>
                      <code className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[0.8rem] font-semibold text-teal">{command}</code>
                    </div>
                    <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{detail}</p>
                  </div>
                ))}
              </div>
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
        <section className="px-6 pb-[100px] pt-16 text-center" data-variant="B">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Master advanced Claude Code workflows
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Your first custom command. 20 minutes.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Explore Claude Code <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-cheat-sheet"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Cheat Sheet
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
                { href: "/claude-code-tutorial", label: "Claude Code Tutorial", desc: "Step-by-step getting started guide" },
                { href: "/claude-memory", label: "Claude Memory", desc: "Persistent context across sessions" },
                { href: "/claude-system-prompts", label: "System Prompts", desc: "Control Claude's behavior at scale" },
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
            &copy; {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
