import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import type { ExerciseEventType } from "@/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_EVENT_TYPES = new Set<ExerciseEventType>([
  "started",
  "completed",
  "abandoned",
]);

// 1 hour. Sessions that claim longer than this are almost certainly a stuck
// tab the user forgot about, not real engagement — cap rather than discard so
// the event itself (completed / abandoned) is still recorded.
const MAX_TIME_SPENT_MS = 60 * 60 * 1000;

// beforeunload / visibilitychange fire sendBeacon with Content-Type: text/plain
// (the Blob body trick is needed because navigator.sendBeacon doesn't let you
// set arbitrary headers). Accept both so abandon events aren't dropped at the
// edge for looking like a CSRF form post.
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

  // Events are high-volume by design (started + completed + possible abandon
  // per exercise, plus multi-tab scenarios). 120/min/user comfortably covers
  // normal use while still shutting down a runaway loop.
  const rl = rateLimit(`exercise-event:${user.id}`, {
    limit: 120,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    exercise_id?: unknown;
    lesson_id?: unknown;
    event_type?: unknown;
    time_spent_ms?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { exercise_id, lesson_id, event_type, time_spent_ms } = body;

  if (typeof exercise_id !== "string" || !UUID_REGEX.test(exercise_id)) {
    return Response.json({ error: "Invalid exercise_id" }, { status: 400 });
  }

  if (typeof lesson_id !== "string" || !UUID_REGEX.test(lesson_id)) {
    return Response.json({ error: "Invalid lesson_id" }, { status: 400 });
  }

  if (
    typeof event_type !== "string" ||
    !VALID_EVENT_TYPES.has(event_type as ExerciseEventType)
  ) {
    return Response.json({ error: "Invalid event_type" }, { status: 400 });
  }

  let validatedTimeSpentMs: number | null = null;
  if (time_spent_ms !== undefined && time_spent_ms !== null) {
    if (
      typeof time_spent_ms !== "number" ||
      !Number.isFinite(time_spent_ms) ||
      !Number.isInteger(time_spent_ms) ||
      time_spent_ms < 0
    ) {
      return Response.json(
        { error: "Invalid time_spent_ms" },
        { status: 400 },
      );
    }
    // Cap rather than reject: a stuck-tab session shouldn't discard the event
    // itself (we still want to record that the user abandoned / completed).
    validatedTimeSpentMs = Math.min(time_spent_ms, MAX_TIME_SPENT_MS);
  }

  // Use the admin client — exercise_events has an authenticated INSERT policy
  // (defence-in-depth) but the server route is the canonical write path and
  // mirrors how /api/exercises/check writes user_exercise_attempts.
  const adminDb = await createSupabaseAdmin();
  const { error: insertError } = await adminDb.from("exercise_events").insert({
    user_id: user.id,
    exercise_id,
    lesson_id,
    event_type: event_type as ExerciseEventType,
    time_spent_ms: validatedTimeSpentMs,
  });

  if (insertError) {
    // Log server-side with a constant format string (semgrep format-string
    // rule) and keep the client-facing error generic so we don't leak the DB
    // error shape.
    console.error("exercise_events insert failed: %s", insertError.message);
    return Response.json({ error: "Event write failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
