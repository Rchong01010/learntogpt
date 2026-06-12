import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Settings, Shield, Target, Layers, FileCode, Zap, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-system-prompts`;

  const title = "Best Claude System Prompts Guide & Examples";
  const description =
    "Write effective system prompts for Claude. Real examples for coding assistants, writing tools, customer support bots, and business workflows. Patterns that work, anti-patterns to avoid.";

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
          alt: "Claude System Prompts Guide — Learn to GPT",
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

const principles = [
  {
    icon: Target,
    title: "Define the role",
    desc: "Start with who Claude is in this context. Not \"You are a helpful assistant\" — that's the default. Say \"You are a senior TypeScript engineer reviewing code for a fintech startup.\" Specificity shapes every response.",
  },
  {
    icon: Layers,
    title: "Set the output contract",
    desc: "Specify format, length, and structure explicitly. \"Respond in JSON with keys: summary, risk_level, action_items\" removes ambiguity. Claude will honor format contracts consistently when they are part of the system prompt.",
  },
  {
    icon: Shield,
    title: "Constrain the scope",
    desc: "Tell Claude what not to do. \"Do not speculate on topics outside the provided context. If unsure, say 'I don't know' and list what additional information would help.\" Constraints prevent hallucination drift.",
  },
  {
    icon: Settings,
    title: "Inject standing context",
    desc: "Include facts that are always true: the user's company, product category, audience, technical level, or business constraints. Claude uses this as grounding for every response.",
  },
  {
    icon: FileCode,
    title: "Provide examples",
    desc: "One concrete input/output example in the system prompt is worth 300 words of instruction. Show Claude exactly what a good response looks like for the hardest case.",
  },
  {
    icon: Zap,
    title: "Handle edge cases explicitly",
    desc: "Think through what happens when the user sends something off-topic, ambiguous, or adversarial. Specify exactly how Claude should handle it — not \"use judgment,\" but \"respond with: [exact template].\"",
  },
];

const systemPromptExamples = [
  {
    label: "Code Review Assistant",
    prompt: `You are a senior software engineer conducting code reviews for a TypeScript/Next.js codebase.

For every code snippet provided:
1. Identify security vulnerabilities (SQL injection, XSS, exposed secrets, missing auth)
2. Flag performance issues (N+1 queries, unoptimized re-renders, missing caching)
3. Note code style violations (no any types, explicit column selects only, parameterized queries)
4. Suggest specific rewrites for issues found

Output format:
{
  "risk_level": "critical|high|medium|low",
  "issues": [{"line": N, "type": "security|perf|style", "description": "...", "fix": "..."}],
  "approved": true|false
}

If the snippet is safe and clean, output: {"risk_level": "low", "issues": [], "approved": true}`,
  },
  {
    label: "Customer Support Bot",
    prompt: `You are a support agent for [Product Name], a project management SaaS tool.

Context:
- Users range from individual freelancers to enterprise teams
- Common issues: billing questions, integration errors, permission problems, import failures
- Escalate to human agent if: refund request over $500, data loss reported, account compromised

Response rules:
- Answer in 3 sentences or fewer for simple questions
- Use numbered steps for any multi-step process
- Never speculate about timelines or make promises ("Your issue will be resolved by...")
- End every response with: "Was this helpful? Reply 'yes', 'no', or describe what you still need."

If you cannot answer confidently, say: "I'll flag this for our team — please expect a reply within one business day."`,
  },
  {
    label: "Content Editor",
    prompt: `You are a professional editor for a B2B SaaS marketing team.

Brand voice: direct, expert, never jargon-heavy. Second-person ("you"), active voice, sentences under 20 words.

Never use: "leverage", "synergy", "game-changing", "unlock potential", "robust", exclamation points, or em dashes.

When editing:
1. Preserve the author's ideas and examples — change words, not meaning
2. Flag any claims that need a source with [CITE NEEDED]
3. Note if the opening hook is weak and suggest an alternative
4. Output the edited version followed by a 3-bullet change summary

For subject line or headline tasks: provide 5 variants with the primary goal (curiosity/benefit/urgency/social proof/question) labeled for each.`,
  },
];

const antiPatterns = [
  {
    bad: "Be helpful, accurate, and concise.",
    why: "This is the default — it tells Claude nothing about your specific context.",
    fix: "Define who Claude is, what it's helping with, and exactly what output format to use.",
  },
  {
    bad: "Always be positive and encouraging.",
    why: "Tone instructions without examples produce generic warmth, not your actual brand voice.",
    fix: "Show the tone with a concrete before/after example in the system prompt.",
  },
  {
    bad: "Never make up information.",
    why: "Negative constraints on complex behaviors are hard to enforce without specifics.",
    fix: "\"If you're not confident, output: 'I'm not certain — here's what I'd need to know: [list]'\" gives Claude a template to follow.",
  },
  {
    bad: "You are an expert in everything.",
    why: "Broad expertise claims reduce calibration. Claude hedges less when it should hedge more.",
    fix: "Specify the actual domain: \"You are an expert in HIPAA compliance for healthcare SaaS startups.\"",
  },
];

const howToSteps = [
  { step: "01", title: "Start with role and context", body: "Write one sentence describing who Claude is in this application. Specific job title + company type + audience level." },
  { step: "02", title: "Define the output format", body: "Specify structure, length, and any required fields. JSON, markdown, bullet points, word count targets — whatever your downstream system expects." },
  { step: "03", title: "List explicit constraints", body: "What Claude must never do. Edge case behavior. How to handle uncertainty. Escalation triggers." },
  { step: "04", title: "Inject standing facts", body: "Company name, product context, user segment, technical level. Anything that's always true about the user." },
  { step: "05", title: "Add one worked example", body: "Input → output. Pick the hardest real case. This calibrates Claude faster than any instruction block." },
  { step: "06", title: "Test on adversarial inputs", body: "Try off-topic questions, vague requests, and edge cases. Update the system prompt to handle each one explicitly." },
];

export default async function ClaudeSystemPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-system-prompts`;

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
                name: "How to Write Effective Claude System Prompts",
                description:
                  "Write effective system prompts for Claude. Real examples, patterns, and anti-patterns for coding, support, and content workflows.",
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
                  { "@type": "ListItem", position: 2, name: "Claude System Prompts", item: pathForLocale(locale) },
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
                href="/courses/why-chatgpt/context-is-everything"
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
              <Settings className="size-4" />
              Patterns, Examples &amp; Anti-patterns
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Write System Prompts That Make Claude Do Exactly What You Need
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              A well-written system prompt turns Claude from a general-purpose assistant into a precise, specialized tool. Whether you are building a product with the API or setting up a Claude Project for your team, the system prompt defines the ceiling of what Claude can reliably do for you.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Prompt Engineering Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Prompt Templates
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                A Claude system prompt is a set of instructions that runs before any conversation and shapes every response. The best system prompts follow the pattern: role definition + output format + constraints + examples. Claude follows structured system prompts with high fidelity.
              </p>
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Six Core Principles
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What every good system prompt must do
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {principles.map((item, i) => {
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

        {/* HOW TO STEPS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              How to Write a System Prompt (6 Steps)
            </h2>
            <div className="space-y-6">
              {howToSteps.map(({ step, title, body }) => (
                <div key={step} className="flex gap-6 rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
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
              Real System Prompt Examples
            </h2>
            <div className="space-y-8">
              {systemPromptExamples.map(({ label, prompt }) => (
                <div key={label} className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
                  <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[12px]">
                    <div className="size-3 rounded-full bg-[#c94040]" />
                    <div className="size-3 rounded-full bg-gold" />
                    <div className="size-3 rounded-full bg-teal" />
                    <span className="ml-auto font-mono text-[0.75rem] text-white/60">{label}</span>
                  </div>
                  <div className="p-6">
                    <pre className="overflow-x-auto font-mono text-[0.8rem] leading-[1.8] text-ink whitespace-pre-wrap">
                      {prompt}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ANTI-PATTERNS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              System Prompt Anti-Patterns
            </h2>
            <div className="space-y-4">
              {antiPatterns.map(({ bad, why, fix }) => (
                <div key={bad} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 rounded bg-[#fde8e8] p-3 font-mono text-[0.85rem] text-[#c94040]">
                    ✗ &quot;{bad}&quot;
                  </div>
                  <p className="mb-2 text-[0.9rem] text-text-secondary"><strong className="text-ink">Why it fails:</strong> {why}</p>
                  <p className="text-[0.9rem] text-text-secondary"><strong className="text-ink">Fix:</strong> {fix}</p>
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
              {[
                { q: "What is the best Claude system prompt?", a: "The best system prompts are specific, structured, and include role definition, output format, constraints, and examples. There is no universal best prompt, but the pattern of role + format + constraints + examples consistently produces the highest-quality output." },
                { q: "How long should a system prompt be?", a: "As long as it needs to be. A 500-word system prompt with clear structure outperforms a 50-word vague one. Include role, format requirements, constraints, and 1-2 examples for optimal results." },
                { q: "What is the difference between a system prompt and a user prompt?", a: "A system prompt runs before any conversation and shapes all responses. A user prompt is a single message within a conversation. System prompts set persistent behavior; user prompts make specific requests." },
                { q: "Can I use system prompts in Claude.ai?", a: "Yes. Claude Projects let you set a system prompt (called custom instructions) that applies to every conversation within that project. In the API, system prompts are passed as the system parameter." },
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
              Master{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                prompt engineering
              </em>{" "}
              hands-on
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Interactive exercises that build real prompting instincts.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                20 Prompt Templates
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
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Full course on prompting" },
                { href: "/best-claude-prompts", label: "Best Prompts", desc: "20 copy-paste templates" },
                { href: "/claude-for-developers", label: "For Developers", desc: "API and agent patterns" },
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
