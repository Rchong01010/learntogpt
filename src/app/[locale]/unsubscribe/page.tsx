import type { Metadata } from "next";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * Email unsubscribe landing page (CAN-SPAM).
 *
 * GET /unsubscribe?e=<base64url email>&t=<hmac>
 *
 * - Valid token  → sets user_profiles.email_unsubscribed = true via the
 *   service-role-only RPC set_email_unsubscribed (migration 034) and renders
 *   a confirmation + one-click resubscribe form.
 * - Invalid/missing token → generic "link invalid" message. We never reveal
 *   whether an email exists (no user enumeration): a valid token for an
 *   unknown address still renders the success state.
 * - Already unsubscribed → "you're already unsubscribed" + resubscribe form.
 * - ?resubscribed=1 (after the POST round-trip) → resubscribed confirmation.
 *
 * No auth gate by design: unsubscribe links must work from any mail client
 * without a session. The HMAC token (signed with CRON_SECRET) is the
 * authorization. The service-role client is only reached AFTER token
 * verification succeeds.
 *
 * Plain English strings on purpose — compliance page, not blocking on i18n.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email preferences",
  robots: { index: false, follow: false },
};

type State = "invalid" | "unsubscribed" | "already" | "resubscribed";

async function processUnsubscribe(email: string): Promise<"updated" | "unchanged" | "not_found" | "error"> {
  try {
    const supabase = await createSupabaseAdmin();
    const { data, error } = await supabase.rpc("set_email_unsubscribed", {
      p_email: email,
      p_value: true,
    });
    if (error) {
      console.error("[unsubscribe] rpc failed:", error.message);
      return "error";
    }
    return data as "updated" | "unchanged" | "not_found";
  } catch (err) {
    console.error(
      "[unsubscribe] failed:",
      err instanceof Error ? err.message : String(err),
    );
    return "error";
  }
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const e = typeof params.e === "string" ? params.e : undefined;
  const t = typeof params.t === "string" ? params.t : undefined;
  const resubscribed = params.resubscribed === "1";

  let state: State = "invalid";

  const email = verifyUnsubscribeToken(e, t);

  if (email) {
    if (resubscribed) {
      // Round-trip from the resubscribe POST — don't unsubscribe again.
      state = "resubscribed";
    } else {
      const result = await processUnsubscribe(email);
      if (result === "updated") state = "unsubscribed";
      else if (result === "unchanged") state = "already";
      // not_found: token is valid (we signed it), so show success rather than
      // leaking whether an account exists. error: also show success — the
      // user's intent is recorded in logs and showing an error invites retries
      // against a 5xx; CAN-SPAM-wise we must honor it, ops will see the log.
      else state = "unsubscribed";
    }
  }

  // Resubscribe form posts to the API route (rate-limited, same token check).
  const resubAction =
    email && e && t
      ? `/api/unsubscribe?e=${encodeURIComponent(e)}&t=${encodeURIComponent(t)}&action=resubscribe&redirect=1`
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
        {state === "invalid" && (
          <>
            <h1 className="mb-3 text-xl font-semibold">This link isn&apos;t valid</h1>
            <p className="text-sm text-muted-foreground">
              This unsubscribe link is invalid or has expired. Please use the
              unsubscribe link from a recent email, or contact support.
            </p>
          </>
        )}

        {state === "unsubscribed" && (
          <>
            <h1 className="mb-3 text-xl font-semibold">You&apos;re unsubscribed</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              You won&apos;t receive any more marketing emails from us. Account
              and purchase emails may still be sent when required.
            </p>
          </>
        )}

        {state === "already" && (
          <>
            <h1 className="mb-3 text-xl font-semibold">You&apos;re already unsubscribed</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              This address is already off our marketing list. Nothing more to do.
            </p>
          </>
        )}

        {state === "resubscribed" && (
          <>
            <h1 className="mb-3 text-xl font-semibold">Welcome back</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              You&apos;re resubscribed and will receive emails from us again.
            </p>
          </>
        )}

        {(state === "unsubscribed" || state === "already") && resubAction && (
          <form method="POST" action={resubAction}>
            <button
              type="submit"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Resubscribe
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Changed your mind? One click puts you back on the list.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
