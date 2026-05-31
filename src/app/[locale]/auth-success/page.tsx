"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { mergeLocalProgressToServer } from "@/lib/local-progress";

/**
 * Intermediate landing page after Google OAuth completes.
 *
 * Problem: The auth callback at /api/auth/callback exchanges the OAuth code
 * for a session, writes the session cookies onto a 302 response, then
 * redirects directly to /dashboard. But the proxy middleware runs on the
 * /dashboard request and calls checkAuth() which reads request cookies —
 * the browser hasn't stored the cookies from the 302 yet, so checkAuth()
 * sees no session and bounces the user back to /sign-in.
 *
 * Fix: Redirect to this unprotected page first. The browser stores the
 * session cookies when it renders this page, then the client-side
 * router.replace() navigates to /dashboard. By the time /dashboard is
 * requested, the cookies are in the jar and checkAuth() succeeds.
 *
 * New-user routing: if the user has 0 XP (brand new account), route them
 * to /onboarding instead of /dashboard so they can complete the quiz and
 * land on the most relevant first lesson.
 */
export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function route() {
      const next = searchParams.get("next");

      // Merge any anonymous localStorage progress to the server.
      // Runs on every auth-success regardless of destination — best-effort.
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      try {
        await mergeLocalProgressToServer(supabase);
      } catch {
        // Non-fatal — local progress merge can fail silently.
      }

      // If a specific next= destination was explicitly requested (e.g. checkout,
      // courses deep-link), honour it — don't hijack with onboarding.
      if (next) {
        const safe =
          next.startsWith("/") &&
          !next.startsWith("//") &&
          !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(next)
            ? next
            : "/dashboard";
        router.replace(safe as Parameters<typeof router.replace>[0]);
        return;
      }

      // No explicit destination — check if user is brand new (0 XP).
      // New users go to /onboarding; returning users go to /dashboard.
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("total_xp")
            .eq("user_id", user.id)
            .maybeSingle();

          // No profile row (brand new) or 0 XP → onboarding
          if (!profile || (profile.total_xp ?? 0) === 0) {
            router.replace("/onboarding" as Parameters<typeof router.replace>[0]);
            return;
          }
        }
      } catch {
        // Non-fatal — fall through to dashboard on any error
      }

      router.replace("/dashboard" as Parameters<typeof router.replace>[0]);
    }

    route();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
