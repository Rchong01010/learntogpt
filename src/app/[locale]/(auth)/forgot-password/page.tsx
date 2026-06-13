"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
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

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const turnstileRef = useRef<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || sent) return; // guard double submits
    setError(null);
    setLoading(true);

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError(t("pleaseCompleteVerification"));
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowser();
    // localePrefix 'as-needed': default-locale URLs are prefix-free
    // (/reset-password), all others are prefixed (/ja/reset-password).
    const localePrefix = locale === "en" ? "" : `/${locale}`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}${localePrefix}/reset-password`,
        captchaToken: captchaToken ?? undefined,
      }
    );

    // Always render the generic confirmation regardless of outcome — never
    // reveal whether an account exists (user enumeration). Errors (e.g.
    // Supabase server-side rate limits) are logged for diagnostics only.
    if (resetError) {
      console.error(
        "[forgot-password] resetPasswordForEmail failed:",
        resetError.message
      );
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("resetEmailSentTitle")}</CardTitle>
          <CardDescription>
            {t.rich("resetEmailSentDescription", {
              email,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
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
        <CardTitle className="text-xl">{t("forgotPasswordTitle")}</CardTitle>
        <CardDescription>{t("forgotPasswordDescription")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Turnstile CAPTCHA — invisible/managed mode, minimal friction */}
          {TURNSTILE_SITE_KEY && (
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => {
                setCaptchaToken(null);
                setError(t("verificationFailed"));
              }}
              onExpire={() => setCaptchaToken(null)}
              options={{ theme: "light", size: "invisible" }}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} size="lg">
            {loading ? t("sendingResetLink") : t("sendResetLink")}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            {t("backToSignIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
