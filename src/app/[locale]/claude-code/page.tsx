import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Terminal, Brain, Workflow, Settings, FileCode, Zap, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "claude-code" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Claude Code Tutorial — Learn to GPT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
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

const featureIcons = [Terminal, Brain, Workflow, Settings, FileCode, Zap];

export default async function ClaudeCodePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("claude-code");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code`;

  const features = [
    { title: t("features.0.title"), desc: t("features.0.desc") },
    { title: t("features.1.title"), desc: t("features.1.desc") },
    { title: t("features.2.title"), desc: t("features.2.desc") },
    { title: t("features.3.title"), desc: t("features.3.desc") },
    { title: t("features.4.title"), desc: t("features.4.desc") },
    { title: t("features.5.title"), desc: t("features.5.desc") },
  ];

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
                name: t("meta.title"),
                description: t("meta.description"),
                url: pathForLocale(locale),
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: "Claude Code — Advanced Workflows",
                description: t("meta.description"),
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Advanced",
                teaches: [
                  "Slash commands",
                  "Memory systems",
                  "Agent workflows",
                  "Hooks",
                  "CLAUDE.md configuration",
                ],
                inLanguage: locale,
                url: pathForLocale(locale),
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
                    name: "Claude Code Tutorial",
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
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                {t("nav.getStarted")}
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
              <Terminal className="size-4" />
              {t("trackInfo")}
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              {t("heading")}
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              {t("subheading")}
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[600px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              {t("intro")}
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                {t("cta")}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                {t("viewCurriculum")}
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                {t("directAnswer.text")}
              </p>
            </div>
          </div>
        </section>

        {/* WHAT IS CLAUDE CODE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                {t("whatIs.heading")}
              </h2>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                {t("whatIs.body")}
              </p>
            </div>
          </div>
        </section>

        {/* WHAT YOU'LL LEARN */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("whatYouLearn.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("whatYouLearn.heading")}
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = featureIcons[i];
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

        {/* TERMINAL PREVIEW */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              {/* Header bar */}
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[14px]">
                <div className="size-3 rounded-full border-2 border-white/30 bg-[#c94040]" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-gold" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">
                  CLAUDE.md
                </span>
              </div>

              {/* Code body */}
              <div className="sandbox-lined relative min-h-[180px] p-7 max-md:p-5">
                <pre className="font-mono text-[0.85rem] leading-[32px] text-ink">
                  <code>
                    <span className="text-text-secondary">
                      # Project Configuration
                    </span>
                    {"\n\n"}
                    <span className="font-semibold text-orange">## Commands</span>
                    {"\n"}
                    {"- Build: `npm run build`\n"}
                    {"- Test: `npm test`\n"}
                    {"- Lint: `npm run lint`\n\n"}
                    <span className="font-semibold text-orange">## Style Guide</span>
                    {"\n"}
                    {"- Use TypeScript strict mode\n"}
                    {"- Prefer named exports\n"}
                    {"- Max line length: 100 chars"}
                  </code>
                </pre>
                {/* +50 XP stamp */}
                <div className="absolute bottom-5 right-5 rotate-[6deg] rounded-[12px] border-[3px] border-ink bg-teal px-4 py-2 font-mono text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917]">
                  +50 XP
                </div>
              </div>
            </div>
            <p className="mt-5 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              {t("preview.caption")}
            </p>
          </div>
        </section>

        {/* HOW TO USE CLAUDE CODE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("howToUse.label")}
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("howToUse.heading")}
            </h2>
            <div className="space-y-4">
              {[
                { num: "1", title: t("howToUse.step1.title"), body: t("howToUse.step1.body") },
                { num: "2", title: t("howToUse.step2.title"), body: t("howToUse.step2.body") },
                { num: "3", title: t("howToUse.step3.title"), body: t("howToUse.step3.body") },
                { num: "4", title: t("howToUse.step4.title"), body: t("howToUse.step4.body") },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-teal font-mono text-[1rem] font-bold text-white shadow-[2px_2px_0px_#1c1917]">
                    {step.num}
                  </div>
                  <div>
                    <div className="mb-1 text-[1rem] font-bold text-ink">{step.title}</div>
                    <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMON WORKFLOWS */}
        <section className="px-6 py-16 bg-cream/40">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("commonWorkflows.label")}
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("commonWorkflows.heading")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: t("commonWorkflows.workflow1.title"), body: t("commonWorkflows.workflow1.body") },
                { title: t("commonWorkflows.workflow2.title"), body: t("commonWorkflows.workflow2.body") },
                { title: t("commonWorkflows.workflow3.title"), body: t("commonWorkflows.workflow3.body") },
                { title: t("commonWorkflows.workflow4.title"), body: t("commonWorkflows.workflow4.body") },
              ].map((wf) => (
                <div key={wf.title} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[4px_4px_0px_#1c1917]">
                  <h3 className="mb-2 text-[1.05rem] font-extrabold text-ink">{wf.title}</h3>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{wf.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLAUDE.MD EXPLAINED */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                {t("claudeMdExplained.heading")}
              </h2>
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                {t("claudeMdExplained.body")}
              </p>
              <div className="space-y-4">
                {[
                  { title: t("claudeMdExplained.tip1.title"), body: t("claudeMdExplained.tip1.body") },
                  { title: t("claudeMdExplained.tip2.title"), body: t("claudeMdExplained.tip2.body") },
                  { title: t("claudeMdExplained.tip3.title"), body: t("claudeMdExplained.tip3.body") },
                ].map((tip) => (
                  <div key={tip.title} className="rounded-[12px] border-[2px] border-ink/20 bg-linen p-5">
                    <div className="mb-1 text-[0.95rem] font-bold text-ink">{tip.title}</div>
                    <p className="text-[0.88rem] leading-[1.6] text-text-secondary">{tip.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("faq.heading")}
            </h2>
            <div className="space-y-4">
              {[
                { q: t("faq.q1"), a: t("faq.a1") },
                { q: t("faq.q2"), a: t("faq.a2") },
                { q: t("faq.q3"), a: t("faq.a3") },
                { q: t("faq.q4"), a: t("faq.a4") },
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
            <div className="mt-8 text-center">
              <Link
                href="/claude-code-tutorial"
                className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-orange transition-colors hover:text-ink"
              >
                Full Claude Code step-by-step tutorial <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              {t("finalCta.headline")}{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Code
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              {t("finalCta.subtitle")}
            </p>
            <div className="mt-9">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                {t("cta")}
                <ArrowRight className="size-5" />
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
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Master prompt techniques" },
                { href: "/certification", label: "Certification", desc: "Prove your Claude skills" },
                { href: "/getting-started", label: "Getting Started", desc: "New to Claude? Start here" },
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
            <Link
              href="/"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/curriculum"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("nav.curriculum")}
            </Link>
            <Link
              href="/terms"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("nav.terms")}
            </Link>
            <Link
              href="/privacy"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("nav.privacy")}
            </Link>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            {t("nav.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
