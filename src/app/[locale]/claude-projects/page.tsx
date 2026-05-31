import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, FolderOpen, Users, BookOpen, Settings, Layers, Share2 } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-projects`;

  const title = "How to Use Claude Projects: Organization, Context & Team Collaboration";
  const description =
    "Master Claude Projects to organize conversations, share persistent context, and collaborate with your team. Complete guide to Claude Projects setup, custom instructions, and team workflows.";

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
          alt: "How to Use Claude Projects — Learn to GPT",
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

const features = [
  {
    icon: FolderOpen,
    title: "Persistent Context",
    desc: "Everything you upload to a Project stays available across all conversations — no re-uploading documents every session.",
  },
  {
    icon: Settings,
    title: "Custom Instructions",
    desc: "Set a system prompt at the Project level. Every conversation in that Project inherits your tone, formatting rules, and constraints automatically.",
  },
  {
    icon: Users,
    title: "Team Sharing",
    desc: "Share Projects with teammates on Claude's team plans. Everyone gets the same context, instructions, and uploaded knowledge.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    desc: "Upload PDFs, code files, style guides, or reference documents. Claude reads them before every reply — no prompt preamble needed.",
  },
  {
    icon: Layers,
    title: "Organized Workflows",
    desc: "Keep client work, personal projects, and research in separate Projects. Clean separation prevents context bleed between work streams.",
  },
  {
    icon: Share2,
    title: "Collaborative Drafting",
    desc: "Multiple team members can continue the same conversation thread, building on each other's prompts inside a shared Project.",
  },
];

export default async function ClaudeProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-projects`;

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
                headline: "How to Use Claude Projects: Organization, Context & Team Collaboration",
                description:
                  "Master Claude Projects to organize conversations, share persistent context, and collaborate with your team.",
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
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Learn to GPT",
                    item: baseUrl,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Claude Projects",
                    item: pathForLocale(locale),
                  },
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
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <FolderOpen className="size-4" />
              Organization &amp; Collaboration
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Give Claude Permanent Memory Across Sessions
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Stop reading about it. Build something.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Claude Projects transform how you work with AI. Instead of re-uploading documents and re-explaining your style every session, a Project holds everything permanently — your files, your instructions, your team&apos;s shared context.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start Learning Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-business"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Claude for Business
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT ARE PROJECTS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                What Are Claude Projects?
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Claude Projects are persistent workspaces inside Claude.ai. Think of them as filing cabinets that sit between you and Claude — everything in the cabinet is available in every conversation you have inside that Project, without any copy-paste.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Each Project has three layers:
              </p>
              <ul className="ml-6 space-y-2 text-[1.05rem] leading-[1.7] text-text-secondary">
                <li><strong className="text-ink">Custom instructions</strong> — a system prompt you write once that shapes every conversation. Define your role, output format, writing style, or constraints.</li>
                <li><strong className="text-ink">Knowledge files</strong> — uploaded documents (PDFs, code, text files) that Claude reads before responding. Add your brand guide, codebase README, or research corpus.</li>
                <li><strong className="text-ink">Conversation history</strong> — all chats within the Project, accessible to you and your teammates.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              What Projects Enable
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Six capabilities that change your workflow
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">
                      {feature.title}
                    </div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                      {feature.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW TO SET UP */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Setting Up Your First Project
            </h2>
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Create the Project",
                  body: "In Claude.ai, click the Projects tab in the left sidebar and select \"New Project.\" Give it a descriptive name — this is how you'll navigate between work streams.",
                },
                {
                  step: "02",
                  title: "Write Custom Instructions",
                  body: "Open Project Settings and write your system prompt. Be specific: \"You are a technical writer who formats everything in Markdown. Use headers, bullet points, and code blocks. Keep explanations under 200 words.\" Claude treats this as ground truth for every conversation in the Project.",
                },
                {
                  step: "03",
                  title: "Upload Knowledge Files",
                  body: "Attach reference documents — your product spec, style guide, competitor analysis, or codebase README. Claude reads these on every turn. A 40-page brand guide becomes zero-effort context for every draft.",
                },
                {
                  step: "04",
                  title: "Invite Teammates (Team Plans)",
                  body: "On Claude's team plans, share the Project with colleagues. Everyone inherits the same instructions and knowledge files. No more \"forward this document\" emails before every AI session.",
                },
                {
                  step: "05",
                  title: "Iterate the System Prompt",
                  body: "After a few sessions, refine your custom instructions based on where Claude drifts. Projects make iteration fast — you tune once and every future conversation benefits.",
                },
              ].map(({ step, title, body }) => (
                <div
                  key={step}
                  className="flex gap-6 rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="flex-shrink-0 font-mono text-[2rem] font-bold text-orange">
                    {step}
                  </div>
                  <div>
                    <div className="mb-2 text-[1.1rem] font-bold text-ink">{title}</div>
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Real-World Project Templates
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: "Content Team",
                  desc: "Instructions: editorial tone, word count targets, SEO formatting rules. Files: brand voice guide, competitor content samples, keyword list. Result: every blog post draft follows the same style without a briefing call.",
                },
                {
                  label: "Software Engineering",
                  desc: "Instructions: coding style guide, preferred libraries, error message format. Files: README, architecture diagram, core API reference. Result: Claude codes as if it already understands the codebase.",
                },
                {
                  label: "Sales Team",
                  desc: "Instructions: qualification criteria, tone for cold outreach, CRM note format. Files: product one-pager, pricing tiers, common objections doc. Result: reps get consistent, on-brand responses for every deal scenario.",
                },
                {
                  label: "Research",
                  desc: "Instructions: citation format, hypothesis tracking, objective tone. Files: literature corpus, annotated bibliography, research questions. Result: Claude synthesizes across papers and tracks open questions without losing context.",
                },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-2 inline-block rounded-full border-2 border-ink bg-[#d0f0ea] px-4 py-1 font-mono text-[0.8rem] font-bold text-ink">
                    {label}
                  </div>
                  <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Ready to master{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Projects?
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Learn Projects, context management, and team workflows in Learn to GPT.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-business"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Team Training
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
                { href: "/claude-memory", label: "Claude Memory", desc: "How Claude remembers context" },
                { href: "/claude-for-business", label: "Claude for Business", desc: "ROI and team workflows" },
                { href: "/learn", label: "Learn ChatGPT", desc: "Free interactive lessons" },
                { href: "/claude-code", label: "Claude Code", desc: "The developer CLI" },
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
