# Landing Page React Migration — Design Spec

**Date:** 2026-04-13
**Goal:** Replace `public/landing.html` (static 1534-line HTML) with a 1:1 React Server Component at `src/app/[locale]/page.tsx`, fully i18n-ready, using Tailwind utility classes.

## Context

The static HTML landing page is the polished "Design F — Illustrated Indie Game" layout with 12 sections, rich visual character (italic serif headlines, thick-bordered cards, offset shadows, bobbing island animations, tilted game cards, faux terminal sandbox). During the i18n weekend (2026-04-11), a simplified React landing page was built for non-English locales, while English was reverted to the static HTML (commit `fbf25ce`). This migration makes English use the same React page, with all 12 sections ported faithfully.

## Sections to Port (in order)

### 1. Navigation
- Italic serif logo: `<span class="text-orange">Claude</span> Academy` using `font-serif`
- Links: Worlds (anchor `#tracks`), Pricing (anchor `#pricing`), Curriculum (`/curriculum`)
- Language switcher (already exists as `<LocaleSwitcher />`)
- Log In link + "Start Free" pill button

### 2. Hero
- Headline: `<em>Claude</em> is the new language.` — `em` rendered with `font-serif italic text-orange font-normal`
- Subtitle: "Learn to speak it." — `font-serif italic text-walnut text-[2.2rem]`
- Body paragraph
- Dual CTAs: "I'm New to Claude" (primary) + "I Already Use Claude" (secondary), both anchor to `#paths`
- Fine print: "Free to start. No credit card needed. Not affiliated with Anthropic."

### 3. Anti-Duolingo Comparison
- 2-column card with dashed border separator
- Left side: "The old way" label (red/mono), strikethrough list (Flashcards, Lecture videos, Multiple choice quizzes, Abstract theory), diagonal stripe `::after` overlay
- Right side: "Claude Academy" label (teal/mono), checkmark list (Live sandbox, Real prompts, Build actual things, Ship to production) with `::before` checkmark pseudo-elements
- Bottom tagline: "Not flashcards. Real fluency."

### 4. Choose Your Path
- Section label "Choose Your Quest" + heading "Where do you want to start?"
- 2-column grid of path cards with hover lift (`translateY(-6px)`)
- **Path A (Start from Zero):** teal badge "Free", seedling icon, progression pills (Foundations -> Professional -> Claude Code), teal CTA
- **Path B (Level Up):** orange badge "Skip Ahead", lightning icon, progression pills (System Prompts, Claude Code, API), orange CTA
- Both link to `/sign-up?path=beginner` / `/sign-up?path=intermediate`

### 5. Tracks — Treasure Map
- Section label "The Campaign" + heading "Five worlds. From first prompt to full mastery."
- Dashed SVG connector paths (decorative, `pointer-events: none`)
- 2-column grid of 5 island cards (5th spans full width, centered)
- Each island: colored status circle (01-05), emoji icon, "World 0X" mono label, title, description, italic serif tagline
- Bob animation with staggered delays (0s, 0.8s, 1.6s, 2.4s, 3.2s)
- Hover: `translateY(-4px)` + larger shadow

### 6. Game Elements
- Section label "Game Mechanics" + heading "Serious content. Addictive format."
- 4-column grid of tilted cards (rotate -2deg, 1.5deg, -1deg, 2deg)
- **XP Bar:** gradient fill bar (teal->orange) with `xp-grow` animation
- **Badges:** 3 emoji circles with colored backgrounds
- **Levels:** 5 numbered blocks (3 filled, 1 current with pulse, 1 empty)
- **Streaks:** 4 fire + 1 empty circle
- Hover: `rotate(0) scale(1.05)`
- Caption: "Every level earns XP. Every world unlocks the next..."

### 7. Sandbox
- Section label "Interactive Sandbox" + heading "Every level is hands-on..."
- Faux terminal card:
  - Header bar: 3 colored dots (red, gold, teal) + filename "level-03-system-prompts.py"
  - Code body with lined-paper background, syntax highlighting via colored spans
  - "+25 XP" stamp badge rotated 6deg
- Footer: description + "Try It Free" CTA

### 8. Credibility
- Centered card with "Built by practitioners" badge
- Headline: "Created by engineers who build with Claude every single day."
- 4 stats in a row: 175 Levels (teal), 525 Challenges (orange), 5 Worlds (purple), 1 Achievement (gold)
- Mono font for numbers, uppercase labels

### 9. Pricing
- Section label "Simple Pricing" + heading "Start free. Upgrade when you're ready."
- Subtitle text
- 2-column pricing cards with hover lift:
  - **Free tier:** $0, forever, 4 features with checkmarks, teal "Start Free" CTA
  - **Pro tier:** $19.99/mo, orange border (featured), "Most Popular" badge, 6 features, orange "Unlock Everything" CTA
- "See Full Campaign" anchor link below

### 10. FAQ
- Section label "Common Questions" + heading "Frequently Asked Questions"
- 5 collapsible `<details>` items with `+`/`-` toggle
- Same 5 Q&As as the current HTML
- Note: the current React page already has this section with the same content from `messages/en.json`

### 11. Final CTA
- Headline: `Your move, <em>future architect</em>.` with italic serif styling
- Subtitle: "The first level is free. See if you like learning this way."
- "Start Your First Level" primary CTA button

### 12. Footer
- Italic serif logo
- Links: Worlds, Pricing, Curriculum, Privacy, Terms
- Copyright line

## Styling Strategy

### Tailwind utility classes (majority of layout)
All spacing, flexbox/grid, colors, typography, borders, shadows, border-radius map to existing Tailwind tokens. The Design F palette (`linen`, `warm-white`, `cream`, `ink`, `orange`, `teal`, `walnut`, `game-purple`, `game-blue`, `text-secondary`) is already in `globals.css` `@theme`.

### Custom CSS additions to `globals.css`
Minimal additions for things Tailwind can't express:

```css
/* Landing page animations */
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
@keyframes xp-grow {
  from { width: 0%; }
  to { width: 72%; }
}

/* Anti-duolingo diagonal stripes (pseudo-element) */
.anti-left-stripes::after { ... }

/* Anti-duolingo checkmark bullets */
.anti-check-list li::before { ... }

/* Island bob with delays */
.island-bob { animation: bob 4s ease-in-out infinite; }
.island-bob-1 { animation-delay: 0s; }
.island-bob-2 { animation-delay: 0.8s; }
/* etc. */
```

### Responsive breakpoints
Port the HTML's responsive rules:
- `md:` (768px): single-column anti-card, paths, islands, pricing; 2-col game grid; unrotate game cards
- `sm:` (480px): smaller hero text, stacked CTAs, hide nav links

## i18n Strategy

### Phase 1 (this migration): English messages
Add ~60 new keys to `messages/en.json` under `landing.*`:
- `landing.anti.*` (labels, items, tagline)
- `landing.paths.*` (section label/title, path A/B titles, descriptions, progression steps, CTAs, badges)
- `landing.tracks.*` (section label/title, 5 world descriptions + taglines)
- `landing.game.*` (section label/title, 4 card titles + descriptions, caption)
- `landing.sandbox.*` (section label/title, code comments, footer text)
- `landing.cred.*` (badge text, headline, 4 stat labels)
- `landing.pricing.*` (section label/title/subtitle, 2 tier labels + amounts + periods + features + CTAs, popular badge, see-full link)
- `landing.finalCta.*` (headline, subtitle, CTA)

Update existing keys to match HTML copy (hero headline, subhead, CTAs, nav links, footer).

### Phase 2 (separate follow-up): Translate to 6 locales
Run translation for ja, ko, zh-CN, de, fr, es. Separate task — not blocking this migration.

## Routing Changes

1. Remove the English rewrite in `src/proxy.ts` lines 151-162. The `if (pathname === "/")` block rewrites English visitors to `/landing.html`. Delete this block so all visitors (including English) fall through to next-intl routing, which will serve `[locale]/page.tsx`.
2. After verification, delete `public/landing.html`.

## Structured Data
Port the full `@graph` JSON-LD from the HTML (EducationalOrganization + WebSite + FAQPage), replacing the simpler FAQPage-only script in the current React page.

## Out of Scope
- Translation to non-English locales (Phase 2)
- Any content changes or new sections
- Mobile hamburger menu (HTML doesn't have one — just hides nav links at 480px)
- Dark mode (Design F is always light)

## Files Changed
| File | Change |
|------|--------|
| `src/app/[locale]/page.tsx` | Full rewrite — port all 12 sections |
| `src/app/globals.css` | Add ~30 lines of keyframes + pseudo-element styles |
| `messages/en.json` | Add ~60 new `landing.*` keys, update existing ones |
| `src/proxy.ts` | Remove English->static-HTML routing (if present) |
| `public/landing.html` | Delete after verification |
