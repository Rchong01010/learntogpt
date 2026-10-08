import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * Verifies a Turnstile token before allowing sign-up.
 * Client calls this first, then proceeds with Supabase signUp only if verified.
 */
export async function POST(request: Request) {
  // Rate limit by IP to prevent brute-forcing
  // getClientIP prefers Vercel's x-real-ip; reading a client-supplied
  // x-forwarded-for first let every request pick a fresh rate-limit bucket.
  const ip = getClientIP(request);
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
