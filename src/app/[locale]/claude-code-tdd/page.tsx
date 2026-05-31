import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, TestTube, Layers, Code, Zap } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-tdd`;

  const title = "Test-Driven Development with Claude Code | TDD Guide (2025)";
  const description =
    "Claude Code is exceptionally good at TDD — you describe the behavior you want, it writes the failing test first, then implements the code to make it pass. Learn the full Red-Green-Refactor workflow.";

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
          alt: "Test-Driven Development with Claude Code — Learn to GPT",
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
    q: "Can I use Claude Code TDD on existing projects?",
    a: "Absolutely. Claude Code reads your existing test infrastructure — test framework, fixtures, mocks, factories, and conventions — and writes new tests that fit naturally alongside your existing suite. If your project uses pytest with conftest.py fixtures, Claude Code generates tests that use those fixtures. If your React project uses Testing Library with custom render utilities, Claude Code follows that pattern. You do not need to start from scratch.",
  },
  {
    q: "What coverage targets should I aim for?",
    a: "Coverage percentage is less important than coverage quality. Claude Code helps you focus on behavior coverage rather than line coverage. When you describe the feature in terms of what it should do (not how), the generated tests naturally cover the important paths. That said, Claude Code can analyze your existing coverage report and identify untested branches, then write targeted tests to fill gaps. Aim for thorough coverage of business logic and error handling, not 100% line coverage.",
  },
  {
    q: "Can Claude Code write integration tests?",
    a: "Yes. Claude Code writes integration tests that exercise multiple components together — API endpoints that hit a real test database, React components that interact with mocked API responses, or service layers that coordinate multiple dependencies. It handles test database setup and teardown, test fixtures, and mock server configuration. For API integration tests, it generates tests that verify the full request-response cycle including authentication, validation, and error responses.",
  },
  {
    q: "How does the refactoring phase work?",
    a: "After Green (tests pass with working implementation), you enter the Refactor phase. Ask Claude Code to improve the implementation — extract functions, reduce duplication, improve naming, or optimize performance. Claude Code makes the changes and re-runs the test suite after each refactoring step. If a test fails, it means the refactoring changed behavior, and Claude Code will either fix the refactoring or flag the behavior change for your review. The tests act as a safety net throughout.",
  },
];

const frameworkSupport = [
  {
    icon: Code,
    title: "Jest & Vitest (JavaScript/TypeScript)",
    body: "Claude Code writes Jest and Vitest tests with proper mocking, async handling, snapshot testing, and React Testing Library integration. It generates describe/it blocks that read like specifications and uses beforeEach/afterEach for clean test isolation.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: TestTube,
    title: "pytest (Python)",
    body: "Full pytest support including fixtures, parametrize, marks, conftest.py, and plugins like pytest-asyncio, pytest-django, and pytest-mock. Claude Code writes tests that use dependency injection through fixtures and follow the Arrange-Act-Assert pattern.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Layers,
    title: "Go testing & Rust tests",
    body: "Claude Code writes idiomatic Go table-driven tests with proper error wrapping and subtests, and Rust #[test] functions with proper Result handling, setup/teardown, and proptest integration for property-based testing.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Zap,
    title: "End-to-end with Playwright",
    body: "For full-stack TDD, Claude Code writes Playwright tests that exercise your entire application from the browser. It handles page navigation, form interaction, API assertions, and visual regression — letting you describe user stories and generating the automated test scripts.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
];

export default async function ClaudeCodeTddPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-tdd`;

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
                headline: "Test-Driven Development with Claude Code",
                description:
                  "Claude Code is exceptionally good at TDD. Learn the Red-Green-Refactor workflow with AI assistance.",
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
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Learn to GPT",
                    item: baseUrl,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "TDD with Claude Code",
                    item: pagePath,
                  },
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
        {/* Hero */}
        <section className="px-6 pb-16 pt-[80px] text-center">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Development Workflow
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Write Cleaner Code with Claude-Powered TDD
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Red, green, refactor — with AI writing the tests
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code is exceptionally good at TDD — you describe the behavior you want, it writes the failing test first, then implements the code to make it pass. This inverts the traditional pain point of TDD: writing tests is no longer the slow part. You focus on specifying behavior in plain English, and Claude Code handles the boilerplate of test setup, assertions, and mocking. The result is higher test coverage, better-designed code, and faster development.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                What is Claude Code?
              </Link>
            </div>
          </div>
        </section>

        {/* The TDD Loop with Claude Code */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Loop
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              The TDD loop with Claude Code
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffd6e0] font-mono text-[0.75rem] font-bold text-[#c2185b] shadow-[2px_2px_0px_#1c1917]">R</div>
                  <div className="text-[1.05rem] font-bold text-ink">Red — write a failing test</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  Describe the behavior you want to implement: &quot;Users should be able to reset their password by email. The endpoint should validate the email exists, generate a time-limited token, and send a reset link.&quot; Claude Code writes the test first — asserting the expected HTTP response, the token generation, and the email dispatch — before any implementation exists. It runs the test to confirm it fails for the right reason (missing function, not a syntax error).
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] font-mono text-[0.75rem] font-bold text-teal shadow-[2px_2px_0px_#1c1917]">G</div>
                  <div className="text-[1.05rem] font-bold text-ink">Green — implement the minimum code</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code then writes the simplest implementation that makes the test pass. It does not over-engineer — it writes exactly enough code to satisfy the test assertions. This discipline is where TDD shines: the test defines the contract, and the implementation fulfills it. Claude Code runs the test suite after writing the implementation to verify the new test passes and no existing tests break.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#e8e4ff] font-mono text-[0.75rem] font-bold text-[#6b5aed] shadow-[2px_2px_0px_#1c1917]">R</div>
                  <div className="text-[1.05rem] font-bold text-ink">Refactor — improve without changing behavior</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  With passing tests as a safety net, you ask Claude Code to clean up the implementation: extract helper functions, improve variable names, reduce duplication, or optimize performance. After each refactoring step, Claude Code re-runs the tests. If any test fails, the refactoring introduced a behavior change, and Claude Code either reverts or adjusts. This phase produces clean, maintainable code backed by comprehensive tests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Writing Your First Test-Driven Feature */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Walkthrough
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Writing your first test-driven feature
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Step 1: Describe the behavior, not the implementation</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Start by telling Claude Code what the feature should do from the user&apos;s perspective. Instead of &quot;create a function called calculateDiscount that takes a price and a percentage,&quot; say &quot;customers with a premium membership should get 20% off their order total, but the discount should never exceed $50.&quot; This behavioral description produces better tests because the tests verify business rules, not implementation details.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Step 2: Review the generated test</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code writes a test file with multiple test cases: the happy path (premium user, valid discount), edge cases (discount exceeds $50 cap, zero-price order), and error cases (non-premium user, negative price). Review these tests before letting Claude Code implement the feature. The test cases define your specification — if a case is missing, add it now. It is much cheaper to add a test case than to discover a missing edge case in production.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Step 3: Let Claude Code implement and iterate</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Once you approve the tests, tell Claude Code to implement the feature. It writes the code, runs the tests, and shows you the results. If all tests pass on the first attempt, you can move to refactoring. If some tests fail, Claude Code reads the failure output and adjusts the implementation. This cycle typically completes in one or two iterations — far faster than the manual write-run-debug loop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Claude Code Makes TDD Easier */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Why It Works
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Why Claude Code makes TDD easier
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">It eliminates the test-writing friction</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  The number one reason developers skip TDD is that writing tests feels slow and tedious — especially setup code, mocking, and boilerplate assertions. Claude Code removes this friction entirely. You describe what should happen in one sentence, and Claude Code generates the complete test file with proper imports, fixtures, mocks, and edge case coverage. The cognitive load shifts from &quot;how do I mock this dependency&quot; to &quot;what behavior matters.&quot;
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">It catches edge cases you would miss</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  When Claude Code writes tests from a behavior description, it generates edge cases that developers often forget: empty inputs, boundary values, concurrent access, null handling, and invalid state transitions. It does this because it has seen millions of test suites and knows which edge cases commonly cause bugs. You get more thorough test coverage without having to think of every case yourself.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">It keeps you in the TDD discipline</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  TDD is hard to maintain because the temptation to skip the test and write the code directly is always there. With Claude Code, writing the test first is actually faster than writing the implementation first — there is no incentive to skip it. The Red-Green-Refactor cycle becomes natural because Claude Code enforces each step: it writes the test, runs it to confirm failure, implements the code, and runs the test again to confirm success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Framework Support */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Framework Support
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Test frameworks Claude Code supports
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {frameworkSupport.map((fw) => (
                <div
                  key={fw.title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${fw.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <fw.icon className={`size-5 ${fw.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {fw.title}
                  </div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    {fw.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              FAQ
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              TDD with Claude Code — common questions
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {faq.q}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="A">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Learn TDD with{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Code
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Stop reading about it. Build something.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Free Lessons
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
                { href: "/claude-code-debugging", label: "Debugging Guide", desc: "Debug effectively with Claude Code" },
                { href: "/claude-code-for-python", label: "Python Guide", desc: "Python-specific workflows" },
                { href: "/claude-code-vs-cursor", label: "Claude Code vs Cursor", desc: "Side-by-side comparison" },
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

      {/* Footer */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/claude-code" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code</Link>
            <Link href="/claude-code-tutorial" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Tutorial</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
