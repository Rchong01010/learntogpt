"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LinkStatus = "verifying" | "ready" | "invalid";

/**
 * Password recovery landing page.
 *
 * Supabase's recovery email links here (the redirectTo passed by
 * /forgot-password). With @supabase/ssr's PKCE flow the link arrives as
 * ?code=..., which we exchange for a live session client-side — the code
 * verifier cookie was set by the same browser that requested the reset.
 * Implicit-flow hash tokens (#access_token=...) are auto-detected by the
 * browser client, so the getSession() fallback covers that path too.
 */
export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [status, setStatus] = useState<LinkStatus>("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const verifyStarted = useRef(false);

  useEffect(() => {
    // The PKCE code is single-use — guard against React Strict Mode's
    // double effect invocation so the second run doesn't falsely report
    // an invalid link after the first run already consumed the code.
    if (verifyStarted.current) return;
    verifyStarted.current = true;

    const supabase = createSupabaseBrowser();

    async function verifyRecoveryLink() {
      // Supabase surfaces expired/invalid link errors in the hash fragment
      // (#error=access_denied&error_code=otp_expired&...) for implicit flow,
      // and as ?error=... query params for PKCE.
      if (
        window.location.hash.includes("error=") ||
        new URLSearchParams(window.location.search).has("error")
      ) {
        setStatus("invalid");
        return;
      }

      // PKCE flow: recovery link lands here with ?code=...
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error(
            "[reset-password] exchangeCodeForSession failed:",
            exchangeError.message
          );
          setStatus("invalid");
          return;
        }
        // Drop the single-use code from the URL so a refresh doesn't
        // attempt a second (doomed) exchange.
        window.history.replaceState(null, "", window.location.pathname);
        setStatus("ready");
        return;
      }

      // Implicit-flow fallback: hash tokens were auto-detected and stored
      // by the browser client. No code, no session = invalid/expired link.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setStatus(session ? "ready" : "invalid");
    }

    verifyRecoveryLink();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // The recovery session is live — land the user on the dashboard.
    router.push("/dashboard");
  }

  if (status === "verifying") {
    return (
      <Card>
        <CardHeader>
          <CardDescription className="text-center">
            {t("verifyingResetLink")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "invalid") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("resetLinkInvalidTitle")}
          </CardTitle>
          <CardDescription>{t("resetLinkInvalidDescription")}</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-3">
          <Link
            href="/forgot-password"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {t("requestNewResetLink")}
          </Link>
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-primary hover:underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("resetPasswordTitle")}</CardTitle>
        <CardDescription>{t("resetPasswordDescription")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("newPasswordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordHintMinChars")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">
              {t("confirmPasswordLabel")}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t("passwordHintMinChars")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} size="lg">
            {loading ? t("updatingPassword") : t("resetPasswordSubmit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
