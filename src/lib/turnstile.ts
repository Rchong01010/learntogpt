/**
 * Server-side Cloudflare Turnstile token verification.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY not set in production — rejecting");
      return false;
    }
    // In dev/staging, allow through
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    if (data.success !== true) {
      // Log the exact Cloudflare error codes so we can diagnose misconfigured
      // site key / secret key / domain mismatches from production logs.
      console.error("[turnstile] verification failed", {
        http_status: res.status,
        error_codes: data["error-codes"] ?? null,
        hostname: data.hostname ?? null,
        action: data.action ?? null,
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[turnstile] verification error:", err instanceof Error ? err.message : err);
    return false;
  }
}
