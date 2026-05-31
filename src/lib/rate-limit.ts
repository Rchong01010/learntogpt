/**
 * Simple in-memory rate limiter using a sliding window approach.
 *
 * LIMITATION: On Vercel serverless, each cold start gets a fresh Map, so this
 * rate limiter is only effective within a single warm instance. It still helps
 * against sustained abuse from a single instance, but cannot enforce strict
 * global limits across cold starts. For strict enforcement, use Vercel's
 * built-in WAF rate limiting (vercel.json firewall rules) or a persistent
 * store (e.g., Upstash Redis, Supabase RPC).
 *
 * Not suitable for multi-instance deployments — use Redis-based
 * solutions if you scale horizontally.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window
    const resetAt = now + windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Existing window
  entry.count += 1;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract a rate-limit key from a Request.
 *
 * Priority:
 * 1. x-real-ip — set by Vercel's edge and cannot be spoofed by the client.
 * 2. x-forwarded-for (first entry) — fallback for non-Vercel environments;
 *    note this CAN be spoofed by clients adding their own header value.
 * 3. "unknown" — last resort; all unknown-IP requests share one bucket.
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Supabase-backed persistent rate limiter (strict enforcement across cold starts)
// ---------------------------------------------------------------------------

import { createHash } from "crypto";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/** Hash an IP for storage. Salted with SUPABASE_WEBHOOK_SECRET. */
export function hashIp(ip: string): string {
  if (!process.env.SUPABASE_WEBHOOK_SECRET) {
    throw new Error("Missing SUPABASE_WEBHOOK_SECRET — needed for rate limit IP hashing");
  }
  const salt = process.env.SUPABASE_WEBHOOK_SECRET;
  return createHash("sha256").update(ip + salt).digest("hex").slice(0, 32);
}

export interface PersistentRateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Persistent per-IP rate limit backed by Supabase `api_rate_limits` table.
 * Bucketed by hour — counts all requests in the last 60 minutes.
 *
 * On DB error: FAILS OPEN (returns allowed=true). Trade-off: losing legitimate
 * signups during a DB outage is worse than briefly letting a few through. Turnstile
 * + honeypot still block the bulk of bots.
 */
export async function rateLimitPersistent(
  ipHash: string | null,
  endpoint: string,
  limitPerHour: number,
): Promise<PersistentRateLimitResult> {
  if (!ipHash) {
    return { allowed: true, remaining: limitPerHour, limit: limitPerHour };
  }

  const bucketHour = new Date();
  bucketHour.setUTCMinutes(0, 0, 0);
  const bucketIso = bucketHour.toISOString();
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    const sb = await createSupabaseAdmin();

    const { data: rows } = await sb
      .from("api_rate_limits")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("endpoint", endpoint)
      .gte("bucket_hour", windowStart);

    const currentCount = (rows ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0);

    if (currentCount >= limitPerHour) {
      return { allowed: false, remaining: 0, limit: limitPerHour };
    }

    // Upsert current bucket
    const { data: existingBucket } = await sb
      .from("api_rate_limits")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("endpoint", endpoint)
      .eq("bucket_hour", bucketIso)
      .maybeSingle();

    if (existingBucket) {
      await sb
        .from("api_rate_limits")
        .update({ count: existingBucket.count + 1 })
        .eq("ip_hash", ipHash)
        .eq("endpoint", endpoint)
        .eq("bucket_hour", bucketIso);
    } else {
      await sb.from("api_rate_limits").insert({
        ip_hash: ipHash,
        endpoint,
        bucket_hour: bucketIso,
        count: 1,
      });
    }

    return {
      allowed: true,
      remaining: Math.max(0, limitPerHour - currentCount - 1),
      limit: limitPerHour,
    };
  } catch (err) {
    console.error("[rate-limit] Supabase check failed, failing open:", err);
    return { allowed: true, remaining: limitPerHour, limit: limitPerHour };
  }
}

/** Standard 429 response with retry-after header. */
export function rateLimitResponse(limit: number): Response {
  return Response.json(
    {
      error: "Too many requests. Please try again in an hour.",
      code: "rate_limit_exceeded",
    },
    {
      status: 429,
      headers: {
        "Retry-After": "3600",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
