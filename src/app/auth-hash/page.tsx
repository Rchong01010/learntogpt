"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Legacy Supabase auth hash-fragment handler.
 *
 * The primary OAuth flow uses server-side PKCE via /api/auth/callback. This
 * page only runs if Supabase ever falls back to implicit-flow tokens landing
 * in the URL fragment (#access_token=... or #error=...). It extracts the
 * session and routes the user to /dashboard or /sign-in.
 *
 * Moved from src/app/page.tsx in Phase 5 to unblock the new React landing
 * page at src/app/[locale]/page.tsx. Route: /auth-hash.
 */
export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;

    // If there's a Supabase auth hash fragment, handle it
    if (hash && (hash.includes("access_token") || hash.includes("error"))) {
      // Check for errors first
      if (hash.includes("error=")) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get("error_description") || "Authentication failed";
        window.location.href = `/sign-in?error=${encodeURIComponent(errorDesc)}`;
        return;
      }

      // Supabase client auto-detects the hash and sets the session
      const supabase = createSupabaseBrowser();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/sign-in?error=auth";
        }
      });
      return;
    }

    // No hash — nothing to do, bounce to the landing root
    window.location.href = "/";
  }, []);

  // Brief loading state while redirecting
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#f0ebe3",
      fontFamily: "system-ui, sans-serif",
      color: "#78716c",
    }}>
      Loading...
    </div>
  );
}
