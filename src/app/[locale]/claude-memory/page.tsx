import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Brain, FileText, Repeat, Database, Layers, Cpu } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-memory`;

  const title = "Claude Memory & Context Management: CLAUDE.md, Projects & Architecture";
  const description =
    "How Claude's memory works: context windows, CLAUDE.md persistent memory, Projects knowledge base, and memory architecture patterns. Build AI workflows that actually remember.";

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
          alt: "Claude Memory & Context Management — Learn to GPT",
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

const memoryLayers = [
  {
    icon: Brain,
    title: "In-Context Memory",
    desc: "Everything in the active conversation window. Claude reads every prior message on each turn. The limit is the context window — currently up to 200K tokens.",
  },
  {
    icon: FileText,
    title: "CLAUDE.md Files",
    desc: "Markdown files that Claude Code reads automatically at session start. Acts as persistent, project-scoped memory for development workflows.",
  },
  {
    icon: Database,
    title: "Projects Knowledge Base",
    desc: "Uploaded files inside a Claude Project persist across all conversations. The closest thing Claude has to long-term memory for individual users.",
  },
  {
    icon: Layers,
    title: "System Prompts",
    desc: "Instructions injected before the conversation begins. Used in API integrations and Claude Projects custom instructions to set permanent behavioral rules.",
  },
  {
    icon: Repeat,
    title: "External Memory Tools",
    desc: "When building with the Claude API, you can retrieve facts from a vector database and inject them into each prompt — giving Claude access to arbitrarily large memories.",
  },
  {
    icon: Cpu,
    title: "Agent Memory Patterns",
    desc: "Multi-agent architectures can pass state between agents using structured files, databases, or message queues — enabling memory that survives across agent sessions.",
  },
];

export default async function ClaudeMemoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-memory`;

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
                headline: "Claude Memory & Context Management: CLAUDE.md, Projects & Architecture",
                description:
                  "How Claude's memory works: context windows, CLAUDE.md persistent memory, Projects knowledge base, and memory architecture patterns.",
                url: pathForLocale(locale),
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
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                image: `${baseUrl}/og-default.png`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Memory", item: pathForLocale(locale) },
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
                href="/courses/practitioner-setup/state-and-memory"
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
              <Brain className="size-4" />
              Memory &amp; Context Architecture
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Build Claude Workflows That Remember Between Sessions
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Claude does not have persistent memory by default — every new conversation starts blank. But there are five distinct mechanisms for giving Claude the memory it needs. Understanding which to use transforms good AI interactions into reliable AI workflows.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Set Up CLAUDE.md
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Claude Code Guide
              </Link>
            </div>
          </div>
        </section>

        {/* MEMORY LAYERS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Six Memory Mechanisms
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              The complete Claude memory architecture
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {memoryLayers.map((layer, i) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">{layer.title}</div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{layer.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLAUDE.md DEEP DIVE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-center text-[2rem] font-extrabold text-ink">
              CLAUDE.md: The Developer Memory System
            </h2>
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                CLAUDE.md is a Markdown file you place at the root of your project. When Claude Code starts a session, it reads this file before anything else — making it the primary memory mechanism for developer workflows.
              </p>

              <div className="overflow-hidden rounded-[12px] border-[3px] border-ink">
                <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[10px]">
                  <div className="size-3 rounded-full bg-[#c94040]" />
                  <div className="size-3 rounded-full bg-gold" />
                  <div className="size-3 rounded-full bg-teal" />
                  <span className="ml-auto font-mono text-[0.7rem] text-white/60">CLAUDE.md</span>
                </div>
                <div className="bg-linen p-6">
                  <pre className="font-mono text-[0.82rem] leading-[1.8] text-ink overflow-x-auto">
{`# Project Memory

## Commands
- Build: \`npm run build\`
- Test: \`npm test\`
- Deploy: \`vercel --prod --no-wait\`

## Code Style
- TypeScript strict mode enabled
- Prefer named exports over default
- No \`any\` types — use \`unknown\` + narrowing

## Architecture Decisions
- Auth: Supabase with RLS on every table
- Database: explicit column selects, no select("*")
- API routes: per-IP rate limiting on all mutations

## Context
Reid is the solo developer. Prioritize shipping
speed over perfect abstractions. Note open TODOs
with \`// TODO(reid):\` comments.`}
                  </pre>
                </div>
              </div>

              <p className="mt-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                What makes CLAUDE.md powerful is specificity. Vague instructions like &quot;write clean code&quot; are useless. Specific instructions like &quot;no select(&apos;*&apos;) in Supabase queries&quot; or &quot;per-IP rate limiting on all POST routes&quot; become automatic constraints Claude enforces every session.
              </p>
            </div>
          </div>
        </section>

        {/* DECISION GUIDE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Which Memory Mechanism Should You Use?
            </h2>
            <div className="space-y-4">
              {[
                {
                  condition: "You need Claude to remember project facts across CLI sessions",
                  answer: "CLAUDE.md — add it to your repo root.",
                },
                {
                  condition: "You want Claude.ai to remember files between conversations",
                  answer: "Claude Projects — upload files to the Project knowledge base.",
                },
                {
                  condition: "You want consistent behavior for a team",
                  answer: "Claude Projects with custom instructions — share the Project with teammates.",
                },
                {
                  condition: "You're building an API-powered app and need long-term user memory",
                  answer: "External vector database — retrieve relevant facts and inject into each prompt.",
                },
                {
                  condition: "You need memory that survives across multiple AI agents",
                  answer: "Structured files or database — write state to disk, pass between agents explicitly.",
                },
              ].map(({ condition, answer }) => (
                <div key={condition} className="rounded-[16px] border-[3px] border-ink bg-cream p-5 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[0.9rem] font-semibold text-text-secondary">{condition}</div>
                  <div className="text-[1rem] font-bold text-orange">→ {answer}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Build AI workflows that{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                actually remember
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Learn memory architecture hands-on in Learn to GPT&apos;s free tracks.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                CLAUDE.md Setup
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Guide
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
                { href: "/claude-code-setup", label: "Claude Code Setup", desc: "Install and configure CLAUDE.md" },
                { href: "/claude-code", label: "Claude Code", desc: "The full developer CLI guide" },
                { href: "/claude-projects", label: "Claude Projects", desc: "Persistent workspace for teams" },
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
