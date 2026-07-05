import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Workflow, Clock, Bot, Repeat, Settings, Zap, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-automation`;

  const title = "Best AI Automation with ChatGPT — Hooks, Agents & Pipelines";
  const description =
    "How to automate workflows with ChatGPT. Build hooks, cron jobs, multi-agent pipelines, and CI/CD integrations. Real patterns for engineering teams, content ops, and business workflows.";

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
          alt: "AI Automation with ChatGPT — Learn to GPT",
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

const automationTypes = [
  {
    icon: Workflow,
    title: "Hooks",
    desc: "Trigger ChatGPT before or after events — code commits, file saves, API calls. ChatGPT's hook system lets you run LLM checks at key points in any developer workflow.",
  },
  {
    icon: Clock,
    title: "Cron Pipelines",
    desc: "Schedule ChatGPT to run tasks on intervals — daily reports, weekly content drafts, hourly data summaries. Combine with bash scripts for fully unattended operations.",
  },
  {
    icon: Bot,
    title: "Multi-Agent Architectures",
    desc: "Orchestrate multiple ChatGPT instances where one agent plans and others execute. Divide complex tasks across specialized agents that each run in parallel.",
  },
  {
    icon: Repeat,
    title: "Agentic Loops",
    desc: "ChatGPT plans → executes → observes → adjusts in a loop. Tool use lets ChatGPT read files, run commands, and call APIs until a goal is complete without human intervention.",
  },
  {
    icon: Settings,
    title: "CI/CD Integration",
    desc: "Add ChatGPT to your build pipeline: security review on diff, documentation generation on merge, test suggestion on PR open. ChatGPT as a smart CI step.",
  },
  {
    icon: Zap,
    title: "Event-Driven Workflows",
    desc: "Webhook receivers that invoke ChatGPT on events: new Stripe order triggers personalized email draft, new GitHub issue triggers triage summary, new form submission triggers CRM update.",
  },
];

const howToSteps = [
  {
    step: "01",
    title: "Define the trigger",
    body: "Every automation starts with an event: a cron schedule, a webhook, a file change, or a manual kick-off. Identify what should start your workflow before writing any ChatGPT logic.",
  },
  {
    step: "02",
    title: "Gather context",
    body: "ChatGPT only knows what you give it. Before invoking it, collect the relevant data: the file diff, the database record, the API response. Structure it clearly — ChatGPT reasons better over clean input.",
  },
  {
    step: "03",
    title: "Write a precise system prompt",
    body: "Automation system prompts should be specific and constrained. Define the exact output format, the decision criteria, and what to do on edge cases. Vague prompts produce unreliable automation.",
  },
  {
    step: "04",
    title: "Handle the output",
    body: "Parse ChatGPT's response and route it to the right destination: write to a file, post to Slack, update a database row, trigger the next pipeline step. Validate the structure before acting.",
  },
  {
    step: "05",
    title: "Add a human gate",
    body: "For consequential actions — sending emails, pushing code, posting publicly — route ChatGPT's output to a human review step first. Ship the automation, then tighten the gate as confidence grows.",
  },
  {
    step: "06",
    title: "Monitor and iterate",
    body: "Log every ChatGPT invocation: input, output, latency, cost. Review the worst outputs weekly. Update your system prompt to address recurring failures. Automation quality compounds over time.",
  },
];

export default async function AiAutomationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-automation`;

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
                name: "How to Automate Workflows with ChatGPT",
                description:
                  "Build hooks, cron pipelines, multi-agent architectures, and CI/CD integrations with ChatGPT.",
                url: pathForLocale(locale),
                inLanguage: locale,
                image: `${baseUrl}/og-default.png`,
                step: howToSteps.map((s) => ({
                  "@type": "HowToStep",
                  position: parseInt(s.step),
                  name: s.title,
                  text: s.body,
                })),
                isPartOf: { "@type": "WebSite", name: "Learn to GPT", url: baseUrl },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "AI Automation", item: pathForLocale(locale) },
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
                href="/courses/practitioner-setup/hooks-and-automation"
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
              <Workflow className="size-4" />
              Hooks · Agents · Pipelines
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Automate Repetitive Work with ChatGPT Hooks and Agents
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              ChatGPT is not just a chat interface. With hooks, the API, and agentic tool use, ChatGPT becomes the reasoning layer inside workflows that run autonomously — reviewing code, drafting content, triaging tickets, and updating databases without human intervention on every step.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start Learning Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-hooks"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                See How Hooks Work
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                AI automation with ChatGPT means using hooks, cron jobs, and agentic tool use to run workflows without human intervention on every step. You define triggers, provide context, and let ChatGPT handle the reasoning — from code review to content drafting to ticket triage.
              </p>
            </div>
          </div>
        </section>

        {/* AUTOMATION TYPES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Automation Patterns
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Six ways to automate with ChatGPT
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {automationTypes.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">{item.title}</div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW TO */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              How to Build a ChatGPT Automation
            </h2>
            <div className="space-y-6">
              {howToSteps.map(({ step, title, body }) => (
                <div
                  key={step}
                  className="flex gap-6 rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="flex-shrink-0 font-mono text-[2rem] font-bold text-orange">{step}</div>
                  <div>
                    <div className="mb-2 text-[1.1rem] font-bold text-ink">{title}</div>
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REAL EXAMPLES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Real Automation Examples
            </h2>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[12px]">
                <div className="size-3 rounded-full bg-[#c94040]" />
                <div className="size-3 rounded-full bg-gold" />
                <div className="size-3 rounded-full bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">automation examples</span>
              </div>
              <div className="divide-y divide-ink/10">
                {[
                  {
                    label: "Pre-commit security hook",
                    code: "claude -p 'Review this diff for security issues. Output JSON with severity and line numbers.' < git.diff",
                  },
                  {
                    label: "Daily content brief (cron)",
                    code: "0 8 * * 1-5 claude -p 'Draft 3 LinkedIn post ideas based on $(cat trending-topics.txt)' >> drafts.md",
                  },
                  {
                    label: "Webhook triage agent",
                    code: "claude -p \"Triage this GitHub issue: $(gh issue view $ID). Assign label + priority. Output JSON.\"",
                  },
                  {
                    label: "PR documentation generator",
                    code: "claude -p 'Generate a CHANGELOG entry for this PR diff.' < diff.txt >> CHANGELOG.md",
                  },
                ].map(({ label, code }) => (
                  <div key={label} className="px-6 py-5">
                    <div className="mb-2 font-mono text-[0.8rem] font-bold text-orange">{label}</div>
                    <pre className="overflow-x-auto rounded bg-linen p-3 font-mono text-[0.78rem] leading-[1.7] text-ink">
                      {code}
                    </pre>
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
              {[
                { q: "What is the best AI automation tool?", a: "For ChatGPT-based automation, the combination of the OpenAI API (for programmatic access), function calling (for connecting external services), and custom GPTs (for no-code workflows) provides the most complete automation toolkit." },
                { q: "Can I automate tasks with ChatGPT without coding?", a: "Yes. Custom GPTs and ChatGPT Actions let you build automations without writing code. For more complex workflows (API pipelines, cron jobs), basic scripting knowledge helps, but ChatGPT can write the scripts for you." },
                { q: "What tasks can I automate with ChatGPT?", a: "Common automations include document processing, email triage, data extraction, content generation, code review, report creation, and customer support. Any repetitive knowledge work is a candidate for AI automation." },
                { q: "How do I start with AI automation?", a: "Start by identifying a repetitive task you do weekly. Build a Custom GPT or API workflow for that task. Once it works manually, add scheduling with cron jobs or webhooks. Learn to GPT teaches this progression step by step." },
                { q: "Is ChatGPT automation expensive?", a: "OpenAI API pricing is usage-based. For most business automations (email processing, document summarization, data extraction), costs are a fraction of the labor they replace. GPT-4o mini handles high-volume simple tasks at minimal cost." },
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
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Automate your team&apos;s work with{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                ChatGPT
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Learn agent patterns and hook workflows in Learn to GPT.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-for-business"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Business
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                For Developers
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
                { href: "/claude-for-business", label: "ChatGPT for Business", desc: "ROI and team workflows" },
                { href: "/claude-for-developers", label: "For Developers", desc: "API, CLI, and agents" },
                { href: "/claude-code", label: "Claude Code", desc: "The terminal coding agent" },
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Build with the ChatGPT API" },
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
