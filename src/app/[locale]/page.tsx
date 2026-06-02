import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { FaqJsonLd } from "@/components/FaqJsonLd";

/*
 * Reconciliation note (Phase 5):
 *
 * A pre-existing src/app/page.tsx was a client component that caught Supabase
 * auth hash fragments (#access_token=...) and bounced users to /dashboard or
 * /sign-in. It also redirected every non-auth visit to the static
 * public/landing.html file.
 *
 * The primary OAuth flow uses server-side PKCE via /api/auth/callback, so the
 * hash handler is only a safety net for implicit-flow fallbacks. It was
 * renamed to src/app/auth-hash/page.tsx (route: /auth-hash) — no auth caller
 * points at "/" so nothing is wired to the old location. With the old file
 * out of the way, Next.js can route "/" to this React Server Component
 * (via next-intl's as-needed locale prefix → /{locale} segment).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}`;

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "Learn to GPT",
      title: t("title"),
      description: t("description"),
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Learn to GPT",
        },
      ],
      locale: locale.replace("-", "_"),
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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Structured Data — @graph with EducationalOrganization + WebSite */}
      <script
        type="application/ld+json"
        // Safe: own structured data, not user input
        // nosemgrep: react-dangerouslysetinnerhtml
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "EducationalOrganization",
                name: "Learn to GPT",
                url: "https://learntogpt.com",
                description:
                  "The gamified learning platform for ChatGPT. Master ChatGPT from first prompt to production with interactive lessons, hands-on exercises, and real-world projects across 7 tracks.",
                logo: "https://learntogpt.com/og-default.png",
                sameAs: [
                  "https://x.com/chong_reid",
                  "https://github.com/Rchong01010/spectre-framework",
                ],
              },
              {
                "@type": "WebSite",
                name: "Learn to GPT",
                url: "https://learntogpt.com",
                description:
                  "Learn ChatGPT from beginner to expert. 7 tracks from fundamentals to production. Available in 7 languages.",
              },
            ],
          }),
        }}
      />

      {/* FAQ structured data via reusable component */}
      <FaqJsonLd
        faqs={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
          question: t(`faq.q${i}`),
          answer: t(`faq.a${i}`),
        }))}
      />

      {/* ==================== 1. NAV ==================== */}
      <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
      <nav>
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
          <Link href="/" className="logo-serif text-[1.5rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="#tracks"
              className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden"
            >
              {t("nav.worlds")}
            </a>
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
              href="/sign-up"
              className="inline-flex items-center rounded-lg bg-orange px-[18px] py-[9px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      </nav>
      </header>

      <main className="flex-1">
        {/* ==================== 2. HERO ==================== */}
        <section className="px-6 pb-20 pt-[100px] text-center">
          {/* OpenAI-style top gradient bar */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0d8a6c] via-[#10a37f] to-[#1ac99a]" />
          <div className="mx-auto max-w-[1160px]">
            <h1 className="text-[4rem] font-extrabold leading-[1.1] tracking-tight text-ink max-md:text-[2.6rem] max-[480px]:text-[2rem]">
              <span className="text-gpt-green">
                {t("hero.headlineAccent")}
              </span>{" "}
              {t("hero.headline")}
            </h1>
            <p className="mt-3 text-[1.6rem] font-semibold tracking-tight text-ink/70 max-md:text-[1.3rem] max-[480px]:text-[1.05rem]">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[560px] text-[1.05rem] font-normal leading-[1.7] text-text-secondary">
              {t("hero.body")}
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <a
                href="#paths"
                className="inline-flex items-center justify-center rounded-lg bg-orange px-10 py-4 text-[1rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                {t("hero.ctaNew")}
              </a>
              <a
                href="#paths"
                className="inline-flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-10 py-4 text-[1rem] font-semibold text-ink shadow-sm transition-all hover:border-orange hover:shadow-md max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                {t("hero.ctaExisting")}
              </a>
            </div>
            <p className="text-[0.85rem] text-text-secondary">
              {t("hero.fine")}
            </p>
          </div>
        </section>

        {/* ==================== 2b. WHAT IS LEARN TO GPT — AEO CITATION LAYER ==================== */}
        <section className="px-6 py-[60px]">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("whatIs.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("whatIs.heading")}
            </h2>
            <div className="mt-8 rounded-[18px] border border-[#e5e7eb] bg-white p-8 shadow-sm">
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                {t("whatIs.body")}
              </p>
              <p className="mt-4 text-[0.95rem] leading-[1.7] text-text-secondary">
                {t("whatIs.forWhom")}
              </p>
              <p className="mt-4 text-[0.9rem] text-text-secondary">
                {t("whatIs.crossLink")}{" "}
                <a
                  href="https://claude-academy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal transition-colors hover:text-orange"
                >
                  claude-academy.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 3. ANTI-DUOLINGO ==================== */}
        <section className="px-6 py-[60px]">
          <div className="mx-auto max-w-[800px]">
            <div className="grid overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm max-md:grid-cols-1 md:grid-cols-2">
              {/* Left — Old Way */}
              <div className="anti-stripes relative bg-[#fafafa] p-[40px_36px] max-md:border-b max-md:border-dashed max-md:border-[#e5e7eb] max-[480px]:p-[28px_24px] md:border-r md:border-dashed md:border-[#e5e7eb]">
                <span className="mb-5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#c94040]">
                  {t("anti.labelOld")}
                </span>
                <ul className="flex flex-col gap-[14px]">
                  {[1, 2, 3, 4].map((i) => (
                    <li
                      key={i}
                      className="relative z-[1] text-[1.05rem] text-text-secondary line-through decoration-[#c94040] decoration-2"
                    >
                      {t(`anti.old${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right — Learn to GPT */}
              <div className="p-[40px_36px] max-[480px]:p-[28px_24px]">
                <span className="mb-5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-teal">
                  {t("anti.labelNew")}
                </span>
                <ul className="flex flex-col gap-[14px]">
                  {[1, 2, 3, 4].map((i) => (
                    <li
                      key={i}
                      className="relative pl-7 text-[1.05rem] font-bold text-ink before:absolute before:left-0 before:text-[1.1rem] before:font-extrabold before:text-teal before:content-['\2713']"
                    >
                      {t(`anti.new${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-7 text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              {t("anti.tagline")}
            </p>
          </div>
        </section>

        {/* ==================== 4. CHOOSE YOUR PATH ==================== */}
        <section id="paths" className="px-6 py-20">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("paths.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("paths.heading")}
            </h2>

            <div className="mx-auto mt-11 grid max-w-[880px] gap-8 max-md:max-w-[440px] max-md:grid-cols-1 md:grid-cols-2">
              {/* Path A — Beginner */}
              <Link
                href="/courses/why-claude/meet-claude"
                className="relative block cursor-pointer rounded-xl border border-[#e5e7eb] bg-white p-[36px_32px_32px] shadow-sm transition-all duration-300 hover:-translate-y-[4px] hover:border-orange hover:shadow-md max-[480px]:p-[28px_24px_24px]"
              >
                <div className="absolute -top-[12px] right-6 rounded-full bg-teal px-[14px] py-[5px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                  {t("paths.a.badge")}
                </div>
                <div className="mb-5 flex size-[64px] items-center justify-center rounded-2xl bg-[#d0f0ea] text-[2rem]">
                  &#127793;
                </div>
                <div className="mb-[10px] text-[1.3rem] font-extrabold text-ink">
                  {t("paths.a.title")}
                </div>
                <div className="mb-5 text-[0.95rem] leading-[1.6] text-text-secondary">
                  {t("paths.a.desc")}
                </div>
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.a.step1")}
                  </span>
                  <span className="text-[0.8rem] text-text-secondary">
                    &rarr;
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.a.step2")}
                  </span>
                  <span className="text-[0.8rem] text-text-secondary">
                    &rarr;
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.a.step3")}
                  </span>
                </div>
                <span className="inline-flex w-full items-center justify-center rounded-lg bg-teal px-[22px] py-[10px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-walnut">
                  {t("paths.a.cta")}
                </span>
              </Link>

              {/* Path B — Intermediate */}
              <Link
                href="/curriculum"
                className="relative block cursor-pointer rounded-xl border border-[#e5e7eb] bg-white p-[36px_32px_32px] shadow-sm transition-all duration-300 hover:-translate-y-[4px] hover:border-orange hover:shadow-md max-[480px]:p-[28px_24px_24px]"
              >
                <div className="absolute -top-[12px] right-6 rounded-full bg-orange px-[14px] py-[5px] font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                  {t("paths.b.badge")}
                </div>
                <div className="mb-5 flex size-[64px] items-center justify-center rounded-2xl bg-[#d0f0ea] text-[2rem]">
                  &#9889;
                </div>
                <div className="mb-[10px] text-[1.3rem] font-extrabold text-ink">
                  {t("paths.b.title")}
                </div>
                <div className="mb-5 text-[0.95rem] leading-[1.6] text-text-secondary">
                  {t("paths.b.desc")}
                </div>
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.b.step1")}
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.b.step2")}
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-[#e5e7eb] bg-[#f7f7f8] px-3 py-[5px] font-mono text-[0.72rem] font-semibold">
                    {t("paths.b.step3")}
                  </span>
                </div>
                <span className="inline-flex w-full items-center justify-center rounded-lg bg-orange px-[22px] py-[10px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-teal">
                  {t("paths.b.cta")}
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== 5. TRACKS TREASURE MAP ==================== */}
        <section id="tracks" className="px-6 py-20">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("tracks.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("tracks.heading")}
            </h2>

            <div className="relative mx-auto mt-11 max-w-[900px] py-10">
              {/* Decorative SVG paths */}
              <svg
                className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 900 620"
                preserveAspectRatio="none"
              >
                <path
                  d="M 220 100 C 300 100, 350 60, 450 80 S 550 120, 680 100"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 220 310 C 300 310, 350 270, 450 290 S 550 330, 680 310"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 220 180 C 220 220, 220 250, 220 270"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 680 180 C 680 220, 680 250, 680 270"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 350 420 C 400 450, 450 470, 450 500"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 550 420 C 500 450, 450 470, 450 500"
                  fill="none"
                  stroke="#d4cfc5"
                  strokeWidth="3"
                  strokeDasharray="12, 8"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative z-[1] grid gap-[32px_48px] max-md:grid-cols-1 max-md:gap-5 md:grid-cols-2">
                {/* World 01 */}
                <div className="island-bob island-bob-0 relative cursor-pointer rounded-xl border border-[#e5e7eb] border-l-4 border-l-teal bg-white p-[28px_24px_24px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -top-[12px] right-5 flex size-7 items-center justify-center rounded-full bg-teal text-[0.8rem] font-bold text-white shadow-sm">
                    01
                  </div>
                  <span className="mb-2 block text-[2rem]">&#127793;</span>
                  <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                    {t("tracks.world1.num")} &middot;{" "}
                    <span className="font-extrabold tracking-[0.1em] text-teal">
                      {t("tracks.world1.badge")}
                    </span>
                  </div>
                  <div className="mb-[6px] text-[1.15rem] font-bold text-ink">
                    {t("tracks.world1.title")}
                  </div>
                  <div className="text-[0.85rem] leading-[1.5] text-text-secondary">
                    {t("tracks.world1.desc")}
                  </div>
                  <div className="mt-2 text-[0.85rem] font-medium text-teal">
                    {t("tracks.world1.tagline")}
                  </div>
                </div>

                {/* World 02 */}
                <div className="island-bob island-bob-1 relative cursor-pointer rounded-xl border border-[#e5e7eb] border-l-4 border-l-orange bg-white p-[28px_24px_24px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -top-[12px] right-5 flex size-7 items-center justify-center rounded-full bg-orange text-[0.8rem] font-bold text-white shadow-sm">
                    02
                  </div>
                  <span className="mb-2 block text-[2rem]">&#128188;</span>
                  <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                    {t("tracks.world2.num")}
                  </div>
                  <div className="mb-[6px] text-[1.15rem] font-bold text-ink">
                    {t("tracks.world2.title")}
                  </div>
                  <div className="text-[0.85rem] leading-[1.5] text-text-secondary">
                    {t("tracks.world2.desc")}
                  </div>
                  <div className="mt-2 text-[0.85rem] font-medium text-orange">
                    {t("tracks.world2.tagline")}
                  </div>
                </div>

                {/* World 03 */}
                <div className="island-bob island-bob-2 relative cursor-pointer rounded-xl border border-[#e5e7eb] border-l-4 border-l-game-purple bg-white p-[28px_24px_24px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -top-[12px] right-5 flex size-7 items-center justify-center rounded-full bg-game-purple text-[0.8rem] font-bold text-white shadow-sm">
                    03
                  </div>
                  <span className="mb-2 block text-[2rem]">&#128187;</span>
                  <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                    {t("tracks.world3.num")}
                  </div>
                  <div className="mb-[6px] text-[1.15rem] font-bold text-ink">
                    {t("tracks.world3.title")}
                  </div>
                  <div className="text-[0.85rem] leading-[1.5] text-text-secondary">
                    {t("tracks.world3.desc")}
                  </div>
                  <div className="mt-2 text-[0.85rem] font-medium text-game-purple">
                    {t("tracks.world3.tagline")}
                  </div>
                </div>

                {/* World 04 */}
                <div className="island-bob island-bob-3 relative cursor-pointer rounded-xl border border-[#e5e7eb] border-l-4 border-l-game-blue bg-white p-[28px_24px_24px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -top-[12px] right-5 flex size-7 items-center justify-center rounded-full bg-game-blue text-[0.8rem] font-bold text-white shadow-sm">
                    04
                  </div>
                  <span className="mb-2 block text-[2rem]">&#129302;</span>
                  <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                    {t("tracks.world4.num")}
                  </div>
                  <div className="mb-[6px] text-[1.15rem] font-bold text-ink">
                    {t("tracks.world4.title")}
                  </div>
                  <div className="text-[0.85rem] leading-[1.5] text-text-secondary">
                    {t("tracks.world4.desc")}
                  </div>
                  <div className="mt-2 text-[0.85rem] font-medium text-game-blue">
                    {t("tracks.world4.tagline")}
                  </div>
                </div>

                {/* World 05 — spans full width */}
                <div className="island-bob island-bob-4 relative col-span-1 mx-auto w-full max-w-[420px] cursor-pointer rounded-xl border border-[#e5e7eb] border-l-4 border-l-orange bg-white p-[28px_24px_24px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md max-md:max-w-full md:col-span-2 md:justify-self-center">
                  <div className="absolute -top-[12px] right-5 flex size-7 items-center justify-center rounded-full bg-orange text-[0.8rem] font-bold text-white shadow-sm">
                    05
                  </div>
                  <span className="mb-2 block text-[2rem]">&#127942;</span>
                  <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                    {t("tracks.world5.num")} &middot;{" "}
                    <span className="font-extrabold tracking-[0.1em] text-orange">
                      {t("tracks.world5.badge")}
                    </span>
                  </div>
                  <div className="mb-[6px] text-[1.15rem] font-bold text-ink">
                    {t("tracks.world5.title")}
                  </div>
                  <div className="text-[0.85rem] leading-[1.5] text-text-secondary">
                    {t("tracks.world5.desc")}
                  </div>
                  <div className="mt-2 text-[0.85rem] font-medium text-orange">
                    {t("tracks.world5.tagline")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6. GAME ELEMENTS ==================== */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("game.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("game.heading")}
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {/* XP Bar */}
              <div className="game-tilt-0 rounded-xl border border-[#e5e7eb] bg-white p-[28px_20px] text-center shadow-sm transition-all duration-300">
                <div className="mb-4 flex min-h-[56px] items-center justify-center">
                  <div className="h-[14px] w-full overflow-hidden rounded-full bg-[#f0fdf8]">
                    <div className="xp-bar-fill" />
                  </div>
                </div>
                <div className="text-[0.95rem] font-bold text-ink">
                  {t("game.xp.title")}
                </div>
                <div className="text-[0.78rem] text-text-secondary">
                  {t("game.xp.desc")}
                </div>
              </div>

              {/* Badges */}
              <div className="game-tilt-1 rounded-xl border border-[#e5e7eb] bg-white p-[28px_20px] text-center shadow-sm transition-all duration-300">
                <div className="mb-4 flex min-h-[56px] items-center justify-center">
                  <div className="flex justify-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#d0f0ea] text-[1rem]">
                      &#127793;
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#fef3c7] text-[1rem]">
                      &#9889;
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#ede9fe] text-[1rem]">
                      &#128640;
                    </div>
                  </div>
                </div>
                <div className="text-[0.95rem] font-bold text-ink">
                  {t("game.badges.title")}
                </div>
                <div className="text-[0.78rem] text-text-secondary">
                  {t("game.badges.desc")}
                </div>
              </div>

              {/* Levels */}
              <div className="game-tilt-2 rounded-xl border border-[#e5e7eb] bg-white p-[28px_20px] text-center shadow-sm transition-all duration-300">
                <div className="mb-4 flex min-h-[56px] items-center justify-center">
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="flex size-7 items-center justify-center rounded-lg bg-orange font-mono text-[0.6rem] font-bold text-white"
                      >
                        {n}
                      </div>
                    ))}
                    <div className="level-pulse flex size-7 items-center justify-center rounded-lg bg-[#10a37f] font-mono text-[0.6rem] font-bold text-white">
                      4
                    </div>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#f7f7f8] font-mono text-[0.6rem] font-bold text-text-secondary">
                      5
                    </div>
                  </div>
                </div>
                <div className="text-[0.95rem] font-bold text-ink">
                  {t("game.levels.title")}
                </div>
                <div className="text-[0.78rem] text-text-secondary">
                  {t("game.levels.desc")}
                </div>
              </div>

              {/* Streak */}
              <div className="game-tilt-3 rounded-xl border border-[#e5e7eb] bg-white p-[28px_20px] text-center shadow-sm transition-all duration-300">
                <div className="mb-4 flex min-h-[56px] items-center justify-center">
                  <div className="flex items-center justify-center gap-[6px]">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="flex size-8 items-center justify-center rounded-full bg-[#fee2e2] text-[0.9rem]"
                      >
                        &#128293;
                      </div>
                    ))}
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#f7f7f8]" />
                  </div>
                </div>
                <div className="text-[0.95rem] font-bold text-ink">
                  {t("game.streaks.title")}
                </div>
                <div className="text-[0.78rem] text-text-secondary">
                  {t("game.streaks.desc")}
                </div>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-[640px] text-center text-[0.95rem] leading-[1.6] text-text-secondary">
              {t("game.caption")}
            </p>
          </div>
        </section>

        {/* ==================== 7. SANDBOX ==================== */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("sandbox.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("sandbox.heading")}
            </h2>

            <div className="relative mx-auto mt-11 max-w-[800px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-md">
              {/* Header bar — OpenAI dark */}
              <div className="flex items-center gap-2 bg-[#202123] px-5 py-[14px]">
                <div className="size-3 rounded-full bg-[#c94040]" />
                <div className="size-3 rounded-full bg-[#f59e0b]" />
                <div className="size-3 rounded-full bg-[#10a37f]" />
                <span className="ml-auto font-mono text-[0.75rem] text-white/50">
                  {t("sandbox.filename")}
                </span>
              </div>

              {/* Code body */}
              <div className="sandbox-lined relative min-h-[200px] bg-[#fafafa] p-7 max-md:p-5">
                <pre className="font-mono text-[0.85rem] leading-[32px] text-ink">
                  <code>
                    <span className="text-text-secondary">
                      {t("sandbox.comment1")}
                    </span>
                    {"\n"}
                    <span className="text-text-secondary">
                      {t("sandbox.comment2")}
                    </span>
                    {"\n\n"}
                    <span className="font-semibold text-orange">import</span>
                    {" openai\n\n"}
                    {"client = openai."}
                    <span className="text-game-purple">OpenAI</span>
                    {"()\n\n"}
                    {"response = client.chat.completions."}
                    <span className="text-game-purple">create</span>
                    {"(\n"}
                    {"    model="}
                    <span className="text-teal">
                      {'"gpt-4o"'}
                    </span>
                    {",\n"}
                    {"    system="}
                    <span className="text-teal">
                      {'"You are a senior code reviewer.\n    Be direct. Flag bugs. Suggest fixes."'}
                    </span>
                    {",\n"}
                    {"    messages=[{'{\"}\n'}"}
                    {"        "}
                    <span className="text-teal">{'"role"'}</span>
                    {": "}
                    <span className="text-teal">{'"user"'}</span>
                    {",\n"}
                    {"        "}
                    <span className="text-teal">{'"content"'}</span>
                    {": "}
                    <span className="text-teal">
                      {'"Review this function..."'}
                    </span>
                    {"\n    }]\n)"}
                  </code>
                </pre>
                {/* +25 XP stamp */}
                <div className="absolute bottom-5 right-5 rotate-[6deg] rounded-lg bg-teal px-4 py-2 font-mono text-[0.85rem] font-bold text-white shadow-sm">
                  {t("sandbox.stamp")}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#e5e7eb] px-7 py-5">
                <span className="max-w-[400px] text-[0.9rem] text-text-secondary">
                  {t("sandbox.footerText")}
                </span>
                <Link
                  href="/courses/why-claude/meet-claude"
                  className="inline-flex items-center rounded-lg bg-orange px-[22px] py-[10px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md"
                >
                  {t("sandbox.cta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 7b. WHAT YOU'LL BUILD ==================== */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("build.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("build.heading")}
            </h2>

            <div className="mt-10 grid gap-5 max-md:grid-cols-1 md:grid-cols-2">
              {/* Build Item 01 */}
              <div className="relative rounded-xl border border-[#e5e7eb] border-l-4 border-l-teal bg-white p-[32px_28px_28px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -top-[12px] left-6 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full bg-teal px-[14px] py-[5px] shadow-sm">
                    01
                  </span>
                </div>
                <div className="mb-[6px] mt-3 text-[1.15rem] font-extrabold text-ink">
                  {t("build.item1.title")}
                </div>
                <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("build.item1.desc")}
                </div>
              </div>

              {/* Build Item 02 */}
              <div className="relative rounded-xl border border-[#e5e7eb] border-l-4 border-l-orange bg-white p-[32px_28px_28px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -top-[12px] left-6 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full bg-orange px-[14px] py-[5px] shadow-sm">
                    02
                  </span>
                </div>
                <div className="mb-[6px] mt-3 text-[1.15rem] font-extrabold text-ink">
                  {t("build.item2.title")}
                </div>
                <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("build.item2.desc")}
                </div>
              </div>

              {/* Build Item 03 */}
              <div className="relative rounded-xl border border-[#e5e7eb] border-l-4 border-l-game-purple bg-white p-[32px_28px_28px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -top-[12px] left-6 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full bg-game-purple px-[14px] py-[5px] shadow-sm">
                    03
                  </span>
                </div>
                <div className="mb-[6px] mt-3 text-[1.15rem] font-extrabold text-ink">
                  {t("build.item3.title")}
                </div>
                <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("build.item3.desc")}
                </div>
              </div>

              {/* Build Item 04 */}
              <div className="relative rounded-xl border border-[#e5e7eb] border-l-4 border-l-game-blue bg-white p-[32px_28px_28px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="absolute -top-[12px] left-6 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                  <span className="rounded-full bg-game-blue px-[14px] py-[5px] shadow-sm">
                    04
                  </span>
                </div>
                <div className="mb-[6px] mt-3 text-[1.15rem] font-extrabold text-ink">
                  {t("build.item4.title")}
                </div>
                <div className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  {t("build.item4.desc")}
                </div>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-[640px] text-center font-mono text-[0.85rem] font-semibold tracking-[0.05em] text-text-secondary">
              {t("build.caption")}
            </p>
          </div>
        </section>

        {/* ==================== 8. CREDIBILITY ==================== */}
        <section className="px-6 py-[60px]">
          <div className="mx-auto max-w-[720px] rounded-xl border border-[#e5e7eb] bg-white p-10 text-center shadow-sm">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-teal">
              &#10003; {t("cred.badge")}
            </div>
            <div className="mb-7 text-[1.15rem] font-bold text-ink">
              {t("cred.headline")}
            </div>
            <div className="flex flex-wrap justify-center gap-10 max-md:gap-6">
              <div className="text-center">
                <div className="font-mono text-[2.2rem] font-bold leading-none text-teal max-[480px]:text-[1.6rem]">
                  {t("cred.levels.num")}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {t("cred.levels.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[2.2rem] font-bold leading-none text-orange max-[480px]:text-[1.6rem]">
                  {t("cred.challenges.num")}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {t("cred.challenges.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[2.2rem] font-bold leading-none text-game-purple max-[480px]:text-[1.6rem]">
                  {t("cred.worlds.num")}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {t("cred.worlds.label")}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[2.2rem] font-bold leading-none text-orange max-[480px]:text-[1.6rem]">
                  {t("cred.achievement.num")}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-text-secondary">
                  {t("cred.achievement.label")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 9. PRICING (removed in wave 2 — GTM bible v2.0 §3) ==================== */}

        {/* ==================== 10. FAQ ==================== */}
        <section id="faq" className="px-6 py-20">
          <div className="mx-auto max-w-[740px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              {t("faq.label")}
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              {t("faq.heading")}
            </h2>
            <div className="mt-10 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <details
                  key={i}
                  className="group overflow-hidden rounded-xl border border-[#e5e7eb] bg-white [&[open]]:border-orange/30 [&[open]]:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-[1rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {t(`faq.q${i}`)}
                    <span className="ml-4 shrink-0 text-[1.4rem] font-bold text-orange group-open:hidden">
                      +
                    </span>
                    <span className="ml-4 hidden shrink-0 text-[1.4rem] font-bold text-orange group-open:inline">
                      {"\u2212"}
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-[0.95rem] leading-[1.7] text-text-secondary">
                    {t(`faq.a${i}`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 11. FINAL CTA ==================== */}
        <section className="px-6 pb-[100px] pt-20 text-center">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] tracking-tight text-ink max-md:text-[1.9rem]">
              {t("finalCta.headline")}{" "}
              <span className="text-gpt-green">
                {t("finalCta.headlineAccent")}
              </span>
            </h2>
            <p className="mt-3 text-[1.2rem] font-medium text-text-secondary">
              {t("finalCta.subtitle")}
            </p>
            <div className="mt-9">
              <Link
                href="/courses/why-claude/meet-claude"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-10 py-4 text-[1.05rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md"
              >
                {t("finalCta.cta")}
                <ArrowRight className="size-5" />
              </Link>
            </div>
            <p className="mt-4 text-[0.85rem] text-text-secondary">
              {t("hero.fine")}
            </p>
          </div>
        </section>
      </main>

      {/* ==================== 12. FOOTER ==================== */}
      <footer className="border-t border-[#e5e7eb] py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <a
              href="#tracks"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("footer.worlds")}
            </a>
            <Link
              href="/curriculum"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("footer.curriculum")}
            </Link>
            <Link
              href="/terms"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/privacy"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("footer.privacy")}
            </Link>
            <a
              href="https://claude-academy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange"
            >
              {t("footer.claudeAcademy")}
            </a>
          </div>
          <p className="mb-2 text-[0.8rem] text-text-secondary">
            Built by{" "}
            <a
              href="https://x.com/chong_reid"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink transition-colors hover:text-orange"
            >
              @chong_reid
            </a>
          </p>
          <p className="text-[0.75rem] text-text-secondary">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
