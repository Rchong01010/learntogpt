import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PLATFORM } from "@/lib/config";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ArrowRight, BookOpen, Sparkles, Code, Wrench, Award, Cog, Terminal } from "lucide-react";

// Force dynamic rendering — lesson counts change, and SSG at build time
// would call createSupabaseAdmin() without a request context (same issue
// as /pricing — see that file for history).
export const dynamic = "force-dynamic";

const trackConfig = [
  { key: "why_claude", icon: Sparkles, color: "orange" },
  { key: "three_levels", icon: BookOpen, color: "teal" },
  { key: "essentials", icon: Code, color: "ink" },
  { key: "level_up", icon: Wrench, color: "walnut" },
  { key: "build_something", icon: Award, color: "purple" },
  { key: "practitioner_setup", icon: Cog, color: "orange" },
  { key: "advanced_workflows", icon: Terminal, color: "teal" },
] as const;

const TRACK_ACCENT: Record<string, string> = {
  orange: "bg-orange/10 text-orange",
  teal: "bg-teal/10 text-teal",
  ink: "bg-ink/5 text-ink",
  walnut: "bg-walnut/10 text-walnut",
  purple: "bg-purple-100 text-purple-700",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "curriculum" });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/curriculum`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: [
      "claude ai course",
      "claude ai courses",
      "best claude ai course",
      "claude ai training",
      "free claude ai course",
      "claude code course",
      "prompt engineering course",
      "anthropic claude tutorial",
      "learn claude ai",
      "claude academy",
    ],
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: pathForLocale(locale),
      siteName: "Learn to GPT",
      type: "website",
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT Courses — Free Interactive Training" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
    },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, pathForLocale(loc)])
      ),
    },
  };
}

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("curriculum");
  const supabase = await createSupabaseServer();

  // Fetch courses for this locale
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, track, difficulty, order_index, is_free, icon"
    )
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .order("order_index", { ascending: true });

  // Count lessons per course
  const { data: lessonRows } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("locale", locale);

  const lessonCountMap: Record<string, number> = {};
  if (lessonRows) {
    for (const l of lessonRows) {
      lessonCountMap[l.course_id] = (lessonCountMap[l.course_id] || 0) + 1;
    }
  }

  // Group courses by track
  const trackGroups = trackConfig.map((track) => ({
    ...track,
    courses: (courses || []).filter(
      (c: { track: string }) => c.track === track.key
    ),
  }));

  // Wave 2 (GTM bible v2.0 §3): split tracks into two pathways. Both are free.
  // Starter = why_claude + three_levels + essentials.
  // Advanced Practitioner = level_up + build_something.
  const STARTER_TRACK_KEYS = new Set([
    "why_claude",
    "three_levels",
    "essentials",
  ]);
  const starterTracks = trackGroups.filter((t) =>
    STARTER_TRACK_KEYS.has(t.key)
  );
  const advancedTracks = trackGroups.filter(
    (t) => !STARTER_TRACK_KEYS.has(t.key)
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  // Build JSON-LD Course schemas
  const courseSchemas = (courses || []).map(
    (course: {
      title: string;
      slug: string;
      description: string;
      is_free: boolean;
      difficulty: string;
    }) => ({
      "@type": "Course" as const,
      name: course.title,
      description: course.description,
      url: `${baseUrl}${localePrefix}/courses/${course.slug}`,
      provider: {
        "@type": "EducationalOrganization" as const,
        name: "Learn to GPT",
        url: "https://learntogpt.com",
      },
      isAccessibleForFree: course.is_free,
      educationalLevel: course.difficulty || "beginner",
      inLanguage: locale,
      hasCourseInstance: {
        "@type": "CourseInstance" as const,
        courseMode: "online",
      },
    })
  );

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t("meta.title"),
            description: t("meta.description"),
            numberOfItems: courseSchemas.length,
            itemListElement: courseSchemas.map(
              (course: Record<string, unknown>, i: number) => ({
                "@type": "ListItem",
                position: i + 1,
                item: course,
              })
            ),
          }),
        }}
      />

      {/* Navigation — matches landing page */}
      <nav className="sticky top-0 z-50 border-b-[3px] border-ink bg-warm-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-[10px] border-[2px] border-ink bg-orange text-xs font-bold text-white shadow-[2px_2px_0px_#1c1917]">
              CA
            </div>
            <span className="logo-serif text-lg text-ink">Learn to GPT</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://claude-setup-page.vercel.app/masterclass.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-text-secondary transition-colors hover:text-ink"
            >
              {t("nav.masterclass")}
            </a>
            <LocaleSwitcher />
            <Link
              href="/sign-up"
              className="inline-flex h-8 items-center rounded-full border-[2px] border-ink bg-ink px-4 text-sm font-bold text-cream transition-all hover:bg-walnut"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-12 pt-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {t("subheading")}
          </p>
        </section>

        {/* Pathway: Starter */}
        <section className="mx-auto max-w-5xl px-6 pt-4 pb-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
            {t("pathways.starter.label")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">
            {t("pathways.starter.heading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {t("pathways.starter.body")}
          </p>
        </section>

        {starterTracks.map((track) => {
          const Icon = track.icon;
          const accent = TRACK_ACCENT[track.color] || TRACK_ACCENT.ink;
          const [accentBg, accentText] = accent.split(" ");
          return (
            <section key={track.key} className="mx-auto max-w-5xl px-6 pb-16">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-[10px] border-[2px] border-ink ${accentBg}`}
                >
                  <Icon className={`size-5 ${accentText}`} />
                </div>
                <h3 className="text-2xl font-extrabold text-ink">
                  {t(`tracks.${track.key}`)}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {track.courses.map(
                  (course: {
                    id: string;
                    slug: string;
                    title: string;
                    description: string;
                    is_free: boolean;
                  }) => {
                    const cardContent = (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full border-[2px] border-ink bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-teal">
                            {t("free")}
                          </span>
                          {lessonCountMap[course.id] && (
                            <span className="text-xs font-semibold text-text-secondary">
                              {lessonCountMap[course.id]} {t("lessons")}
                            </span>
                          )}
                        </div>
                        <h4 className="mb-2 text-base font-bold text-ink">
                          {course.title}
                        </h4>
                        <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                          {course.description}
                        </p>
                      </>
                    );
                    return course.is_free ? (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="rounded-[14px] border-[3px] border-ink bg-warm-white p-5 shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div
                        key={course.id}
                        className="rounded-[14px] border-[3px] border-ink bg-warm-white p-5 shadow-[3px_3px_0px_#1c1917]"
                      >
                        {cardContent}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          );
        })}

        {/* Pathway: Advanced Practitioner */}
        <section className="mx-auto max-w-5xl px-6 pt-4 pb-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
            {t("pathways.advanced.label")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">
            {t("pathways.advanced.heading")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {t("pathways.advanced.body")}
          </p>
        </section>

        {advancedTracks.map((track) => {
          const Icon = track.icon;
          const accent = TRACK_ACCENT[track.color] || TRACK_ACCENT.ink;
          const [accentBg, accentText] = accent.split(" ");
          return (
            <section key={track.key} className="mx-auto max-w-5xl px-6 pb-16">
              <div className="mb-6 flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-[10px] border-[2px] border-ink ${accentBg}`}
                >
                  <Icon className={`size-5 ${accentText}`} />
                </div>
                <h3 className="text-2xl font-extrabold text-ink">
                  {t(`tracks.${track.key}`)}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {track.courses.map(
                  (course: {
                    id: string;
                    slug: string;
                    title: string;
                    description: string;
                    is_free: boolean;
                  }) => {
                    const cardContent = (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full border-[2px] border-ink bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-teal">
                            {t("free")}
                          </span>
                          {lessonCountMap[course.id] && (
                            <span className="text-xs font-semibold text-text-secondary">
                              {lessonCountMap[course.id]} {t("lessons")}
                            </span>
                          )}
                        </div>
                        <h4 className="mb-2 text-base font-bold text-ink">
                          {course.title}
                        </h4>
                        <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                          {course.description}
                        </p>
                      </>
                    );
                    return course.is_free ? (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="rounded-[14px] border-[3px] border-ink bg-warm-white p-5 shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div
                        key={course.id}
                        className="rounded-[14px] border-[3px] border-ink bg-warm-white p-5 shadow-[3px_3px_0px_#1c1917]"
                      >
                        {cardContent}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            {t("cta.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            {t("cta.body")}
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-7 text-sm font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
            >
              {t("cta.button")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer — matches landing page */}
      <footer className="border-t-[3px] border-ink bg-warm-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="flex size-6 items-center justify-center rounded-[8px] border-[2px] border-ink bg-orange text-[10px] font-bold text-white">
                CA
              </div>
              <span className="font-semibold">Learn to GPT</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-secondary">
              <Link
                href="/curriculum"
                className="font-semibold text-ink"
              >
                {t("nav.curriculum")}
              </Link>
              <a
                href="https://claude-setup-page.vercel.app/masterclass.html"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {t("nav.masterclass")}
              </a>
              <Link
                href="/privacy"
                className="transition-colors hover:text-ink"
              >
                {t("nav.privacy")}
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-ink"
              >
                {t("nav.terms")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
