import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Verifies a Turnstile token before allowing sign-up.
 * Client calls this first, then proceeds with Supabase signUp only if verified.
 */
export async function POST(request: Request) {
  // Rate limit by IP to prevent brute-forcing
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rl = rateLimit(`captcha:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.token || typeof body.token !== "string") {
    return Response.json({ error: "Missing captcha token" }, { status: 400 });
  }

  const valid = await verifyTurnstile(body.token);
  if (!valid) {
    return Response.json({ error: "Captcha verification failed" }, { status: 403 });
  }

  return Response.json({ verified: true });
}
