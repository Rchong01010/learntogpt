import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn.meta" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/learn`;

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Learn to GPT — Learn ChatGPT AI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
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

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

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
                name: t("heading"),
                description: t("meta.description"),
                url: `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/learn`,
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: t("course1.title"),
                description: t("course1.description"),
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                isAccessibleForFree: true,
                inLanguage: locale,
                educationalLevel: "Beginner",
              },
              {
                "@type": "Course",
                name: t("course2.title"),
                description: t("course2.description"),
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                isAccessibleForFree: true,
                inLanguage: locale,
                educationalLevel: "Intermediate",
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
                    item: `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/learn`,
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
                href="/courses/why-claude/meet-claude"
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
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              {t("heading")}
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              {t("subheading")}
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[600px] text-[1.05rem] leading-[1.7] text-text-secondary">
              {t("intro")}
            </p>
            <Link
              href="/courses/why-claude/meet-claude"
              className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              {t("cta")}
              <ArrowRight className="size-5" />
            </Link>
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              {t("ctaFine")}
            </p>
          </div>
        </section>

        {/* Free courses */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("freeCourses.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("freeCourses.heading")}
            </h2>

            <div className="mx-auto mt-10 grid max-w-[800px] gap-6 md:grid-cols-2">
              {/* Course 1 — Meet ChatGPT */}
              <Link
                href="/curriculum"
                className="relative block rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0px_#1c1917]"
              >
                <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-teal px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                  {t("freeCourses.freeBadge")}
                </div>
                <div className="mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                  <Sparkles className="size-6 text-teal" />
                </div>
                <div className="mb-2 text-[1.2rem] font-bold text-ink">
                  {t("course1.title")}
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("course1.description")}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-orange">
                  {t("freeCourses.startLearning")}
                  <ArrowRight className="size-4" />
                </span>
              </Link>

              {/* Course 2 — AEO / Practitioner Setup */}
              <Link
                href="/curriculum"
                className="relative block rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0px_#1c1917]"
              >
                <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-teal px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                  {t("freeCourses.freeBadge")}
                </div>
                <div className="mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                  <BookOpen className="size-6 text-orange" />
                </div>
                <div className="mb-2 text-[1.2rem] font-bold text-ink">
                  {t("course2.title")}
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("course2.description")}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-orange">
                  {t("freeCourses.startLearning")}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Learn to GPT */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("why.heading")}
            </h2>
            <div className="mt-10 space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-1 text-[1.05rem] font-bold text-ink">
                    {t(`why.point${i}.title`)}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                    {t(`why.point${i}.body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              {t("finalCta.headline")}
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              {t("finalCta.subtitle")}
            </p>
            <div className="mt-8">
              <Link
                href="/courses/why-claude/meet-claude"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                {t("cta")}
                <ArrowRight className="size-5" />
              </Link>
            </div>
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              {t("ctaFine")}
            </p>
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
                { href: "/getting-started", label: "Getting Started", desc: "Your first steps with ChatGPT" },
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Write better prompts" },
                { href: "/ai-training", label: "AI Training", desc: "Full training program" },
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
