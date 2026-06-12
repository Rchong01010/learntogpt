import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MessageSquare, Brain, Layers, Lightbulb, Wrench, Target, HelpCircle, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prompt-engineering" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/prompt-engineering`;

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
          alt: "Prompt Engineering for ChatGPT — Learn to GPT",
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

const skillIcons = [MessageSquare, Brain, Layers, Lightbulb, Wrench, Target];

export default async function PromptEngineeringPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prompt-engineering");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/prompt-engineering`;

  const skills = [
    { title: t("skills.0.title"), desc: t("skills.0.desc") },
    { title: t("skills.1.title"), desc: t("skills.1.desc") },
    { title: t("skills.2.title"), desc: t("skills.2.desc") },
    { title: t("skills.3.title"), desc: t("skills.3.desc") },
    { title: t("skills.4.title"), desc: t("skills.4.desc") },
    { title: t("skills.5.title"), desc: t("skills.5.desc") },
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
                name: t("heading"),
                description: t("meta.description"),
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Beginner to Intermediate",
                teaches: [
                  "Context window management",
                  "System prompts",
                  "Few-shot examples",
                  "Chain-of-thought prompting",
                  "Tool use",
                  "Structured output",
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
                    name: t("heading"),
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
                href="/courses/why-chatgpt/context-is-everything"
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <MessageSquare className="size-4" />
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
                href="/courses/why-chatgpt/context-is-everything"
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
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                {t("directAnswer.text")}
              </p>
            </div>
          </div>
        </section>

        {/* WHAT IS PROMPT ENGINEERING */}
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

        {/* KEY SKILLS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("skillsSection.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("skillsSection.heading")}
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill, i) => {
                const Icon = skillIcons[i];
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-orange" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">
                      {skill.title}
                    </div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                      {skill.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROMPT EXAMPLE PREVIEW */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
              {/* Header bar */}
              <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[14px]">
                <div className="size-3 rounded-full border-2 border-white/30 bg-[#c94040]" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-gold" />
                <div className="size-3 rounded-full border-2 border-white/30 bg-teal" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/60">
                  prompt.md
                </span>
              </div>

              {/* Code body */}
              <div className="sandbox-lined relative min-h-[180px] p-7 max-md:p-5">
                <pre className="font-mono text-[0.85rem] leading-[32px] text-ink">
                  <code>
                    <span className="text-text-secondary">
                      # System Prompt
                    </span>
                    {"\n\n"}
                    <span className="font-semibold text-orange">## Role</span>
                    {"\n"}
                    {"You are a data analyst.\n\n"}
                    <span className="font-semibold text-orange">## Context</span>
                    {"\n"}
                    {"The user will provide CSV data.\n\n"}
                    <span className="font-semibold text-orange">## Instructions</span>
                    {"\n"}
                    {"- Think step by step\n"}
                    {"- Show your reasoning\n"}
                    {"- Return structured JSON"}
                  </code>
                </pre>
                {/* +50 XP stamp */}
                <div className="absolute bottom-5 right-5 rotate-[6deg] rounded-[12px] border-[3px] border-ink bg-orange px-4 py-2 font-mono text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917]">
                  +50 XP
                </div>
              </div>
            </div>
            <p className="mt-5 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              {t("preview.caption")}
            </p>
          </div>
        </section>

        {/* 5 TECHNIQUES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("techniques.label")}
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("techniques.heading")}
            </h2>
            <div className="space-y-6">
              {[
                { title: t("techniques.technique1.title"), body: t("techniques.technique1.body"), example: t("techniques.technique1.example") },
                { title: t("techniques.technique2.title"), body: t("techniques.technique2.body"), example: t("techniques.technique2.example") },
                { title: t("techniques.technique3.title"), body: t("techniques.technique3.body"), example: t("techniques.technique3.example") },
                { title: t("techniques.technique4.title"), body: t("techniques.technique4.body"), example: t("techniques.technique4.example") },
                { title: t("techniques.technique5.title"), body: t("techniques.technique5.body"), example: t("techniques.technique5.example") },
              ].map((tech, i) => (
                <div key={i} className="overflow-hidden rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="p-6">
                    <div className="mb-1 flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-[#ffecd2] text-[0.75rem] font-bold text-ink">
                        {i + 1}
                      </div>
                      <h3 className="text-[1.1rem] font-bold text-ink">{tech.title}</h3>
                    </div>
                    <p className="mt-3 text-[0.92rem] leading-[1.6] text-text-secondary">{tech.body}</p>
                  </div>
                  <div className="border-t-[2px] border-ink/20 bg-[#1c1917]">
                    <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-[0.8rem] leading-[1.7] text-linen">
                      <code>{tech.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-orange transition-colors hover:text-ink"
              >
                See 20 ready-to-use prompt templates <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* COMMON MISTAKES */}
        <section className="px-6 py-16 bg-cream/40">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("commonMistakes.label")}
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("commonMistakes.heading")}
            </h2>
            <div className="space-y-6">
              {[
                { title: t("commonMistakes.mistake1.title"), bad: t("commonMistakes.mistake1.bad"), good: t("commonMistakes.mistake1.good"), why: t("commonMistakes.mistake1.why") },
                { title: t("commonMistakes.mistake2.title"), bad: t("commonMistakes.mistake2.bad"), good: t("commonMistakes.mistake2.good"), why: t("commonMistakes.mistake2.why") },
                { title: t("commonMistakes.mistake3.title"), bad: t("commonMistakes.mistake3.bad"), good: t("commonMistakes.mistake3.good"), why: t("commonMistakes.mistake3.why") },
              ].map((m) => (
                <div key={m.title} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="size-5 text-orange" />
                    <h3 className="text-[1.05rem] font-bold text-ink">{m.title}</h3>
                  </div>
                  <div className="mb-3 rounded-[8px] bg-[#fde8e8] p-3 font-mono text-[0.82rem] text-[#c94040]">
                    Bad: &quot;{m.bad}&quot;
                  </div>
                  <div className="mb-3 rounded-[8px] bg-[#d0f0ea] p-3 font-mono text-[0.82rem] text-teal">
                    Good: &quot;{m.good}&quot;
                  </div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    <strong className="text-ink">Why:</strong> {m.why}
                  </p>
                </div>
              ))}
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
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-orange" />
                    <h3 className="text-[1rem] font-bold text-ink">{item.q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/claude-system-prompts"
                className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-orange transition-colors hover:text-ink"
              >
                Learn how to write system prompts <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              {t("finalCta.headline")}
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              {t("finalCta.subtitle")}
            </p>
            <div className="mt-9">
              <Link
                href="/courses/why-chatgpt/context-is-everything"
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
                { href: "/claude-code", label: "Claude Code", desc: "Advanced coding workflows" },
                { href: "/certification", label: "Certification", desc: "Prove your prompt skills" },
                { href: "/learn", label: "Learn ChatGPT", desc: "Browse the full course catalog" },
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
