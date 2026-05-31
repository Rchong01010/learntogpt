/**
 * Client-side analytics helper for per-exercise instrumentation.
 *
 * Wraps POST /api/events/exercise. For `abandoned` events we use
 * `navigator.sendBeacon` so the event fires reliably during page
 * unload / tab close, when fetch() would otherwise be cancelled.
 *
 * sendBeacon does not let us set Content-Type: application/json — it
 * defaults to text/plain when given a string. The server route handles
 * both content types (raw text body, JSON parse after read).
 *
 * PII note: never pass answer content, free-text, or anything else that
 * identifies exercise choices. Only IDs + timing.
 */

export type ExerciseEventType = "started" | "completed" | "abandoned";

export interface ExerciseEventPayload {
  exercise_id: string;
  lesson_id: string;
  event_type: ExerciseEventType;
  time_spent_ms?: number;
}

const ENDPOINT = "/api/events/exercise";

/**
 * Fires a single exercise event. Uses sendBeacon for `abandoned` so the
 * request survives page unload; otherwise falls back to fetch().
 *
 * Fire-and-forget — never throws, never blocks the UI.
 */
export function trackExerciseEvent(payload: ExerciseEventPayload): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(payload);

  // For abandoned events we MUST use sendBeacon so the request survives
  // tab close / navigation. sendBeacon sends the string body as
  // text/plain by default — the server handles that content-type.
  if (payload.event_type === "abandoned" && typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(ENDPOINT, body);
      return;
    } catch {
      // Fall through to fetch below.
    }
  }

  // fire-and-forget fetch; swallow errors — instrumentation must never
  // break the lesson flow.
  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}
