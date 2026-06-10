import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { routing } from "@/i18n/routing";
import { PLATFORM } from "@/lib/config";

/**
 * Sitemap for Learn to GPT with per-locale entries and hreflang alternates.
 *
 * Emits one URL per (public-route x locale) combination. Each URL has
 * `alternates.languages` listing every other locale's equivalent URL, which
 * is what Google uses to serve the right language version to international
 * search traffic.
 *
 * Default locale (`en`) has no prefix — `/pricing` — while other locales
 * use a path prefix like `/ja/pricing`. This matches the `localePrefix:
 * 'as-needed'` config in src/i18n/routing.ts.
 *
 * Free courses and their free lessons are also included so search engines
 * can discover and index the publicly accessible educational content.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com").trim();

  // Public routes that should appear in the sitemap. Auth routes
  // (/dashboard, /profile, /settings, /leaderboard, /missions)
  // stay out since they require a logged-in session.
  // Wave 2 (GTM bible v2.0 §3): /pricing is dropped from the sitemap. The
  // route still exists (redirects to /curriculum) so existing inbound links
  // don't 404, but we don't actively advertise it for indexing.
  const routes = ["", "/curriculum", "/learn", "/prompt-engineering", "/getting-started", "/ai-training", "/masterclass", "/for-teams", "/certification", "/affiliates/apply", "/sign-up", "/sign-in", "/privacy", "/terms", "/learn-chatgpt", "/chatgpt-tutorial", "/how-to-use-chatgpt", "/chatgpt-for-beginners", "/chatgpt-prompts", "/custom-gpts-tutorial", "/chatgpt-tips", "/chatgpt-for-business", "/chatgpt-vs-claude", "/chatgpt-api-tutorial", "/chatgpt-for-writers", "/chatgpt-for-data-analysis", "/chatgpt-for-marketing", "/chatgpt-vs-gemini", "/is-chatgpt-free", "/chatgpt-system-prompts", "/ai-certification", "/learn-ai", "/ai-for-beginners", "/ai-automation", "/ai-pair-programming", "/claude-vs-chatgpt", "/claude-for-developers", "/claude-api-tutorial", "/claude-code-setup", "/best-claude-prompts", "/claude-for-business", "/claude-projects", "/claude-memory", "/claude-code-cheat-sheet", "/claude-for-marketing", "/is-claude-free", "/claude-system-prompts", "/claude-vs-copilot", "/claude-tool-use", "/claude-agents", "/claude-code-tutorial", "/claude-sonnet-vs-opus", "/what-is-claude", "/claude-vs-gemini", "/claude-code-vs-cursor", "/claude-mcp-servers", "/claude-artifacts", "/claude-extended-thinking", "/claude-for-writers", "/claude-for-data-analysis", "/claude-code-debugging", "/claude-code-tdd", "/claude-code-projects", "/claude-hooks", "/claude-for-non-programmers", "/claude-batch-api", "/claude-context-window", "/claude-code-multi-agent", "/claude-code-security"];

  const pathFor = (locale: string, route: string) =>
    `${base}${locale === routing.defaultLocale ? "" : `/${locale}`}${route}`;

  // Static page entries
  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url: pathFor(locale, route),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, pathFor(loc, route)])
        ),
      },
    }))
  );

  // Fetch free courses and lessons from Supabase for dynamic entries.
  // Uses anon key (respects RLS) with a plain client — no cookies needed
  // since sitemap runs outside a user session context.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If env vars are missing (e.g. during build without DB access),
    // return static entries only rather than crashing the build.
    return staticEntries;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch free courses across all locales
  const { data: freeCourses } = await supabase
    .from("courses")
    .select("id, slug, locale")
    .eq("is_free", true)
    .eq("platform", PLATFORM);

  // Fetch free lessons joined with their course slug. lessons has no platform
  // column, so scope by platform through an inner join on courses — otherwise
  // the other platform's lesson URLs leak into this sitemap.
  const { data: freeLessons } = await supabase
    .from("lessons")
    .select("id, slug, locale, course_id, courses!inner(slug)")
    .eq("is_free", true)
    .eq("courses.platform", PLATFORM);

  const courseEntries: MetadataRoute.Sitemap = (freeCourses || []).map(
    (course: { id: string; slug: string; locale: string }) => {
      const courseRoute = `/courses/${course.slug}`;
      return {
        url: pathFor(course.locale, courseRoute),
        lastModified: new Date(),
        priority: 0.7 as const,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, pathFor(loc, courseRoute)])
          ),
        },
      };
    }
  );

  const lessonEntries: MetadataRoute.Sitemap = (freeLessons || []).map(
    (lesson: {
      id: string;
      slug: string;
      locale: string;
      course_id: string;
      courses: { slug: string }[];
    }) => {
      const courseSlug = lesson.courses?.[0]?.slug || "";
      const lessonRoute = `/courses/${courseSlug}/${lesson.slug}`;
      return {
        url: pathFor(lesson.locale, lessonRoute),
        lastModified: new Date(),
        priority: 0.6 as const,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, pathFor(loc, lessonRoute)])
          ),
        },
      };
    }
  );

  return [...staticEntries, ...courseEntries, ...lessonEntries];
}
