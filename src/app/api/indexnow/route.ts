import { NextRequest } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const INDEXNOW_KEY =
  "15a6b41dc65a56c5481d4b9efef40b91776984c57dd17a1ab496f34007876dfb";
const HOST = "learntogpt.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function POST(request: NextRequest) {
  // ── Auth: shared secret ──────────────────────────────────────────
  if (!process.env.INDEXNOW_SECRET) {
    throw new Error("Missing INDEXNOW_SECRET env var");
  }

  const secret = request.headers.get("x-indexnow-secret");
  if (secret !== process.env.INDEXNOW_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Rate limit: 5 requests per hour per IP ───────────────────────
  const ip = getClientIP(request);
  const rl = rateLimit(`indexnow:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests. Max 5 per hour." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rl.resetAt - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).urls)
  ) {
    return Response.json(
      { error: "Body must contain a `urls` array" },
      { status: 400 }
    );
  }

  const urls = (body as { urls: unknown[] }).urls.filter(
    (u): u is string => typeof u === "string" && u.startsWith("https://")
  );

  if (urls.length === 0) {
    return Response.json(
      { error: "No valid HTTPS URLs provided" },
      { status: 400 }
    );
  }

  // Cap at 10,000 per IndexNow spec
  const urlList = urls.slice(0, 10_000);

  // ── Submit to IndexNow ───────────────────────────────────────────
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const resp = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error(
      `[indexnow] API returned ${resp.status}: ${text.slice(0, 500)}`
    );
    return Response.json(
      { error: "IndexNow API error", status: resp.status },
      { status: 502 }
    );
  }

  return Response.json({
    ok: true,
    submitted: urlList.length,
  });
}
