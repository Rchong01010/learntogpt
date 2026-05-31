import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, FolderOpen, FileText, Settings, GitBranch, MessageSquare, Layers } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-projects`;

  const title = "How to Use Claude Code with Projects: Complete Guide (2025)";
  const description =
    "Claude Code Projects let you save instructions, files, and context that persist across conversations — turning Claude from a one-shot tool into a teammate that knows your codebase.";

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
          alt: "Claude Code Projects — Learn to GPT",
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
    q: "What are the file limits for Claude Projects?",
    a: "Claude Projects can hold up to 200K tokens of project knowledge — roughly equivalent to a 500-page book or a medium-sized codebase. Files are processed when added, so Claude understands their content contextually rather than treating them as raw text.",
  },
  {
    q: "Can I share a Claude Project with my team?",
    a: "Yes. On Claude Team and Enterprise plans, projects can be shared across your organization. Team members see the same project knowledge and custom instructions, ensuring consistent AI behavior across the team. On Pro plans, projects are private to your account.",
  },
  {
    q: "Can I have multiple projects for different codebases?",
    a: "Absolutely. You can create as many projects as you need — one per repo, one per client, one per feature branch. Each project maintains its own context, instructions, and knowledge base independently.",
  },
  {
    q: "Do Claude Projects work with the API?",
    a: "Projects are a feature of claude.ai and the Claude desktop apps. For API usage, you achieve similar persistence through system prompts and the CLAUDE.md file in Claude Code. The ChatGPT Codex CLI automatically loads CLAUDE.md at the start of every session, giving you project-like persistence in terminal workflows.",
  },
];

const bestPractices = [
  {
    title: "Keep CLAUDE.md under 500 lines",
    body: "Your CLAUDE.md should be a lean reference, not a novel. Include your stack, conventions, file structure overview, and testing requirements. If it exceeds 500 lines, split detail into topic-specific files and reference them.",
    icon: FileText,
  },
  {
    title: "Add representative code samples",
    body: "Include 2-3 files that show your coding style — a well-structured component, a service module, a test file. Claude extrapolates patterns from examples more effectively than from written rules alone.",
    icon: GitBranch,
  },
  {
    title: "State what NOT to do",
    body: "Negative constraints are powerful. \"Never use any type — use unknown + narrowing\" or \"No string concatenation in SQL\" prevents the most common AI missteps. Claude follows explicit prohibitions reliably.",
    icon: Settings,
  },
  {
    title: "Update after each session",
    body: "When you make architectural decisions, update your project knowledge. A living context file produces better results than a stale one. Treat project context like documentation — it rots if you ignore it.",
    icon: Layers,
  },
];

export default async function ClaudeCodeProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-projects`;

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
                headline: "How to Use Claude Code with Projects: Complete Guide",
                description:
                  "Claude Code Projects let you save instructions, files, and context that persist across conversations — turning Claude from a one-shot tool into a teammate that knows your codebase.",
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
                  { "@type": "ListItem", position: 2, name: "Claude Code Projects", item: pagePath },
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Claude Code Guide</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Stop Re-Explaining Your Codebase Every Session
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Persistent context that makes Claude a real teammate
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code Projects let you save instructions, files, and context that persist across conversations — turning Claude from a one-shot tool into a teammate that knows your codebase. Instead of re-explaining your stack, conventions, and architecture every session, you define it once and Claude remembers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-projects"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Projects Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                GPT Code Track
              </Link>
            </div>
          </div>
        </section>

        {/* What Are Claude Projects */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Core Concept</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">What Are Claude Projects?</h2>
            <div className="mt-8 space-y-5 text-[1.02rem] leading-[1.75] text-text-secondary">
              <p>
                A Claude Project is a persistent workspace where you store context that Claude loads automatically at the start of every conversation. Think of it as Claude&apos;s long-term memory for a specific codebase, client, or domain.
              </p>
              <p>
                Projects have three layers of persistence. <strong className="text-ink">Project Knowledge</strong> is the file layer — upload code files, documentation, specs, or any reference material Claude should understand. <strong className="text-ink">Custom Instructions</strong> define how Claude should behave — your coding standards, preferred frameworks, tone, and constraints. <strong className="text-ink">Conversation History</strong> within a project stays accessible, so you can reference past decisions.
              </p>
              <p>
                In Claude Code (the terminal CLI), this concept maps to <strong className="text-ink">CLAUDE.md</strong> — a markdown file at your project root that Claude reads on every session start. CLAUDE.md serves the same purpose as project custom instructions: it tells Claude who you are, what you&apos;re building, and how you want the code written. The difference is that CLAUDE.md lives in your repo, version-controlled alongside your code.
              </p>
            </div>
          </div>
        </section>

        {/* Setting Up Your First Project */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Step by Step</p>
            <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.2] text-ink">Setting Up Your First Project</h2>
            <div className="mt-8 space-y-6">
              {[
                {
                  step: "1",
                  title: "Create a CLAUDE.md in your repo root",
                  body: "This is your project's instruction file. Start with three sections: your tech stack (e.g., \"Next.js 15, TypeScript, Supabase, Tailwind\"), your key conventions (e.g., \"Server Components by default, Client Components only when state is needed\"), and your testing requirements (e.g., \"All API routes must have integration tests\").",
                },
                {
                  step: "2",
                  title: "Add project knowledge files",
                  body: "In claude.ai, upload files that Claude should reference — your API schema, database ERD, style guide, or architecture docs. In Claude Code, these files are already available since Claude can read your entire project tree. For critical files, reference them explicitly in CLAUDE.md so Claude prioritizes them.",
                },
                {
                  step: "3",
                  title: "Write custom instructions",
                  body: "Be specific and operational. Instead of \"write clean code,\" say \"use explicit return types on all exported functions\" or \"never use any — use unknown with type narrowing.\" Claude follows concrete rules more reliably than vague guidance.",
                },
                {
                  step: "4",
                  title: "Test with a real task",
                  body: "Give Claude a task you've done recently — something where you know what good output looks like. Compare the result with and without project context. If the output misses your conventions, tighten the instructions.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-[18px] border-[4px] border-ink bg-cream p-6 shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex size-[36px] items-center justify-center rounded-full border-[3px] border-ink bg-orange text-[0.9rem] font-bold text-white shadow-[2px_2px_0px_#1c1917]">{s.step}</span>
                    <h3 className="text-[1.1rem] font-bold text-ink">{s.title}</h3>
                  </div>
                  <p className="text-[0.92rem] leading-[1.65] text-text-secondary">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Expert Tips</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Best Practices for Claude Projects</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {bestPractices.map((bp, i) => (
                <div key={i} className="rounded-[24px] border-[4px] border-ink bg-cream p-8 shadow-[4px_4px_0px_#1c1917]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <bp.icon className="size-5 text-teal" />
                    </div>
                    <div className="text-[1.1rem] font-bold text-ink">{bp.title}</div>
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{bp.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects vs Plain Claude */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Side by Side</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Projects vs. Plain Claude</h2>
            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-ink px-6 py-4 text-[0.8rem] font-bold uppercase tracking-[0.15em] text-white max-md:grid-cols-1">
                <span>Capability</span>
                <span className="max-md:hidden">With Projects</span>
                <span className="max-md:hidden">Without Projects</span>
              </div>
              {[
                { cap: "Context persistence", with: "Automatic — loads every session", without: "None — re-explain every time" },
                { cap: "Code style consistency", with: "Follows your CLAUDE.md rules", without: "Guesses based on prompt" },
                { cap: "Architecture awareness", with: "Knows your file structure and patterns", without: "Starts from scratch" },
                { cap: "Team alignment", with: "Shared instructions across members", without: "Each person prompts differently" },
                { cap: "Onboarding new devs", with: "Claude explains the codebase using project context", without: "Claude can only read what you paste" },
                { cap: "Multi-session workflows", with: "Pick up where you left off", without: "Lose all progress between chats" },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_1fr_1fr] items-start gap-4 px-6 py-5 max-md:grid-cols-1 ${i % 2 === 0 ? "bg-cream" : "bg-linen"} border-t-[2px] border-ink/20`}
                >
                  <div className="font-bold text-ink">{row.cap}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-teal max-md:hidden">{row.with}</div>
                  <div className="text-[0.88rem] leading-[1.6] text-text-secondary max-md:hidden">{row.without}</div>
                  <div className="space-y-1 text-[0.85rem] text-text-secondary md:hidden">
                    <div><span className="font-semibold text-teal">With Projects: </span>{row.with}</div>
                    <div><span className="font-semibold text-text-secondary">Without: </span>{row.without}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              The difference is stark. With a well-configured project, Claude produces code that matches your existing patterns on the first try. Without it, you spend half your session correcting style, conventions, and architecture mismatches.
            </p>
          </div>
        </section>

        {/* CLAUDE.md example */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What a CLAUDE.md looks like
            </h2>
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-ink px-6 py-3">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[0.75rem] text-white/60">CLAUDE.md</span>
              </div>
              <div className="bg-[#1c1917] p-6 font-mono text-[0.85rem] leading-[1.8] text-green-400">
                <div className="text-white/70"># Project: my-saas-app</div>
                <div className="mt-2 text-white/50">## Stack</div>
                <div className="text-white/70">Next.js 15, TypeScript, Supabase, Tailwind CSS</div>
                <div className="mt-2 text-white/50">## Conventions</div>
                <div className="text-white/70">- Server Components by default</div>
                <div className="text-white/70">- No `any` type — use `unknown` + narrowing</div>
                <div className="text-white/70">- Explicit column lists in Supabase queries</div>
                <div className="text-white/70">- All API routes must validate input server-side</div>
                <div className="mt-2 text-white/50">## File Structure</div>
                <div className="text-white/70">src/app/ — routes and pages</div>
                <div className="text-white/70">src/components/ — shared UI components</div>
                <div className="text-white/70">src/lib/ — utilities and Supabase client</div>
                <div className="mt-2 text-white/50">## Testing</div>
                <div className="text-white/70">Run `npm test` before committing. All new endpoints need tests.</div>
              </div>
            </div>
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
              Master Claude Projects
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Your first persistent project. 20 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-projects"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Projects Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                CLAUDE.md Setup Guide
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
                { href: "/claude-code", label: "GPT Code Track", desc: "Full agentic development course" },
                { href: "/claude-memory", label: "Claude Memory", desc: "How Claude remembers across sessions" },
                { href: "/claude-code-vs-cursor", label: "Claude Code vs Cursor", desc: "CLI vs IDE comparison" },
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
            <Link href="/claude-projects" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Projects</Link>
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
