import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  BookOpen,
  Terminal,
  Trophy,
  Users,
  Globe,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ai-training" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-training`;

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
          alt: "AI Training Program — Learn to GPT",
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

const trackIcons = [Sparkles, BookOpen, Terminal];

export default async function AITrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ai-training");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-training`;

  const tracks = [
    {
      level: t("tracks.beginner.level"),
      title: t("tracks.beginner.title"),
      desc: t("tracks.beginner.desc"),
      color: "bg-[#d0f0ea]",
      iconColor: "text-teal",
    },
    {
      level: t("tracks.intermediate.level"),
      title: t("tracks.intermediate.title"),
      desc: t("tracks.intermediate.desc"),
      color: "bg-[#ffecd2]",
      iconColor: "text-orange",
    },
    {
      level: t("tracks.advanced.level"),
      title: t("tracks.advanced.title"),
      desc: t("tracks.advanced.desc"),
      color: "bg-[#e8d5f5]",
      iconColor: "text-[#7c3aed]",
    },
  ];

  const benefits = [
    { icon: Trophy, title: t("benefits.gamified.title"), body: t("benefits.gamified.body") },
    { icon: Users, title: t("benefits.teams.title"), body: t("benefits.teams.body") },
    { icon: Globe, title: t("benefits.languages.title"), body: t("benefits.languages.body") },
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
                name: "AI Training Program — Learn to GPT",
                description: t("meta.description"),
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                hasCourseInstance: [
                  {
                    "@type": "CourseInstance",
                    courseMode: "online",
                    courseWorkload: "PT20H",
                  },
                ],
                teaches: [
                  "ChatGPT fundamentals",
                  "Prompt engineering",
                  "Context management",
                  "ChatGPT workflows",
                  "AI agent development",
                ],
                educationalLevel: ["Beginner", "Intermediate", "Advanced"],
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <GraduationCap className="size-4" />
              {t("badge")}
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              {t("heading")}
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              {t("subheading")}
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[600px] text-[1.05rem] leading-[1.7] text-text-secondary">
              {t("intro")}
            </p>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
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
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              {t("ctaFine")}
            </p>
          </div>
        </section>

        {/* Training Tracks */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("tracks.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("tracks.heading")}
            </h2>

            <div className="mx-auto mt-10 grid max-w-[900px] gap-6 md:grid-cols-3">
              {tracks.map((track, i) => {
                const Icon = trackIcons[i];
                return (
                  <Link
                    key={i}
                    href="/curriculum"
                    className="relative block rounded-[24px] border-[4px] border-ink bg-cream p-[32px_28px_28px] shadow-[4px_4px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_8px_0px_#1c1917]"
                  >
                    <div className="absolute -top-[14px] right-5 rounded-full border-[3px] border-ink bg-ink px-[14px] py-[6px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-[3px_3px_0px_#1c1917]">
                      {track.level}
                    </div>
                    <div
                      className={`mb-4 flex size-[56px] items-center justify-center rounded-full border-[3px] border-ink ${track.color} shadow-[2px_2px_0px_#1c1917]`}
                    >
                      <Icon className={`size-6 ${track.iconColor}`} />
                    </div>
                    <div className="mb-2 text-[1.2rem] font-bold text-ink">
                      {track.title}
                    </div>
                    <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                      {track.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-orange">
                      {t("tracks.explore")}
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("benefits.heading")}
            </h2>
            <div className="mt-10 space-y-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={i}
                    className="flex gap-5 rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-orange" />
                    </div>
                    <div>
                      <div className="mb-1 text-[1.05rem] font-bold text-ink">
                        {benefit.title}
                      </div>
                      <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                        {benefit.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Masterclass CTA */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                {t("masterclass.heading")}
              </h2>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                {t("masterclass.body")}
              </p>
              <div className="mt-6">
                <Link
                  href="/courses/why-chatgpt/meet-chatgpt"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-8 py-3 text-[1rem] font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
                >
                  {t("masterclass.cta")}
                  <ArrowRight className="size-5" />
                </Link>
              </div>
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
                href="/courses/why-chatgpt/meet-chatgpt"
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
                { href: "/learn", label: "Learn ChatGPT", desc: "Browse the full course catalog" },
                { href: "/masterclass", label: "Masterclass", desc: "Advanced guided training" },
                { href: "/for-teams", label: "For Teams", desc: "Train your whole team" },
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
