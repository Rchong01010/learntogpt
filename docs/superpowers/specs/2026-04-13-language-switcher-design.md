# Language Switcher — Design Spec

## Goal

Add a globe + language label dropdown to Claude Academy so users can switch between the 7 supported locales (en, ja, ko, zh-CN, de, fr, es). Ships on both the static English landing page and the React app shell / non-English landing.

## Decisions

- **Style:** Globe icon + current locale ISO code (e.g., "EN"). No country flags. Dropdown shows native script name + ISO code.
- **Scope:** Landing page nav + authenticated app shell top bar. No settings page persistence.
- **Behavior:** Pure URL-based navigation. No cookies, no DB writes, no `Accept-Language` detection.
- **No new dependencies.**

## Two implementations

### 1. Vanilla JS — `public/landing.html`

Inject a globe dropdown into the existing static nav bar, between "Pricing" and "Sign In". Self-contained HTML + CSS + JS within the file.

- Click globe → toggles dropdown visibility
- Dropdown: 7 items, each an `<a href>` to the locale root (`/ja`, `/ko`, `/zh-CN`, `/de`, `/fr`, `/es`, `/`)
- Current locale (English, since this is the static landing) is visually highlighted
- Click outside or Escape → closes dropdown
- Dropdown right-aligned below trigger to prevent overflow
- Styled to match existing nav design system (Sora font, `--ink`, `--surface`, `--border-thick`, `--shadow-sm` vars)

### 2. React component — `src/components/LocaleSwitcher.tsx`

Client component (`"use client"`) used in two places:
- `src/app/[locale]/page.tsx` (React landing nav for non-English)
- `src/app/[locale]/(app)/app-shell.tsx` (authenticated app top bar)

Implementation:
- Uses `usePathname()` and `useRouter()` from `@/i18n/routing`
- Uses `useLocale()` from `next-intl` to know current locale
- `useParams()` to get current locale from URL
- On select: `router.replace(pathname, { locale: selectedLocale })`
- Globe icon: Lucide `Globe` icon (already in project deps)
- Dropdown: plain div with absolute positioning, no shadcn Popover needed
- Close on click-outside via `useEffect` + document click listener
- Close on Escape via keydown listener
- Accessible: `role="listbox"`, `aria-label`, `aria-expanded`

### Dropdown items (both implementations)

| Display | Code | href pattern |
|---|---|---|
| English | EN | `/` (or current path without locale prefix) |
| 日本語 | JA | `/ja` + current path |
| 한국어 | KO | `/ko` + current path |
| 简体中文 | ZH | `/zh-CN` + current path |
| Deutsch | DE | `/de` + current path |
| Français | FR | `/fr` + current path |
| Español | ES | `/es` + current path |

### Placement

- **Landing page nav:** Between "Pricing" and "Sign In" links
- **App shell:** Left of the XP badge in the right-side cluster

### Proxy (`src/proxy.ts`)

No changes needed. The static `landing.html` rewrite stays for English root. The locale links (`/ja`, `/de`, etc.) already route correctly through next-intl middleware.

## Out of scope

- `user_profiles.preferred_locale` DB persistence
- Multi-currency Stripe
- Full static → React landing port
- Additional locales (ar, pt-BR)
- Mobile hamburger menu integration (globe shows in top bar on mobile too — if nav collapses, globe stays visible)

## Files touched

1. `public/landing.html` — add vanilla JS globe dropdown to nav
2. `src/components/LocaleSwitcher.tsx` — new React client component
3. `src/app/[locale]/page.tsx` — import and place `<LocaleSwitcher>` in nav
4. `src/app/[locale]/(app)/app-shell.tsx` — import and place `<LocaleSwitcher>` in top bar
5. `messages/en.json` — add `localeSwitcher` namespace with `"label": "Language"` (for aria-label)
6. `messages/{ja,ko,zh-CN,de,fr,es}.json` — same key translated
