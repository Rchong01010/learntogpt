import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Users, MessageSquare, Code2, Bug, Layers, Lightbulb, Terminal } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-pair-programming`;

  const title = "AI Pair Programming with ChatGPT: A Practical Guide (2025)";
  const description =
    "AI pair programming with ChatGPT means having an AI partner that reads your code, suggests implementations, writes tests, and catches bugs — all through natural conversation in your terminal or IDE.";

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
          alt: "AI Pair Programming with ChatGPT — Learn to GPT",
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

const faqs = [
  {
    q: "Will AI pair programming replace human pair programming?",
    a: "No. Human pairing builds team culture, transfers tacit knowledge, and creates shared ownership of code. AI pairing solves different problems — it is available 24/7, never gets impatient, and can hold massive codebases in context. The best teams use both: AI for velocity, humans for alignment and mentorship.",
  },
  {
    q: "Is AI pair programming better for junior or senior developers?",
    a: "Both benefit, but differently. Junior developers get an always-available mentor that explains patterns, catches mistakes, and demonstrates best practices. Senior developers get a force multiplier — offloading boilerplate, generating test scaffolds, and exploring multiple implementation approaches in parallel. Seniors tend to get more value because they can evaluate and direct AI output more effectively.",
  },
  {
    q: "Does AI pair programming produce lower quality code?",
    a: "Not when used correctly. AI-generated code reflects the quality of your instructions. With a well-configured CLAUDE.md, explicit conventions, and code review, AI pair programming produces code that matches your team's standards. The risk is accepting AI output without review — the same risk as merging any PR without reading it.",
  },
  {
    q: "Is my code safe when using AI pair programming?",
    a: "ChatGPT Codex runs in your browser — your code is sent to OpenAI's API for processing but is not stored or used for training. For additional security, ChatGPT Codex supports hooks that can block operations on sensitive files, and your custom instructions can specify files or directories that should never be modified. Enterprise plans offer additional data governance controls.",
  },
];

const useCases = [
  {
    title: "Greenfield projects",
    description: "Starting from scratch is where AI pairing shines brightest. Describe your architecture and ChatGPT scaffolds the entire project — routes, components, database schema, tests. You review and refine rather than typing boilerplate.",
    icon: Layers,
    tag: "High impact",
    tagColor: "bg-teal",
  },
  {
    title: "Debugging complex issues",
    description: "Paste a stack trace or describe the bug. ChatGPT reads the relevant files, traces the logic, and suggests fixes with explanations. It catches things humans miss — off-by-one errors, race conditions, missing null checks.",
    icon: Bug,
    tag: "High impact",
    tagColor: "bg-teal",
  },
  {
    title: "Refactoring legacy code",
    description: "ChatGPT can read an entire legacy module, understand its behavior, and incrementally refactor it while preserving functionality. It writes the tests first, then refactors, then verifies tests still pass.",
    icon: Code2,
    tag: "High impact",
    tagColor: "bg-teal",
  },
  {
    title: "Learning new frameworks",
    description: "Working in a framework you have never used? ChatGPT knows the idioms. Ask it to implement features the idiomatic way — it writes code that follows the framework's conventions, not just code that works.",
    icon: Lightbulb,
    tag: "Learning",
    tagColor: "bg-orange",
  },
];

const vsTraditional = [
  { aspect: "Availability", ai: "24/7 — no scheduling needed", traditional: "Requires coordinating two schedules" },
  { aspect: "Patience", ai: "Infinite — will explain the same concept 100 times", traditional: "Varies — humans get frustrated" },
  { aspect: "Codebase knowledge", ai: "Reads entire project tree instantly", traditional: "Limited by individual memory" },
  { aspect: "Framework breadth", ai: "Knows every major framework and its idioms", traditional: "Limited to partner's experience" },
  { aspect: "Social learning", ai: "None — no team bonding or culture transfer", traditional: "Strong — builds trust and shared ownership" },
  { aspect: "Tacit knowledge", ai: "Cannot transfer unwritten tribal knowledge", traditional: "Excellent at transferring context" },
  { aspect: "Code review quality", ai: "Consistent — checks every line, never tired", traditional: "Varies — attention drops over time" },
  { aspect: "Cost", ai: "API subscription — scales to zero marginal cost", traditional: "Two engineer-hours per session" },
];

export default async function AIPairProgrammingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/ai-pair-programming`;

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
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.a,
                  },
                })),
              },
              {
                "@type": "Article",
                headline: "AI Pair Programming with ChatGPT: A Practical Guide",
                description:
                  "AI pair programming with ChatGPT means having an AI partner that reads your code, suggests implementations, writes tests, and catches bugs — all through natural conversation in your terminal or IDE.",
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
                  { "@type": "ListItem", position: 2, name: "AI Pair Programming", item: pagePath },
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Developer Guide</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Ship Features Faster with an AI That Reads Your Whole Codebase
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              A real coding partner, not just autocomplete
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              AI pair programming with ChatGPT means having an AI partner that reads your code, suggests implementations, writes tests, and catches bugs — all through natural conversation in your terminal or IDE. Unlike autocomplete tools, ChatGPT understands your full project context and can reason about architecture, trade-offs, and edge cases.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* How It Actually Works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">The Reality</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">How AI Pair Programming Actually Works</h2>
            <div className="mt-8 space-y-5 text-[1.02rem] leading-[1.75] text-text-secondary">
              <p>
                Forget what you know about code completion tools. AI pair programming with ChatGPT is a conversation. You describe what you want to build, ChatGPT reads your codebase, asks clarifying questions if needed, and then writes the implementation. You review, give feedback, and iterate — exactly like pairing with a human, except the feedback loop is faster.
              </p>
              <p>
                In <Link href="/claude-code" className="font-semibold text-orange hover:underline">Claude Code</Link> (the terminal CLI), this looks like typing a natural language prompt: <em>&quot;Add a rate limiter to the /api/signup endpoint — 5 requests per minute per IP, return 429 with a Retry-After header.&quot;</em> Claude reads your project structure, finds the endpoint, checks your existing middleware patterns, implements the rate limiter to match your style, and writes tests.
              </p>
              <p>
                The key difference from autocomplete is <strong className="text-ink">context depth</strong>. Autocomplete tools see the file you are editing. ChatGPT sees your entire project — every file, every dependency, your custom instructions, and the conversation history. It can make cross-file changes, understand architectural patterns, and reason about side effects before writing a line of code.
              </p>
            </div>
          </div>
        </section>

        {/* ChatGPT vs Traditional */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Comparison</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">ChatGPT vs. Traditional Pair Programming</h2>
            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-ink px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-white max-md:grid-cols-1">
                <span>Aspect</span>
                <span className="max-md:hidden">AI Pair (ChatGPT)</span>
                <span className="max-md:hidden">Human Pair</span>
              </div>
              {vsTraditional.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr] items-start gap-4 px-6 py-5 max-md:grid-cols-1 ${i % 2 === 0 ? "bg-cream" : "bg-linen"} border-t-[2px] border-ink/20`}
                >
                  <div className="font-bold text-ink">{row.aspect}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-text-secondary max-md:hidden">{row.ai}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-text-secondary max-md:hidden">{row.traditional}</div>
                  <div className="space-y-1 text-[0.85rem] text-text-secondary md:hidden">
                    <div><span className="font-semibold text-teal">AI: </span>{row.ai}</div>
                    <div><span className="font-semibold text-orange">Human: </span>{row.traditional}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              The takeaway: AI pair programming is not a replacement for human collaboration. It is a different tool that excels at different things — speed, availability, breadth of knowledge, and tireless consistency.
            </p>
          </div>
        </section>

        {/* Getting the Most */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Pro Tips</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">Getting the Most from Your AI Partner</h2>
            <div className="mt-8 space-y-5 text-[1.02rem] leading-[1.75] text-text-secondary">
              <p>
                <strong className="text-ink">Brief ChatGPT like you would brief a contractor.</strong> Do not just say &quot;build a login page.&quot; Say &quot;build a login page using our existing auth service in src/lib/auth.ts, matching the design pattern in src/app/(auth)/sign-up/page.tsx, with email + password fields, a forgot-password link, and rate limiting on the form submission.&quot; Specificity eliminates revision cycles.
              </p>
              <p>
                <strong className="text-ink">Delegate the grunt work, review the decisions.</strong> Let ChatGPT write the boilerplate, the test scaffolding, the type definitions, and the error handling. Focus your review on architectural choices, edge cases, and business logic correctness. This is where your human judgment adds the most value.
              </p>
              <p>
                <strong className="text-ink">Use <Link href="/claude-code-projects" className="text-orange hover:underline">CLAUDE.md</Link> to front-load context.</strong> The single highest-leverage thing you can do is write a good CLAUDE.md file. It eliminates 80% of the &quot;no, not like that&quot; feedback loops. Include your stack, conventions, file structure, and explicit prohibitions.
              </p>
              <p>
                <strong className="text-ink">Iterate, do not regenerate.</strong> If ChatGPT&apos;s first attempt is 70% right, give specific feedback on the 30% rather than re-prompting from scratch. &quot;Good, but change the error handling to use our custom AppError class and add a test for the 429 case&quot; gets you to done faster than starting over.
              </p>
            </div>
          </div>
        </section>

        {/* When to Use */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Use Cases</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">When to Use AI Pair Programming</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {useCases.map((uc, i) => (
                <div key={i} className="rounded-[24px] border-[4px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <uc.icon className="size-5 text-teal" />
                    </div>
                    <span className={`rounded-full border-[2px] border-ink px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-wide text-white ${uc.tagColor}`}>{uc.tag}</span>
                  </div>
                  <h3 className="mb-2 text-[1.1rem] font-bold text-ink">{uc.title}</h3>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Session example */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What an AI pairing session looks like
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
                <div className="mt-2 text-white/70">&gt; The checkout flow is dropping users at the payment step. Can you look at the Stripe integration and find why?</div>
                <div className="mt-3 text-white/50">Reading: src/app/api/checkout/route.ts</div>
                <div className="text-white/50">Reading: src/lib/stripe.ts</div>
                <div className="text-white/50">Reading: src/components/CheckoutForm.tsx</div>
                <div className="mt-2 text-green-400">Found the issue. The `createCheckoutSession` call is missing the `success_url` parameter when the user has a coupon code. Line 47 of route.ts only sets success_url in the non-coupon branch.</div>
                <div className="mt-2 text-white/70">&gt; Fix it and add a test for the coupon case</div>
                <div className="mt-2 text-white/50">Editing route.ts — moving success_url above the coupon conditional...</div>
                <div className="text-white/50">Creating: src/app/api/checkout/__tests__/route.test.ts</div>
                <div className="text-white/50">Running: npm test src/app/api/checkout/</div>
                <div className="text-green-400">&#10003; 4 tests passed (including new coupon case)</div>
              </div>
            </div>
            <p className="mt-4 text-center text-[0.85rem] text-text-secondary">
              ChatGPT reads the relevant files, identifies the bug, fixes it, writes a regression test, and verifies — all in one conversation turn.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Common Questions</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Frequently Asked Questions</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-[18px] border-[4px] border-ink bg-cream p-6 shadow-[4px_4px_0px_#1c1917]">
                  <h3 className="text-[1.05rem] font-bold text-ink">{faq.q}</h3>
                  <p className="mt-2 text-[0.92rem] leading-[1.65] text-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="B">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Start AI pair programming today
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Your first pairing session. 20 minutes.
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
                { href: "/claude-code-vs-cursor", label: "Claude Code vs Cursor", desc: "Terminal CLI vs IDE comparison" },
                { href: "/claude-code-projects", label: "Claude Projects", desc: "Persistent context for your codebase" },
                { href: "/claude-for-developers", label: "ChatGPT for Developers", desc: "Full developer guide" },
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
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
