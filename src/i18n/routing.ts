import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * i18n routing configuration for Learn to GPT.
 *
 * Locale selection (see docs/plans for rationale):
 * - Asia-first: ja (Anthropic Tokyo), ko, zh-CN
 * - Europe: de (DACH), fr (francophone), es (Spain + LatAm upside)
 * - Americas: pt-BR (Brazil — organic traffic signal)
 * - en is the source locale and default.
 *
 * localePrefix 'as-needed' keeps English URLs prefix-free (`/dashboard`)
 * and prefixes all other locales (`/ja/dashboard`, `/de/dashboard`, …).
 */
export const routing = defineRouting({
  locales: ["en", "ja", "ko", "zh-CN", "de", "fr", "es", "pt-BR"] as const,
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Strict URL-based locale routing. Disabling automatic detection from
  // the NEXT_LOCALE cookie + Accept-Language header so that:
  //   /dashboard       → ALWAYS English content (default locale, no prefix)
  //   /de/dashboard    → ALWAYS German content
  // Without this, a user who visited any /de/* page earlier would have a
  // NEXT_LOCALE=de cookie set, and subsequent visits to unprefixed URLs
  // (/dashboard, /pricing, etc.) would render in German because next-intl's
  // request context picks the cookie locale, and getLocale() inside server
  // components then returns 'de' — which the locale-scoped DB queries
  // (courses, lessons) faithfully filter on. End result: English URL,
  // German content. Bad UX. Disabling detection here makes locale a pure
  // function of URL, which is what users expect from a localized SaaS.
  //
  // Trade-off: non-English users who land on `/` see the English landing.
  // They need to navigate to /ja, /de, etc. manually (or via a language
  // switcher we can add later). Acceptable for the weekend ship.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
