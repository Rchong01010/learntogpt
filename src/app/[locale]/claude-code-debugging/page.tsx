import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Bug, FileCode, RefreshCw } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-debugging`;

  const title = "How to Debug with Claude Code | Step-by-Step Guide (2025)";
  const description =
    "Claude Code debugs by reading error output, tracing through your codebase, and applying targeted fixes — all from a single terminal command. Learn the full debugging workflow.";

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
          alt: "Claude Code Debugging Guide — Learn to GPT",
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
    q: "Can Claude Code debug production issues?",
    a: "Yes. Paste a production stack trace or error log into Claude Code and it will trace the issue back through your source code. It can read log files, identify the offending function, and suggest a fix. For production-specific issues like environment mismatches or missing config, share the relevant deployment context and Claude Code will factor that into its diagnosis.",
  },
  {
    q: "Does Claude Code understand my framework?",
    a: "Claude Code works with every major framework — React, Next.js, Django, FastAPI, Rails, Express, Spring Boot, and more. It reads your project files (package.json, pyproject.toml, Gemfile) to understand your stack and applies framework-specific debugging strategies. It knows about common framework-specific pitfalls like React hydration mismatches, Next.js server/client component boundaries, and Django ORM query issues.",
  },
  {
    q: "How does Claude Code handle multi-file bugs?",
    a: "This is where Claude Code outperforms traditional debugging tools. It can read multiple files in your project, trace function calls across modules, follow import chains, and identify where a value gets corrupted as it passes between components. You describe the symptom, and Claude Code navigates the dependency graph to find the root cause — even when the bug is three files away from where the error surfaces.",
  },
  {
    q: "Is Claude Code better than print debugging?",
    a: "For most bugs, yes. Print debugging is slow because you have to guess where to add logs, run the code, read output, and repeat. Claude Code reads the entire relevant code path at once and identifies the issue in seconds. That said, for timing-dependent bugs or issues that only reproduce under load, Claude Code can help you add strategic logging in exactly the right places rather than scattering print statements everywhere.",
  },
];

const workflows = [
  {
    icon: Terminal,
    title: "Stack trace analysis",
    body: "Paste a stack trace and Claude Code reads every file in the call chain. It identifies the root cause, not just the line that threw — tracing through async boundaries, middleware layers, and third-party library calls.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Bug,
    title: "Failing test diagnosis",
    body: "Tell Claude Code which test is failing and it reads both the test file and the implementation. It compares expected vs. actual behavior, identifies the mismatch, and fixes the code (or the test, if the test is wrong).",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: FileCode,
    title: "Type error resolution",
    body: "TypeScript and Python type errors often cascade — one wrong type causes twenty errors. Claude Code traces back to the original type mismatch, fixes it at the source, and verifies the fix resolves all downstream errors.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: RefreshCw,
    title: "Runtime crash investigation",
    body: "For null pointer exceptions, undefined access, and runtime crashes, Claude Code reads the surrounding code, identifies which variable can be undefined and why, and adds proper null checks or fixes the data flow.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
];

export default async function ClaudeCodeDebuggingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-debugging`;

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
                headline: "How to Debug with Claude Code",
                description:
                  "Claude Code debugs by reading error output, tracing through your codebase, and applying targeted fixes. Learn the Read-Diagnose-Fix-Verify debugging loop.",
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
                    name: "Claude Code Debugging",
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
              Claude Code Guide
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Fix Bugs in Seconds with{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Code
              </em>
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Read, diagnose, fix, verify — the AI debugging loop
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code debugs by reading error output, tracing through your codebase, and applying targeted fixes — all from a single terminal command. Instead of manually stepping through code with a debugger or scattering print statements, you describe the problem and Claude Code reads the relevant files, identifies the root cause, and writes the fix. It works with any language, any framework, and any project size.
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

        {/* How Claude Code Debugging Works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Process
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How Claude Code debugging works
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] font-mono text-[0.75rem] font-bold text-orange shadow-[2px_2px_0px_#1c1917]">1</div>
                  <div className="text-[1.05rem] font-bold text-ink">Read — Claude Code ingests the error context</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  When you paste an error message, stack trace, or describe unexpected behavior, Claude Code starts by reading the relevant source files. It does not guess — it opens your actual code, reads import chains, checks configuration files, and builds a mental model of how the code is supposed to work. If the error references a specific file and line, it starts there. If you describe a symptom, it searches your project to find the relevant code paths.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] font-mono text-[0.75rem] font-bold text-teal shadow-[2px_2px_0px_#1c1917]">2</div>
                  <div className="text-[1.05rem] font-bold text-ink">Diagnose — it identifies the root cause</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  After reading the code, Claude Code explains what is going wrong and why. This is not just restating the error message — it traces the logic flow, identifies where assumptions break down, and pinpoints the root cause. For example, if a React component is rendering stale data, Claude Code might trace the issue from the component through a custom hook to a missing dependency in a useEffect array. It explains the causal chain, not just the symptom.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#e8e4ff] font-mono text-[0.75rem] font-bold text-[#6b5aed] shadow-[2px_2px_0px_#1c1917]">3</div>
                  <div className="text-[1.05rem] font-bold text-ink">Fix — it writes the targeted code change</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code does not just tell you what to change — it edits the file directly. It writes the minimal, correct fix at the right location. If the fix requires changes across multiple files (like updating a type definition and all its consumers), Claude Code handles all of them in sequence. You review the diff before accepting, so you stay in control of what gets committed.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-1 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffd6e0] font-mono text-[0.75rem] font-bold text-[#c2185b] shadow-[2px_2px_0px_#1c1917]">4</div>
                  <div className="text-[1.05rem] font-bold text-ink">Verify — it runs your tests to confirm the fix</div>
                </div>
                <p className="mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                  After applying the fix, Claude Code can run your test suite, linter, or build command to verify the change works. If something still fails, it reads the new error and repeats the loop — diagnose, fix, verify — until the issue is resolved. This iterative approach mirrors how experienced developers debug, but it happens in seconds instead of minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Debugging Workflows */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Workflows
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Common debugging workflows
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {workflows.map((w) => (
                <div
                  key={w.title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${w.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <w.icon className={`size-5 ${w.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {w.title}
                  </div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips for Effective Debugging */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Best Practices
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Tips for effective debugging
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Paste the full error, not a summary</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code works best with exact error messages and stack traces. Copy the entire terminal output rather than paraphrasing. The line numbers, file paths, and error codes in a raw stack trace give Claude Code precise starting points. A summary like &quot;it crashes on login&quot; forces guessing. The actual <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">TypeError: Cannot read properties of undefined (reading &apos;user&apos;)</code> tells Claude Code exactly where to look.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Share what you expected vs. what happened</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  For behavioral bugs where there is no error message, describe the gap between expected and actual behavior. &quot;The API returns a 200 but the response body is empty&quot; is much more useful than &quot;the API isn&apos;t working.&quot; The more specific your description, the faster Claude Code can narrow down the code path that produces the wrong result.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Let Claude Code read the file first</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Do not pre-explain your architecture. Claude Code reads your actual source files, which is more reliable than your description of them. If you say &quot;the auth middleware checks the JWT&quot; but your code actually skips validation for certain routes, Claude Code catches that by reading the file. Trust the tool to read your code rather than narrating it.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Use CLAUDE.md to set debugging context</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Add your project&apos;s test commands, build commands, and common gotchas to your <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">CLAUDE.md</code> file. When Claude Code knows that <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">npm test</code> runs your suite and <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">npm run lint</code> checks style, it can verify fixes automatically. This turns debugging from a conversation into an automated loop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Debugging vs. Traditional IDEs */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Comparison
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Debugging vs. traditional IDEs
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Semantic understanding, not just syntax</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  IDE debuggers show you variable values at breakpoints. Linters catch syntax issues. But neither understands what your code is supposed to do. Claude Code reads the intent behind your code — the function name, the surrounding logic, the test expectations — and identifies when the implementation diverges from the intent. It catches logical bugs that no amount of syntax highlighting will surface.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Cross-file reasoning</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Traditional debuggers step through one execution path. Claude Code reads across your entire project — tracing how a type defined in one file gets consumed by a function in another file that feeds a component in a third file. It can identify that your bug is not in the file that threw the error but in the utility function three imports deep that silently returns the wrong shape.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">No setup, no configuration</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  IDE debuggers require launch configurations, source maps, and breakpoint setup. Claude Code works the moment you open your terminal. There is no debugger to configure, no breakpoints to set, no watch expressions to define. You describe the problem in plain English and Claude Code starts investigating immediately. This makes it particularly effective for unfamiliar codebases where you would not know where to set breakpoints.
                </p>
              </div>
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
              Debugging with Claude Code — common questions
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
              Learn to debug like a pro with{" "}
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
                { href: "/claude-code", label: "Claude Code", desc: "Full overview of Claude Code" },
                { href: "/claude-code-for-python", label: "Claude Code for Python", desc: "Python-specific workflows" },
                { href: "/claude-code-tdd", label: "Test-Driven Development", desc: "TDD with Claude Code" },
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
