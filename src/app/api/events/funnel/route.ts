import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";

const VALID_EVENT_NAMES = new Set([
  "funnel_signup_complete",
  "funnel_first_lesson_start",
  "funnel_first_exercise_start",
  "funnel_first_exercise_complete",
  "funnel_24hr_return",
]);

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 10 events per minute per user — funnel events are low-volume by design
  const rl = rateLimit(`funnel-event:${user.id}`, {
    limit: 10,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { event_name?: unknown; metadata?: unknown };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { event_name, metadata } = body;

  if (typeof event_name !== "string" || !VALID_EVENT_NAMES.has(event_name)) {
    return Response.json({ error: "Invalid event_name" }, { status: 400 });
  }

  // Validate metadata is a plain object (or null/undefined)
  let validatedMetadata: Record<string, unknown> = {};
  if (metadata !== undefined && metadata !== null) {
    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      return Response.json({ error: "Invalid metadata" }, { status: 400 });
    }
    validatedMetadata = metadata as Record<string, unknown>;
  }

  // Deduplicate: don't insert the same event for the same user twice
  // (e.g., funnel_signup_complete should only fire once ever)
  const adminDb = await createSupabaseAdmin();
  const { data: existing } = await adminDb
    .from("funnel_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_name", event_name)
    .limit(1);

  if (existing && existing.length > 0) {
    // Already recorded — return success without inserting a duplicate
    return Response.json({ ok: true, deduplicated: true });
  }

  const { error: insertError } = await adminDb.from("funnel_events").insert({
    user_id: user.id,
    event_name,
    metadata: {
      ...validatedMetadata,
      timestamp: new Date().toISOString(),
    },
  });

  if (insertError) {
    console.error("funnel_events insert failed: %s", insertError.message);
    return Response.json({ error: "Event write failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
