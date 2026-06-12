import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

/**
 * Learn to GPT proxy: composes next-intl locale routing with Supabase auth.
 *
 * Execution order for page routes:
 *   1. next-intl detects/normalizes locale (may redirect or rewrite)
 *   2. If the (locale-stripped) path is protected, verify Supabase session
 *   3. On auth failure, redirect to locale-aware /sign-in
 *
 * API routes bypass next-intl (no locale prefix on /api/*) and go straight
 * to the auth check. Webhooks bypass both (they verify signatures themselves).
 */

const handleI18nRouting = createMiddleware(routing);

// Protected routes matched AFTER stripping any locale prefix.
const PROTECTED_ROUTES = [
  "/dashboard",
  "/courses",
  "/profile",
  "/leaderboard",
  "/settings",
  "/missions",
  "/api/progress",
  "/api/exercises",
  "/api/leaderboard",
  "/api/missions",
  "/api/account",
  "/api/portal",
];

// Public carve-outs: routes that match a PROTECTED_ROUTES prefix but are
// intentionally accessible without auth. Used for lead-magnet courses whose
// lessons act as the top-of-funnel for Learn to GPT. Lesson-level `is_free`
// on the course/lesson rows is still the authoritative paywall inside the
// page render; this just lets guests through the proxy gate.
const PUBLIC_ROUTE_PREFIXES = [
  "/courses/whats-new-in-claude",
  "/courses/why-chatgpt",
  "/courses/three-levels",
  "/courses/strategic-prompting",
  "/courses/essentials",
  "/courses/practitioner-setup",
];

/**
 * Match the first path segment to a known locale case-insensitively. Locales
 * in routing.locales like "zh-CN" must still match a request path using
 * "/zh-cn/..." or "/ZH-CN/..." — otherwise the locale-stripped protection
 * check can be bypassed with a case-variant prefix. next-intl's own
 * middleware normalizes case on a redirect pass, but we do not want the
 * auth gate to depend on that behavior holding.
 */
function matchLocale(
  segment: string | undefined
): (typeof routing.locales)[number] | null {
  if (!segment) return null;
  const lower = segment.toLowerCase();
  const found = routing.locales.find((l) => l.toLowerCase() === lower);
  return found ?? null;
}

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (matchLocale(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

function extractLocale(pathname: string): (typeof routing.locales)[number] {
  const segments = pathname.split("/").filter(Boolean);
  const match = matchLocale(segments[0]);
  return match ?? routing.defaultLocale;
}

function isProtectedRoute(pathname: string): boolean {
  const stripped = stripLocale(pathname);
  const publicCarveOut = PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`)
  );
  if (publicCarveOut) return false;
  return PROTECTED_ROUTES.some(
    (route) => stripped === route || stripped.startsWith(`${route}/`)
  );
}

function isWebhookRoute(pathname: string): boolean {
  return pathname.startsWith("/api/webhooks/");
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

async function checkAuth(
  request: NextRequest,
  response: NextResponse,
  pathname: string
): Promise<NextResponse> {
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
            request.cookies.set(name, value); // nosemgrep: javascript.koa.web.cookies-default-koa.cookies-default-koa -- false positive: @supabase/ssr cookie handler, SameSite governed by Supabase internals not application code
            response.cookies.set(name, value, options); // nosemgrep: javascript.koa.web.cookies-default-koa.cookies-default-koa -- false positive: options is @supabase/ssr-controlled, SameSite never None
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const locale = extractLocale(pathname);
    const signInPath =
      locale === routing.defaultLocale ? "/sign-in" : `/${locale}/sign-in`;
    const signInUrl = new URL(signInPath, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

const SA_COOKIE = "sa_v1";
const SA_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const AFF_COOKIE = "aff_code";
const AFF_MAX_AGE = 60 * 60 * 24 * 60; // 60 days
// Stripe coupon ids are alphanumeric, max 40 chars. Validate before storing
// so a malformed query string can never end up as a cookie value or DB lookup.
const AFF_CODE_RE = /^[A-Z0-9]{3,40}$/;

/**
 * First-touch UTM / referrer capture. Returns a JSON blob to stash in a
 * cookie, or null when there's no attribution signal or a cookie already
 * exists. Called once per request from proxy(). Failure is non-fatal —
 * we always return null rather than throwing, so a bad referrer header
 * never breaks page loads.
 */
function captureAttributionBlob(request: NextRequest, pathname: string): string | null {
  if (request.method !== "GET") return null;
  if (request.cookies.get(SA_COOKIE)) return null;

  const url = request.nextUrl;
  const captured: Record<string, string> = {};
  let hasAny = false;
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = url.searchParams.get(k);
    if (v) {
      captured[k] = v.slice(0, 200);
      hasAny = true;
    }
  }

  let referrerHost = "";
  const rawReferrer = request.headers.get("referer") || "";
  if (rawReferrer) {
    try {
      const r = new URL(rawReferrer);
      if (!r.hostname.endsWith("learntogpt.com")) {
        referrerHost = r.hostname.slice(0, 200);
      }
    } catch {
      // malformed referrer — ignore
    }
  }

  if (!hasAny && !referrerHost) return null;

  captured.referrer = referrerHost;
  captured.landing_path = pathname.slice(0, 500);
  captured.t = String(Date.now());
  return JSON.stringify(captured);
}

function applySaCookie(response: NextResponse, blob: string | null): NextResponse {
  if (!blob) return response;
  response.cookies.set(SA_COOKIE, blob, {
    path: "/",
    maxAge: SA_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true, // server-side only (read by middleware + auth callback)
  });
  return response;
}

/**
 * Affiliate coupon capture from `?coupon=CODE`. Last-touch model — every fresh
 * link click overwrites the cookie, since creators expect the link they sent
 * the user through to get attribution. Read by /api/checkout to auto-apply
 * the matching Stripe coupon at session creation.
 */
function captureAffCode(request: NextRequest): string | null {
  if (request.method !== "GET") return null;
  const raw = request.nextUrl.searchParams.get("coupon");
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  if (!AFF_CODE_RE.test(normalized)) return null;
  return normalized;
}

function applyAffCookie(response: NextResponse, code: string | null): NextResponse {
  if (!code) return response;
  response.cookies.set(AFF_COOKIE, code, {
    path: "/",
    maxAge: AFF_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Webhooks bypass everything (signature-verified by their own handlers).
  if (isWebhookRoute(pathname)) {
    return NextResponse.next();
  }

  // First-touch UTM / referrer capture. Computed once, applied to whatever
  // response we return. Null when no attribution signal or cookie exists.
  const saBlob = captureAttributionBlob(request, pathname);

  // Affiliate coupon capture (last-touch). Read once per request, applied
  // alongside the SA cookie to whatever response we end up returning.
  const affCode = captureAffCode(request);

  const apply = (res: NextResponse) =>
    applyAffCookie(applySaCookie(res, saBlob), affCode);

  // API routes: skip locale routing (no locale prefix on /api/*), auth-check if protected.
  if (isApiRoute(pathname)) {
    if (!isProtectedRoute(pathname)) {
      return apply(NextResponse.next());
    }
    const response = NextResponse.next();
    return apply(await checkAuth(request, response, pathname));
  }

  // All locales (including English) now use the React landing at
  // [locale]/page.tsx. No more rewrite to /landing.html.

  // Page routes: run next-intl first for locale detection / redirect / rewrite.
  const i18nResponse = handleI18nRouting(request);

  // If next-intl issued a redirect (locale cookie, Accept-Language detection), honor it.
  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return apply(i18nResponse);
  }

  // Public page route → return the i18n-handled response as-is.
  if (!isProtectedRoute(pathname)) {
    return apply(i18nResponse);
  }

  // Protected page route → compose auth check on top of i18n response.
  return apply(await checkAuth(request, i18nResponse, pathname));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - _vercel (analytics + speed insights beacons; intercepting these silently kills tracking)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt|json)$).*)",
  ],
};
