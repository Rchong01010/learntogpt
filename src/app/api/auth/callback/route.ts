import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

/** Allowed post-auth redirect destinations (prefix match for nested routes). */
const REDIRECT_ALLOWLIST = [
  "/dashboard",
  "/settings",
  "/courses",
  "/profile",
  "/leaderboard",
  "/missions",
  "/api/checkout",
  "/auth-success",
  "/onboarding",
];

/**
 * Extracts a supported locale from the Accept-Language header.
 * Falls back to the default locale if no supported locale is found.
 */
function detectLocale(
  acceptLanguage: string | null
): (typeof routing.locales)[number] {
  if (!acceptLanguage) return routing.defaultLocale;

  // Accept-Language: "ja,en-US;q=0.9,en;q=0.8" → ["ja", "en-us", "en"]
  const tags = acceptLanguage
    .split(",")
    .map((tag) => tag.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  const supported = routing.locales.map((l) => l.toLowerCase());

  for (const tag of tags) {
    // Exact match (e.g. "zh-cn" matches "zh-CN")
    const exactIdx = supported.indexOf(tag);
    if (exactIdx !== -1) return routing.locales[exactIdx];

    // Primary subtag match (e.g. "en-US" → "en", "zh" → "zh-CN" if present)
    const primary = tag.split("-")[0];
    const primaryIdx = supported.findIndex(
      (l) => l === primary || l.startsWith(`${primary}-`)
    );
    if (primaryIdx !== -1) return routing.locales[primaryIdx];
  }

  return routing.defaultLocale;
}

/**
 * Extracts a supported locale from a URL path (e.g. "/fr/sign-up" → "fr").
 * Returns null if no locale prefix is found or it's the default locale,
 * so the caller can fall back to other detection methods.
 */
function extractLocaleFromPath(path: string | null | undefined): Locale | null {
  if (!path) return null;
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const candidate = segments[0].toLowerCase();
  const match = routing.locales.find((l) => l.toLowerCase() === candidate);
  return match ?? null;
}

/**
 * Prefixes a path with the locale unless it's the default locale.
 * Respects localePrefix: 'as-needed' — English paths stay prefix-free.
 * API routes never receive a locale prefix.
 */
function localizePath(
  path: string,
  locale: (typeof routing.locales)[number]
): string {
  if (locale === routing.defaultLocale) return path;
  if (path.startsWith("/api/")) return path;
  return `/${locale}${path}`;
}

/**
 * Validates that a redirect path is a safe, relative URL.
 * - Must start with "/"
 * - Must NOT start with "//" (protocol-relative URL — open redirect vector)
 * - Must NOT contain a protocol (e.g. "http:", "javascript:")
 * - Must be on the allowlist of known internal paths
 *
 * Returns the path if valid, or the fallback otherwise.
 */
function safeRedirectPath(path: string | null, fallback: string): string {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)
  ) {
    return fallback;
  }

  // Strip query string and hash for allowlist comparison (prefix match
  // so nested routes like /courses/meet-claude/intro pass through).
  const pathname = path.split("?")[0].split("#")[0];
  if (!REDIRECT_ALLOWLIST.some((allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`))) {
    return fallback;
  }

  return path;
}

/*
 * Auth callback handler.
 *
 * Combines main's simplified cookie flow (one response object, Supabase
 * writes session cookies directly onto it, return the same response) with
 * feat/i18n-weekend's locale-aware redirects (destination computed once
 * upfront and wrapped through localizePath so users land on /ja/dashboard
 * instead of /dashboard when their browser prefers Japanese).
 *
 * SECURITY: every redirect target goes through safeRedirectPath which
 * enforces relative-only, no protocol-relative URLs, and an allowlist check.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const headerStore = await headers();
  const locale = detectLocale(headerStore.get("accept-language"));

  if (!code) {
    return NextResponse.redirect(
      new URL(
        localizePath(safeRedirectPath(null, "/sign-in?error=auth"), locale),
        request.url
      )
    );
  }

  // Resolve the final redirect destination, then route through /auth-success
  // so the browser has a chance to store the session cookies before we hit a
  // protected route. Without this intermediate stop, the proxy's checkAuth()
  // reads request cookies on the /dashboard request before the browser has
  // committed the cookies from this 302 response — causing the "double click"
  // bug where the first OAuth attempt bounces the user back to /sign-in.
  //
  // plan_intent is a non-sensitive routing hint cookie set by the sign-up
  // page when a user clicks "Upgrade to Pro". It's read from the incoming
  // request cookies (not from any next/headers cookieStore which would drop
  // on redirect). See memory: feedback_supabase_ssr_cookies.md.
  const planIntent = request.cookies.get("plan_intent")?.value;
  const defaultDestination =
    planIntent === "pro" ? "/api/checkout" : "/dashboard";
  const finalDestination = safeRedirectPath(next, defaultDestination);

  // Build the /auth-success URL with the real destination as ?next= so the
  // client-side router.replace() can forward the user after cookies are stored.
  const authSuccessPath = localizePath("/auth-success", locale);
  const authSuccessUrl = new URL(authSuccessPath, request.url);
  // Only append ?next= when it differs from the default to keep URLs clean.
  if (finalDestination !== "/dashboard") {
    authSuccessUrl.searchParams.set("next", finalDestination);
  }

  const response = NextResponse.redirect(authSuccessUrl);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      new URL(
        localizePath(safeRedirectPath(null, "/sign-in?error=auth"), locale),
        request.url
      )
    );
  }

  // Clear plan_intent now that the decision has been baked into `finalDestination`.
  if (planIntent) {
    response.cookies.set("plan_intent", "", { path: "/", maxAge: 0 });
  }

  // --- First-touch signup attribution ---------------------------------
  // If the proxy set an sa_v1 cookie on an earlier visit, persist it now
  // that we have a user_id. Failure is non-fatal: the auth flow must
  // never break because attribution write failed.
  const saCookie = request.cookies.get("sa_v1")?.value;
  if (saCookie) {
    try {
      const blob = JSON.parse(saCookie) as Record<string, string>;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        const serviceSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { cookies: { getAll: () => [], setAll: () => {} } }
        );
        const firstVisitAt = blob.t
          ? new Date(Number(blob.t)).toISOString()
          : new Date().toISOString();
        await serviceSupabase
          .from("signup_attribution")
          .upsert(
            {
              user_id: user.id,
              utm_source:   blob.utm_source   || null,
              utm_medium:   blob.utm_medium   || null,
              utm_campaign: blob.utm_campaign || null,
              utm_content:  blob.utm_content  || null,
              utm_term:     blob.utm_term     || null,
              referrer:     blob.referrer     || null,
              landing_path: blob.landing_path || null,
              user_agent:   request.headers.get("user-agent")?.slice(0, 500) || null,
              first_visit_at: firstVisitAt,
            },
            { onConflict: "user_id", ignoreDuplicates: true }
          );
      }
    } catch (e) {
      console.error("[auth/callback] signup_attribution write failed:", e);
      // do not fail the auth flow
    }
    response.cookies.set("sa_v1", "", { path: "/", maxAge: 0, httpOnly: true });
  }

  // --- Set preferred_locale on first signup --------------------------------
  // Derive the user's locale from their landing path (most accurate — it's the
  // URL they actually visited) with Accept-Language as fallback. Only set on
  // first signup: skip if the user already has a non-'en' locale (they may
  // have changed it manually). Failure is non-fatal.
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      // 1. Try extracting locale from the landing_path in the attribution cookie
      let signupLocale: Locale | null = null;
      if (saCookie) {
        try {
          const blob = JSON.parse(saCookie) as Record<string, string>;
          signupLocale = extractLocaleFromPath(blob.landing_path);
        } catch {
          // malformed cookie — fall through
        }
      }
      // 2. Fallback: Accept-Language header detection (already computed above)
      if (!signupLocale || signupLocale === routing.defaultLocale) {
        const detectedLocale = locale; // computed at the top of GET()
        if (detectedLocale !== routing.defaultLocale) {
          signupLocale = detectedLocale;
        }
      }

      // Only update if we detected a non-default locale
      if (signupLocale && signupLocale !== routing.defaultLocale) {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        const svcClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { cookies: { getAll: () => [], setAll: () => {} } }
        );

        // Check current locale — don't overwrite if user already has a non-'en' value
        const { data: profile } = await svcClient
          .from("user_profiles")
          .select("preferred_locale")
          .eq("id", currentUser.id)
          .single();

        const currentLocale = profile?.preferred_locale;
        if (!currentLocale || currentLocale === "en") {
          await svcClient
            .from("user_profiles")
            .update({ preferred_locale: signupLocale })
            .eq("id", currentUser.id);
        }
      }
    }
  } catch (e) {
    console.error("[auth/callback] preferred_locale update failed:", e);
    // non-fatal — never break auth flow
  }

  return response;
}
