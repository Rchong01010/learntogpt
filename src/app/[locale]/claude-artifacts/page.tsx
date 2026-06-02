import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Code2, FileText, BarChart3, Globe, Palette, Layers } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-artifacts`;

  const title = "Claude Artifacts: What They Are and How to Use Them";
  const description =
    "Claude Artifacts are rendered outputs — interactive apps, documents, charts, and code — that Claude creates alongside your conversation. Learn what they are, how to use them, and real examples.";

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
          alt: "Claude Artifacts — Learn to GPT",
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

const artifactTypes = [
  {
    icon: Code2,
    name: "React components",
    desc: "Claude builds fully interactive React apps — forms, dashboards, calculators, games — that render live in the sidebar. You can see the UI, interact with it, and ask Claude to iterate.",
    example: "\"Build a mortgage calculator with amortization schedule\"",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Globe,
    name: "HTML pages",
    desc: "Full HTML/CSS/JS web pages that render in the browser. Useful for landing page mockups, email templates, and interactive demos that don't need React.",
    example: "\"Create an HTML landing page for my SaaS product\"",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: FileText,
    name: "Documents & reports",
    desc: "Markdown documents, research reports, and structured writing that can be exported, shared, or used directly. Claude keeps it separate from the conversation thread.",
    example: "\"Write a competitive analysis report in Markdown\"",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: BarChart3,
    name: "Data visualizations",
    desc: "Charts, graphs, and dashboards built with libraries like Recharts or Chart.js. Paste in a CSV and Claude builds the visualization interactively.",
    example: "\"Visualize this sales data as an interactive bar chart\"",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Palette,
    name: "SVG graphics",
    desc: "Claude can generate SVG diagrams, flowcharts, logos, and illustrations. Useful for architecture diagrams, UI mockups, and simple graphics without Figma.",
    example: "\"Draw a system architecture diagram as SVG\"",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Layers,
    name: "Code in any language",
    desc: "Python scripts, SQL queries, shell scripts, JSON configs — Claude creates these as artifacts so they stay formatted, syntaxhighlighted, and easy to copy or download.",
    example: "\"Write a Python script to batch rename files\"",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const tips = [
  {
    title: "Ask Claude to iterate, not restart",
    body: "\"Change the chart colors to match our brand\" or \"add a dark mode toggle\" — Claude updates the existing artifact in place. You don't need to regenerate from scratch. This iterative loop is where Artifacts shine.",
  },
  {
    title: "Combine conversation + artifact",
    body: "Use the conversation to explain your requirements and the artifact to hold the output. \"I want a quiz app. Make it 5 questions, multiple choice, and show the score at the end.\" Claude builds the app as an artifact; you test it in the sidebar.",
  },
  {
    title: "Share artifacts with a link",
    body: "Claude.ai lets you share artifacts with a public link. This makes Artifacts useful for quick prototypes, mockups, and demos — send the link to a stakeholder without needing to deploy anything.",
  },
  {
    title: "Use Artifacts for deliverables, not notes",
    body: "If you want a polished output that will leave the conversation — a report, a component, a script — ask for an artifact explicitly. If you just want a quick answer or snippet, the conversation thread is fine.",
  },
];

export default async function ClaudeArtifactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-artifacts`;

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
                headline: "Claude Artifacts: What They Are and How to Use Them",
                description:
                  "Claude Artifacts are rendered outputs — React apps, documents, charts, and code — created alongside your conversation. A complete guide with examples.",
                url: pagePath,
                inLanguage: locale,
                author: { "@type": "Organization", name: "Learn to GPT", url: baseUrl },
                publisher: { "@type": "EducationalOrganization", name: "Learn to GPT", url: baseUrl },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Artifacts", item: pagePath },
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Feature Guide</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Build Apps, Charts, and Reports Inside Claude
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Rendered outputs you can see, interact with, and share
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Artifacts are Claude&apos;s way of creating standalone outputs alongside a conversation — React apps, HTML pages, charts, reports, and code files that render live in a sidebar panel. Instead of generating text and hoping it works, you see the result immediately and can ask Claude to refine it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Free Claude Courses
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Templates
              </Link>
            </div>
          </div>
        </section>

        {/* What are Artifacts */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">The Basics</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What makes Artifacts different</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Live rendering in the sidebar</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  When Claude creates an artifact, it appears in a panel next to the conversation — rendered and interactive. A React calculator actually calculates. An HTML page actually looks like a web page. A chart actually shows the data. You don&apos;t need to copy code into a separate environment to see if it works.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Iterative refinement</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  The artifact persists across the conversation. You can say &quot;make the header blue&quot;, &quot;add a reset button&quot;, or &quot;change the chart to a pie chart&quot; and Claude updates the artifact in place. This back-and-forth loop collapses what used to be a 30-minute design-build-test cycle into a 3-minute conversation.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Shareable via link</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude.ai lets you share any artifact with a public link. This turns Artifacts into a lightweight deployment tool for prototypes, mockups, demos, and internal tools. Share the link in Slack; your stakeholder can interact with the artifact without signing up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Artifact types */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Types</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Six kinds of Artifacts Claude can create</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {artifactTypes.map((type) => (
                <div key={type.name} className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]">
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${type.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <type.icon className={`size-5 ${type.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">{type.name}</div>
                  <p className="mb-3 text-[0.88rem] leading-[1.6] text-text-secondary">{type.desc}</p>
                  <div className="rounded-[8px] border border-ink/20 bg-linen px-3 py-2">
                    <p className="font-mono text-[0.75rem] italic text-text-secondary">{type.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Pro Tips</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">How to get the most from Artifacts</h2>
            <div className="mt-10 space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{tip.title}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Practice with real Claude exercises
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free interactive lessons — including Artifact workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free Courses
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Templates
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
                { href: "/learn", label: "Free Lessons", desc: "Interactive Claude exercises" },
                { href: "/best-claude-prompts", label: "Best Prompts", desc: "20 copy-paste templates" },
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Write prompts that get results" },
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
            <Link href="/learn" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Learn</Link>
            <Link href="/best-claude-prompts" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Best Prompts</Link>
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
