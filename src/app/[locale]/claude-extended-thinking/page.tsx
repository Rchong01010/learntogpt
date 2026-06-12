import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Brain, Clock, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-extended-thinking`;

  const title = "Claude Extended Thinking: Deep Reasoning Mode Explained";
  const description =
    "Claude Extended Thinking lets Claude reason through complex problems step by step before answering. Learn when to use it, how it works, what it costs, and real examples where it outperforms standard mode.";

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
          alt: "Claude Extended Thinking — Learn to GPT",
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

const useCases = [
  {
    icon: Brain,
    title: "Multi-step math and logic",
    desc: "Competition math, proofs, formal logic, and algorithmic reasoning. Extended thinking lets Claude work through each step carefully before committing to an answer.",
    useIt: true,
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Target,
    title: "Complex coding tasks",
    desc: "Architecture decisions, debugging subtle logic errors, designing data models. Extended thinking produces more considered code with fewer edge case failures.",
    useIt: true,
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Brain,
    title: "Strategic analysis",
    desc: "Evaluating trade-offs, comparing options with multiple variables, synthesizing competing research findings. Thinking mode lets Claude hold more complexity simultaneously.",
    useIt: true,
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: AlertTriangle,
    title: "Simple factual Q&A",
    desc: "Asking what the capital of France is, or what a function returns — standard mode is faster and cheaper. Extended thinking adds latency with no accuracy benefit on simple retrieval.",
    useIt: false,
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: AlertTriangle,
    title: "Creative writing",
    desc: "For most creative tasks — drafting a blog post, brainstorming names, writing emails — standard Claude performs identically to extended thinking. The extra reasoning budget doesn't improve prose quality.",
    useIt: false,
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Clock,
    title: "Real-time applications",
    desc: "Extended thinking takes longer — sometimes significantly. If your app needs sub-2-second responses (chatbots, live search, inline suggestions), use standard mode and optimize your prompt instead.",
    useIt: false,
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const comparisonExamples = [
  {
    task: "Solve a system of equations",
    standard: "Claude gives an answer — often correct, sometimes with arithmetic errors on complex systems",
    extended: "Claude works through each substitution step, catches sign errors, and verifies the solution — dramatically higher accuracy",
    winner: "extended",
  },
  {
    task: "Debug a subtle race condition",
    standard: "Identifies the obvious suspects, may miss timing-dependent edge cases",
    extended: "Traces execution order explicitly, considers thread interleaving scenarios, produces a more complete diagnosis",
    winner: "extended",
  },
  {
    task: "Write a marketing email",
    standard: "Fast, high-quality output in seconds",
    extended: "Same quality, much slower. Not worth the wait",
    winner: "standard",
  },
  {
    task: "Design a database schema",
    standard: "Good schema for straightforward requirements",
    extended: "Considers normalization trade-offs, future query patterns, and indexing strategy more thoroughly",
    winner: "extended",
  },
];

export default async function ClaudeExtendedThinkingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-extended-thinking`;

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
                headline: "Claude Extended Thinking: Deep Reasoning Mode Explained",
                description:
                  "Extended Thinking lets Claude reason step-by-step through complex problems before answering. Learn when to use it, how it works, and real examples.",
                url: pagePath,
                inLanguage: locale,
                author: { "@type": "Organization", name: "Learn to GPT", url: baseUrl },
                publisher: { "@type": "EducationalOrganization", name: "Learn to GPT", url: baseUrl },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Extended Thinking", item: pagePath },
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
              <Link href="/courses/why-chatgpt/meet-chatgpt" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Feature Deep-Dive</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Solve Hard Problems Correctly with Extended Thinking
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Deep reasoning mode — for when the answer actually matters
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Extended Thinking gives Claude a reasoning budget — a scratchpad to think through a problem step by step before producing a final answer. On hard math, complex code, and multi-variable decisions, it dramatically improves accuracy. On simple tasks, it adds latency with no benefit.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                For Developers
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">How It Works</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">The mechanics of Extended Thinking</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">A token budget for reasoning</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  When you enable Extended Thinking via the API (or in Claude.ai for supported plans), you allocate a &quot;thinking budget&quot; in tokens. Claude uses this budget to reason through the problem in a hidden scratchpad before writing its final response. The reasoning process is visible in the API response under a <code className="rounded bg-linen px-1 py-0.5 font-mono text-[0.82rem]">thinking</code> block.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Chain-of-thought at scale</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Extended Thinking is a production-grade implementation of chain-of-thought prompting. Instead of you adding &quot;think step by step&quot; to your prompt, Claude has an internal reasoning loop with a defined token budget. This matters because Claude can reconsider and backtrack within its thinking — something you can&apos;t easily replicate with prompt engineering alone.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">API usage</div>
                <div className="mt-2 overflow-x-auto rounded-[8px] bg-[#1c1917] p-4">
                  <pre className="font-mono text-[0.82rem] leading-[1.8] text-green-400">{`import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # reasoning budget
    },
    messages=[{
        "role": "user",
        "content": "Prove that sqrt(2) is irrational."
    }]
)

# Access the thinking block
for block in response.content:
    if block.type == "thinking":
        print("Reasoning:", block.thinking)
    elif block.type == "text":
        print("Answer:", block.text)`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use it / Don't use it */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Decision Guide</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">When to use Extended Thinking</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((uc) => (
                <div key={uc.title} className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`flex size-[44px] items-center justify-center rounded-full border-[3px] border-ink ${uc.color} shadow-[2px_2px_0px_#1c1917]`}>
                      <uc.icon className={`size-4 ${uc.textColor}`} />
                    </div>
                    <span className={`rounded-full border-[2px] border-ink px-3 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wide ${uc.useIt ? "bg-teal text-white" : "bg-linen text-text-secondary"}`}>
                      {uc.useIt ? "Use It" : "Skip It"}
                    </span>
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">{uc.title}</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison examples */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Real Examples</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Standard vs Extended: what actually changes</h2>
            <div className="mt-10 space-y-4">
              {comparisonExamples.map((ex, i) => (
                <div key={i} className="overflow-hidden rounded-[16px] border-[3px] border-ink shadow-[3px_3px_0px_#1c1917]">
                  <div className="bg-ink px-5 py-3 font-bold text-[0.9rem] text-white">{ex.task}</div>
                  <div className="grid md:grid-cols-2">
                    <div className={`p-5 ${ex.winner === "extended" ? "bg-linen" : "bg-cream"}`}>
                      <div className="mb-2 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-text-secondary">Standard Mode</div>
                      <p className="text-[0.88rem] leading-[1.5] text-text-secondary">{ex.standard}</p>
                      {ex.winner === "standard" && <div className="mt-2 flex items-center gap-1 text-[0.75rem] font-bold text-teal"><CheckCircle2 className="size-3" /> Preferred</div>}
                    </div>
                    <div className={`border-l-[2px] border-ink/20 p-5 ${ex.winner === "extended" ? "bg-cream" : "bg-linen"}`}>
                      <div className="mb-2 font-mono text-[0.72rem] font-bold uppercase tracking-wide text-orange">Extended Thinking</div>
                      <p className="text-[0.88rem] leading-[1.5] text-text-secondary">{ex.extended}</p>
                      {ex.winner === "extended" && <div className="mt-2 flex items-center gap-1 text-[0.75rem] font-bold text-teal"><CheckCircle2 className="size-3" /> Preferred</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Go deeper on Claude&apos;s reasoning capabilities
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              The prompt engineering track covers thinking modes, chain-of-thought, and advanced techniques.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                For Developers
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
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Write prompts that get results" },
                { href: "/claude-for-developers", label: "For Developers", desc: "API, CLI, and agent workflows" },
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Getting started with the Claude API" },
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
            <Link href="/prompt-engineering" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Prompt Engineering</Link>
            <Link href="/claude-for-developers" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Developers</Link>
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
