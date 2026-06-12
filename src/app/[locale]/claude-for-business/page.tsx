import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BarChart3, Users, Clock, TrendingUp, Shield, Zap } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-business`;

  const title = "Claude for Business: ROI, Team Training & Workflow Automation";
  const description =
    "How businesses use Claude to save time, automate workflows, and train teams. ROI breakdown, use cases by department, and team training options with Learn to GPT.";

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
          alt: "Claude for Business — Learn to GPT",
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

const roiStats = [
  {
    stat: "2–4 hrs",
    label: "Saved per knowledge worker per day",
    desc: "Across writing, research, summarization, and first-draft tasks.",
  },
  {
    stat: "60–80%",
    label: "Faster first drafts",
    desc: "Reports, emails, proposals, and documentation produced in a fraction of the time.",
  },
  {
    stat: "10–30×",
    label: "More research synthesized",
    desc: "Claude reads and synthesizes documents, reports, and data faster than any human team.",
  },
  {
    stat: "< 30 days",
    label: "Typical time to measurable ROI",
    desc: "Most teams see productivity gains within the first month of structured Claude adoption.",
  },
];

const departments = [
  {
    icon: BarChart3,
    title: "Finance & Operations",
    color: "teal",
    bgColor: "#d0f0ea",
    useCases: [
      "Summarize and compare vendor contracts",
      "Draft board reports and executive summaries",
      "Analyze financial data and write commentary",
      "Automate routine reporting workflows",
    ],
  },
  {
    icon: Users,
    title: "Sales & Marketing",
    color: "orange",
    bgColor: "#ffecd2",
    useCases: [
      "Personalized outreach at scale",
      "Competitive research and battlecards",
      "Proposal and RFP response drafting",
      "Content repurposing across channels",
    ],
  },
  {
    icon: Shield,
    title: "Legal & Compliance",
    color: "teal",
    bgColor: "#d0f0ea",
    useCases: [
      "First-pass contract review and redlines",
      "Policy document drafting and editing",
      "Research memos on regulatory questions",
      "Summarizing complex legal documents",
    ],
  },
  {
    icon: TrendingUp,
    title: "Product & Engineering",
    color: "orange",
    bgColor: "#ffecd2",
    useCases: [
      "Code review and documentation",
      "PRD drafting and refinement",
      "Customer feedback synthesis",
      "Technical specification writing",
    ],
  },
];

const trainingOptions = [
  {
    label: "Self-Paced",
    title: "Individual Training",
    features: [
      "All 7 tracks including advanced workflows",
      "Private GitHub repo with pre-built agents",
      "Interactive exercises with live ChatGPT sandbox",
      "Lifetime access — new content added regularly",
    ],
    cta: { label: "Start Learning", href: "/masterclass", primary: true },
  },
  {
    label: "Team Training",
    title: "Enterprise",
    badge: "Most Popular",
    features: [
      "Custom curriculum for your industry",
      "Live workshops with hands-on exercises",
      "Implementation support and CLAUDE.md setup",
      "Progress tracking and team leaderboard",
    ],
    cta: {
      label: "Contact Us",
      href: "mailto:reid@getateam.ai?subject=Claude%20Academy%20Enterprise",
      primary: false,
      isEmail: true,
    },
  },
];

const blockingPatterns = [
  {
    icon: Clock,
    title: "Unstructured rollout",
    desc: "Companies that give employees access with no training see low adoption and inconsistent results. Structured onboarding is the difference between 'we tried AI' and actual ROI.",
  },
  {
    icon: Zap,
    title: "Copy-paste workflows",
    desc: "Most teams use Claude like a search engine — one-off questions. The real leverage is in building repeatable workflows where Claude handles the first 80% of every task.",
  },
  {
    icon: Shield,
    title: "No data governance",
    desc: "Enterprise Claude via the API gives you data controls that consumer accounts don't. Training your team on what goes in and what stays out is a critical first step.",
  },
];

export default async function ClaudeForBusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-for-business`;

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
                "@type": "WebPage",
                name: "Claude for Business: ROI, Team Training & Workflow Automation",
                description:
                  "How businesses use Claude to save time, automate workflows, and train teams.",
                url: pagePath,
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: "Claude for Business — Enterprise Training",
                description:
                  "Structured Claude AI training for business teams. Custom curriculum, live workshops, and implementation support.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                offers: [
                  {
                    "@type": "Offer",
                    name: "Masterclass",
                  },
                  {
                    "@type": "Offer",
                    name: "Enterprise Program",
                  },
                ],
                inLanguage: locale,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude for Business", item: pagePath },
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
                {t("nav.curriculum")}
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Business &amp; Enterprise
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Save Your Team Hours Every Day with Claude
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Your first project. 20 minutes.
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude is the AI most companies should be deploying for knowledge
              work — long context, precise instruction-following, and a safety
              profile built for enterprise use. The ROI is measurable. The
              barrier is adoption, not capability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:reid@getateam.ai?subject=Claude%20Academy%20Enterprise%20Training"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Talk to Us About Teams
                <ArrowRight className="size-5" />
              </a>
              <Link
                href="/for-teams"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Team Training Options
              </Link>
            </div>
          </div>
        </section>

        {/* ROI stats */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Business Case
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What organizations actually see
            </h2>

            <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-2 lg:grid-cols-4">
              {roiStats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] text-center"
                >
                  <div className="mb-2 text-[2.4rem] font-extrabold text-orange">
                    {stat.stat}
                  </div>
                  <div className="mb-2 text-[0.95rem] font-bold text-ink">
                    {stat.label}
                  </div>
                  <p className="text-[0.82rem] leading-[1.6] text-text-secondary">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* By department */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Use Cases
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              How each department uses Claude
            </h2>

            <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-2">
              {departments.map((dept, i) => {
                const Icon = dept.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]"
                  >
                    <div
                      className="mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink shadow-[2px_2px_0px_#1c1917]"
                      style={{ backgroundColor: dept.bgColor }}
                    >
                      <Icon className={`size-6 text-${dept.color}`} />
                    </div>
                    <div className="mb-4 text-[1.2rem] font-bold text-ink">
                      {dept.title}
                    </div>
                    <ul className="space-y-2">
                      {dept.useCases.map((uc, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-[0.9rem] leading-[1.6] text-text-secondary"
                        >
                          <span className="mt-1 text-teal">&#10003;</span>
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What blocks adoption */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Common Mistakes
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Why most AI rollouts underperform
            </h2>
            <div className="mt-10 space-y-6">
              {blockingPatterns.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full border-[2px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                        <Icon className="size-4 text-orange" />
                      </div>
                      <span className="text-[1.05rem] font-bold text-ink">
                        {b.title}
                      </span>
                    </div>
                    <p className="ml-[52px] text-[0.9rem] leading-[1.6] text-text-secondary">
                      {b.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Training options */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <h2 className="text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Structured training that actually sticks
            </h2>
            <p className="mx-auto mt-3 max-w-[600px] text-center text-[1rem] text-text-secondary">
              Learn to GPT was built to solve the adoption problem. Gamified
              lessons, live sandbox, and real workflows — not slide decks.
            </p>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {trainingOptions.map((opt, i) => (
                <div
                  key={i}
                  className="relative rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917]"
                >
                  {opt.badge && (
                    <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-orange px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                      {opt.badge}
                    </div>
                  )}
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange">
                    {opt.label}
                  </div>
                  <div className="mb-4 text-[1.4rem] font-bold text-ink">
                    {opt.title}
                  </div>
                  <ul className="mb-6 space-y-2">
                    {opt.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[0.9rem] leading-[1.6] text-text-secondary">
                        <span className="mt-1 text-teal">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {opt.cta.isEmail ? (
                    <a
                      href={opt.cta.href}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink px-8 py-3 font-bold shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917] ${
                        opt.cta.primary
                          ? "bg-orange text-white"
                          : "bg-cream text-ink"
                      }`}
                    >
                      {opt.cta.label}
                      <ArrowRight className="size-4" />
                    </a>
                  ) : (
                    <Link
                      href={opt.cta.href}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink px-8 py-3 font-bold shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917] ${
                        opt.cta.primary
                          ? "bg-orange text-white"
                          : "bg-cream text-ink"
                      }`}
                    >
                      {opt.cta.label}
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Ready to build a Claude-native team?
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Individuals start free. Teams get custom training.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/for-teams"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Team Training Details
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                View Masterclass
              </Link>
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
            <Link href="/for-teams" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Teams</Link>
            <Link href="/masterclass" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Masterclass</Link>
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
