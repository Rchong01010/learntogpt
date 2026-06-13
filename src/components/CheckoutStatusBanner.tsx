"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CheckCircle2, RefreshCw, AlertTriangle, X, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// CheckoutStatusBanner
//
// Post-checkout outcome messaging. The checkout API routes redirect back with
// one of these params:
//   ?unlock=success | ?checkout=success | ?masterclass=success  → success
//   ?checkout=canceled | ?unlock=canceled                       → canceled
//   ?checkout=failed | unavailable | rate-limited               → error states
//
// The banner reads the param once, strips it from the URL (router.replace) so
// a refresh doesn't re-trigger it, and renders the outcome.
//
// Uses useSearchParams — mount inside a <Suspense> boundary.
//
// Webhook lag: the Stripe webhook that writes the course_unlocks row is async,
// so a fast redirect can land before entitlement is recorded. Pages that know
// the user's entitlement pass `entitled` — if a success param arrives while
// entitled === false we show an honest "activating your access" state with a
// refresh CTA instead of pretending everything is already open.
// ---------------------------------------------------------------------------

type Status =
  | "success"
  | "activating"
  | "canceled"
  | "failed"
  | "unavailable"
  | "rate-limited";

const STRIP_PARAMS = ["unlock", "checkout", "masterclass"];

function deriveStatus(
  params: URLSearchParams,
  entitled: boolean | undefined
): Status | null {
  const isSuccess =
    params.get("unlock") === "success" ||
    params.get("checkout") === "success" ||
    params.get("masterclass") === "success";
  if (isSuccess) {
    // entitled === false means the page checked and the unlock row isn't
    // there yet (webhook lag). undefined means the page didn't check.
    return entitled === false ? "activating" : "success";
  }
  const checkout = params.get("checkout");
  if (checkout === "canceled" || params.get("unlock") === "canceled")
    return "canceled";
  if (checkout === "failed") return "failed";
  if (checkout === "unavailable") return "unavailable";
  if (checkout === "rate-limited") return "rate-limited";
  return null;
}

export function CheckoutStatusBanner({ entitled }: { entitled?: boolean }) {
  const t = useTranslations("checkoutStatus");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Capture the status once on first render; it survives the URL cleanup.
  const [status, setStatus] = useState<Status | null>(() =>
    deriveStatus(searchParams, entitled)
  );
  // In the "activating" state, surface a refresh CTA after a few seconds.
  const [showRefresh, setShowRefresh] = useState(false);

  // Strip the checkout params so refresh / share doesn't re-trigger the banner.
  useEffect(() => {
    if (status === null) return;
    if (!STRIP_PARAMS.some((p) => searchParams.has(p))) return;
    const rest = new URLSearchParams(searchParams.toString());
    STRIP_PARAMS.forEach((p) => rest.delete(p));
    const query = rest.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== "activating") return;
    const timer = setTimeout(() => setShowRefresh(true), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === null) return null;

  const isError =
    status === "failed" || status === "unavailable" || status === "rate-limited";

  const title = t(`${camel(status)}Title` as Parameters<typeof t>[0]);
  const body = t(`${camel(status)}Body` as Parameters<typeof t>[0]);

  const accent =
    status === "success" || status === "activating"
      ? "bg-teal"
      : status === "canceled"
        ? "bg-walnut"
        : "bg-orange";

  return (
    <div className="card-f-static overflow-hidden" role="status" aria-live="polite">
      <div className={`h-2 w-full ${accent}`} />
      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink text-white shadow-[3px_3px_0px_#1c1917] ${accent}`}
        >
          {status === "success" && <CheckCircle2 className="size-5" />}
          {status === "activating" && <Loader2 className="size-5 animate-spin" />}
          {(isError || status === "canceled") && <AlertTriangle className="size-5" />}
        </div>

        {/* Copy */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-extrabold text-ink">{title}</p>
          <p className="text-sm leading-relaxed text-text-secondary">{body}</p>

          {/* Actions */}
          {status === "activating" && showRefresh && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-teal px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              <RefreshCw className="size-4" />
              {t("refreshCta")}
            </button>
          )}
          {isError && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href="/api/checkout/unlock"
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                {t("tryAgainCta")}
              </a>
              <a
                href="mailto:reid@getateam.ai?subject=Checkout%20help"
                className="text-sm font-semibold text-text-secondary underline transition-colors hover:text-ink"
              >
                {t("supportCta")}
              </a>
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setStatus(null)}
          aria-label={t("dismissLabel")}
          className="shrink-0 rounded-full p-1 text-text-secondary transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}

/** "rate-limited" → "rateLimited" for message-key lookup. */
function camel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
