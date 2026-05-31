import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

  const disallowedPaths = [
    "/dashboard",
    "/profile",
    "/settings",
    "/leaderboard",
    "/missions/",
    "/api/",
    "/auth-hash",
  ];

  const allowedPaths = [
    "/",
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/",
  ];

  const aiBots = [
    "OAI-SearchBot",
    "PerplexityBot",
    "Google-Extended",
    "ClaudeBot",
    "Anthropic-ai",
    "ChatGPT-User",
  ];

  return {
    rules: [
      { userAgent: "*", allow: allowedPaths, disallow: disallowedPaths },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: allowedPaths,
        disallow: disallowedPaths,
      })),
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/llms.txt`,
      `${base}/llms-full.txt`,
    ],
    host: base,
  };
}
