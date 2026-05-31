import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Code2, Wrench, Zap, GitBranch, Layers } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-tutorial`;

  const title = "Claude Code Tutorial: From Installation to First Project";
  const description =
    "Step-by-step Claude Code tutorial — install Claude Code, configure your project with CLAUDE.md, run your first agentic task, and learn the commands that matter. Hands-on, not theoretical.";

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
          alt: "Claude Code Tutorial — Learn to GPT",
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

const tutorialSteps = [
  {
    number: "01",
    title: "Install Claude Code",
    description: "Claude Code is a Node.js CLI. You need Node 18+ installed. One command gets you there.",
    code: `# Install globally via npm
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
# → claude 1.x.x`,
    note: "You'll need an OpenAI API key. Get one at console.anthropic.com.",
  },
  {
    number: "02",
    title: "Authenticate",
    description: "Run the login command. Claude Code will open a browser window to authenticate with your Anthropic account, or you can provide an API key directly.",
    code: `# Authenticate with your Anthropic account
claude login

# Or set API key directly in your environment
export ANTHROPIC_API_KEY=sk-ant-...

# Verify auth works
claude "Say hello"`,
    note: "For team environments, use ANTHROPIC_API_KEY in your CI/CD secrets.",
  },
  {
    number: "03",
    title: "Create your CLAUDE.md file",
    description: "CLAUDE.md is how you give Claude persistent context about your project — tech stack, conventions, commands, and anything it should always know. Create it in your project root.",
    code: `# In your project root
cat > CLAUDE.md << 'EOF'
# My Project

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS
- Supabase (postgres), Vercel deployment

## Key Commands
- \`npm run dev\` — local dev server
- \`npm run build\` — production build
- \`npm test\` — run test suite

## Conventions
- Use TypeScript strict mode
- Components in src/components/
- API routes in src/app/api/
- Never use \`any\` type
EOF`,
    note: "Claude reads CLAUDE.md at the start of every session. Update it as your project evolves.",
  },
  {
    number: "04",
    title: "Run your first agentic task",
    description: "Now the interesting part. Describe a task in plain language. Claude will read your project, plan the changes, and execute them.",
    code: `# Start Claude Code in your project directory
cd my-project
claude

# Or send a one-shot task
claude "Add input validation to all form fields
in src/components/ContactForm.tsx. Use zod.
Include error messages under each field."

# Claude will:
# 1. Read your project structure
# 2. Plan the changes
# 3. Edit the file(s)
# 4. Show you a diff to review`,
    note: "For risky operations, Claude will ask for confirmation before executing.",
  },
  {
    number: "05",
    title: "Master the key commands",
    description: "Claude Code has a small set of commands that unlock the full workflow — slash commands for common operations, keyboard shortcuts for navigation.",
    code: `# Inside a Claude Code session:

/clear          # Clear context, start fresh
/compact        # Summarize context to save tokens
/cost           # Show token usage for this session
/review         # Ask Claude to review its own output

# Exit modes
Ctrl+C          # Cancel current operation
/exit           # End session

# One-shot from terminal
claude -p "explain this codebase structure"
claude --continue  # Resume last session`,
    note: "Use /compact frequently in long sessions to avoid context overflow.",
  },
  {
    number: "06",
    title: "Run tests and iterate",
    description: "Give Claude your test command. It will run the suite, read failures, fix them, and re-run until passing. This is the core loop that makes agentic coding powerful.",
    code: `claude "Add unit tests for the auth utilities
in src/lib/auth.ts. Run the tests after writing
them and fix any failures before stopping."

# Claude will:
# 1. Read src/lib/auth.ts
# 2. Write test file
# 3. Run: npm test
# 4. Read failures
# 5. Fix implementation or tests
# 6. Re-run until green`,
    note: "Always specify your test command in CLAUDE.md so Claude knows how to run them.",
  },
];

const proTips = [
  {
    icon: Wrench,
    title: "Write your CLAUDE.md before starting any session",
    body: "A well-written CLAUDE.md saves dozens of minutes per session. Include your test commands, build commands, linting setup, and any conventions Claude should follow. Treat it like onboarding documentation for a new developer.",
  },
  {
    icon: Zap,
    title: "Be specific about success criteria",
    body: "\"Add a button\" leaves too much ambiguous. \"Add a primary CTA button with the text 'Get Started', orange background, border-radius 24px, linking to /sign-up, above the fold on mobile\" gives Claude what it needs to succeed on the first attempt.",
  },
  {
    icon: GitBranch,
    title: "Use git checkpoints before large tasks",
    body: "Before you give Claude a big refactor or a multi-file task, commit what you have. If Claude's changes go in an unexpected direction, you can reset cleanly. Treat Claude like a pair programmer, not an undo button.",
  },
  {
    icon: Code2,
    title: "Review diffs, not just outcomes",
    body: "Claude shows you its changes as a diff before applying them. Read the diff. Not because Claude makes mistakes often, but because reviewing what changed is how you stay in the driver's seat and catch anything that wasn't what you intended.",
  },
];

export default async function ClaudeCodeTutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-tutorial`;

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
                name: "Claude Code Tutorial: From Installation to First Project",
                description:
                  "Step-by-step guide to installing Claude Code, configuring CLAUDE.md, running your first agentic task, and mastering the commands that matter.",
                url: pathForLocale(locale),
                inLanguage: locale,
                image: `${baseUrl}/og-default.png`,
                step: tutorialSteps.map((s, i) => ({
                  "@type": "HowToStep",
                  position: i + 1,
                  name: s.title,
                  text: s.description,
                })),
                tool: [
                  { "@type": "HowToTool", name: "Node.js 18+" },
                  { "@type": "HowToTool", name: "npm" },
                  { "@type": "HowToTool", name: "OpenAI API key" },
                ],
                supply: [
                  { "@type": "HowToSupply", name: "OpenAI API key" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code Tutorial", item: pathForLocale(locale) },
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
          <div className="mx-auto max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Terminal className="size-4" />
              Track 6: Practitioner Setup
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Your First Agentic Coding Session in 30 Minutes
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Installation to first project in under 30 minutes.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              This is the hands-on tutorial. Not an overview of what Claude Code can do — a step-by-step walkthrough of actually setting it up, configuring your project, and running your first agentic coding task. Concrete commands, real examples, what to expect at each step.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start the Tutorial <ArrowRight className="size-5" />
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

        {/* PREREQUISITES */}
        <section className="px-6 py-8">
          <div className="mx-auto max-w-[800px]">
            <div className="flex flex-wrap items-center gap-3 rounded-[16px] border-[3px] border-ink bg-cream p-5 shadow-[3px_3px_0px_#1c1917]">
              <span className="font-mono text-[0.8rem] font-bold text-text-secondary uppercase tracking-widest">Prerequisites:</span>
              {["Node.js 18+", "npm or npx", "OpenAI API key", "Terminal access"].map((req) => (
                <span key={req} className="rounded-full border-[2px] border-ink bg-linen px-3 py-1 font-mono text-[0.78rem] font-semibold text-ink">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* TUTORIAL STEPS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Step-by-Step Tutorial
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              From zero to first agentic task
            </h2>

            <div className="space-y-8">
              {tutorialSteps.map((step) => (
                <div key={step.number} className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-center gap-4 border-b-[3px] border-ink px-7 py-4">
                    <span className="font-mono text-[1.4rem] font-extrabold text-orange">{step.number}</span>
                    <h3 className="text-[1.1rem] font-extrabold text-ink">{step.title}</h3>
                  </div>
                  <div className="p-7">
                    <p className="mb-4 text-[1rem] leading-[1.7] text-text-secondary">{step.description}</p>
                    <div className="mb-4 overflow-hidden rounded-[12px] border-[3px] border-ink">
                      <div className="flex items-center gap-2 bg-[#1c1917] px-4 py-3">
                        <div className="size-2.5 rounded-full bg-[#c94040]" />
                        <div className="size-2.5 rounded-full bg-gold" />
                        <div className="size-2.5 rounded-full bg-teal" />
                        <span className="ml-auto font-mono text-[0.7rem] text-white/50">terminal</span>
                      </div>
                      <pre className="sandbox-lined overflow-x-auto p-5 font-mono text-[0.82rem] leading-[1.7] text-ink">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                    {step.note && (
                      <div className="flex items-start gap-2 rounded-[10px] border-[2px] border-ink/20 bg-linen px-4 py-3">
                        <span className="mt-0.5 font-mono text-[0.75rem] font-bold text-orange">NOTE</span>
                        <p className="text-[0.88rem] leading-[1.6] text-text-secondary">{step.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRO TIPS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Pro Tips
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What experienced users do differently
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {proTips.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                    <Icon className="size-4 text-orange" />
                  </div>
                  <h3 className="mb-2 font-extrabold text-ink">{title}</h3>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT'S NEXT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                What to build first
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The best first project is something you actually want — a small tool, a script that automates something tedious at work, or a feature in an existing project. Start with something you understand well enough to review Claude&apos;s output intelligently.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Good first tasks: add validation to a form, write tests for an existing function, refactor a component that&apos;s grown too large, add a database query with pagination. Bad first tasks: &ldquo;build me a startup&rdquo; or anything where you can&apos;t evaluate whether the output is correct.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Go deeper with Track 6
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Interactive lessons cover everything this tutorial introduces — plus slash commands, memory, hooks, and advanced workflows.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Overview <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Full Setup Guide
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
                { href: "/claude-code", label: "Claude Code", desc: "Full overview and feature guide" },
                { href: "/claude-code-setup", label: "Setup Guide", desc: "CLAUDE.md, config, and first session" },
                { href: "/claude-vs-copilot", label: "Claude vs Copilot", desc: "How they compare as coding tools" },
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
