import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Claude-developer-tooling SEO slugs forked from claude-academy that do NOT
 * belong on LearnToGPT (GPT-led brand). These pages only make sense for Claude
 * users — Claude Code, MCP, hooks, Claude API, Claude-only model/feature pages —
 * so they 301 to their claude-academy.com equivalent (same slug, same locale).
 *
 * REVERSIBLE: delete this array + the redirects() block below and the existing
 * page.tsx files under src/app/[locale]/<slug>/ render again as before. The page
 * directories are intentionally left in place; next.config redirects run before
 * filesystem routing, so they take precedence without deleting source.
 *
 * Cross-brand comparison pages (claude-vs-chatgpt, chatgpt-vs-claude,
 * claude-vs-copilot, claude-vs-gemini) and general Claude-product pages
 * (what-is-claude, is-claude-free, best-claude-prompts, claude-for-*) are
 * intentionally NOT in this list — they stay on LG.
 */
const CLAUDE_DEV_REDIRECT_SLUGS = [
  "claude-code",
  "claude-code-cheat-sheet",
  "claude-code-debugging",
  "claude-code-for-python",
  "claude-code-multi-agent",
  "claude-code-projects",
  "claude-code-security",
  "claude-code-setup",
  "claude-code-tdd",
  "claude-code-tutorial",
  "claude-code-vs-cursor",
  "claude-mcp-servers",
  "claude-hooks",
  "claude-slash-commands",
  "claude-api-tutorial",
  "claude-batch-api",
  "claude-tool-use",
  "claude-system-prompts",
  "claude-agents",
  "claude-artifacts",
  "claude-extended-thinking",
  "claude-context-window",
  "claude-memory",
  "claude-projects",
  "claude-for-developers",
  "claude-sonnet-vs-opus",
] as const;

// Non-default locales that carry a path prefix (en is prefix-free, as-needed).
const REDIRECT_LOCALES = ["ja", "ko", "zh-CN", "de", "fr", "es", "pt-BR"];

const nextConfig: NextConfig = {
  async redirects() {
    const ACADEMY = "https://claude-academy.com";
    return CLAUDE_DEV_REDIRECT_SLUGS.flatMap((slug) => [
      // Prefix-free (default locale, en)
      {
        source: `/${slug}`,
        destination: `${ACADEMY}/${slug}`,
        permanent: true,
      },
      // Locale-prefixed variants → preserve the locale on claude-academy
      ...REDIRECT_LOCALES.map((locale) => ({
        source: `/${locale}/${slug}`,
        destination: `${ACADEMY}/${locale}/${slug}`,
        permanent: true,
      })),
    ]);
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com; frame-src https://js.stripe.com https://challenges.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
