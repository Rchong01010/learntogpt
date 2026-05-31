/**
 * localStorage-based progress persistence for anonymous (unauthenticated) users.
 *
 * Stores the last lesson/step each anonymous visitor reached so they can
 * resume when they return. On sign-up / login the data is merged to the
 * server via the /api/progress endpoint, then cleared.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM } from "@/lib/config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocalProgressEntry {
  courseSlug: string;
  lessonSlug: string;
  stepIndex: number;
  timestamp: number;
}

interface LocalProgressStore {
  /** Keyed by `${courseSlug}::${lessonSlug}` for fast upsert. */
  entries: Record<string, LocalProgressEntry>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "learntogpt_progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function readStore(): LocalProgressStore {
  if (!isStorageAvailable()) return { entries: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: {} };
    const parsed = JSON.parse(raw) as LocalProgressStore;
    if (!parsed || typeof parsed.entries !== "object") return { entries: {} };
    return parsed;
  } catch {
    return { entries: {} };
  }
}

function writeStore(store: LocalProgressStore): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or blocked — silently degrade.
  }
}

function entryKey(courseSlug: string, lessonSlug: string): string {
  return `${courseSlug}::${lessonSlug}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save progress for the current lesson. Upserts: only advances the
 * stepIndex (never goes backward for the same lesson).
 */
export function saveLocalProgress(
  courseSlug: string,
  lessonSlug: string,
  stepIndex: number,
): void {
  const store = readStore();
  const key = entryKey(courseSlug, lessonSlug);
  const existing = store.entries[key];

  // Only update if we're further along (or it's a new entry).
  if (!existing || stepIndex > existing.stepIndex) {
    store.entries[key] = { courseSlug, lessonSlug, stepIndex, timestamp: Date.now() };
    writeStore(store);
  }
}

/**
 * Returns the most-recent progress entry (by timestamp), or null.
 */
export function getLocalProgress(): LocalProgressEntry | null {
  const store = readStore();
  const all = Object.values(store.entries);
  if (all.length === 0) return null;
  return all.reduce((latest, e) => (e.timestamp > latest.timestamp ? e : latest));
}

/**
 * Returns all saved progress entries, sorted newest-first.
 */
export function getAllLocalProgress(): LocalProgressEntry[] {
  const store = readStore();
  return Object.values(store.entries).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Clears all local progress data (called after successful merge).
 */
export function clearLocalProgress(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently degrade.
  }
}

/**
 * After sign-up / login, replay local progress entries to the server
 * via the existing /api/progress endpoint, then clear localStorage.
 *
 * Best-effort: failures are logged but never block the auth flow.
 */
export async function mergeLocalProgressToServer(
  supabase: SupabaseClient,
): Promise<void> {
  const entries = getAllLocalProgress();
  if (entries.length === 0) return;

  // We need the user to be authenticated.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Look up lesson IDs for each (courseSlug, lessonSlug) pair.
  // We need to resolve slugs → lesson_id since /api/progress expects lesson_id.
  for (const entry of entries) {
    try {
      // Find the lesson ID from the slug pair.
      const { data: lesson } = await supabase
        .from("lessons")
        .select("id, course_id")
        .eq("slug", entry.lessonSlug)
        .limit(10);

      if (!lesson || lesson.length === 0) continue;

      // Filter to the correct course by slug.
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", entry.courseSlug)
        .eq("platform", PLATFORM)
        .limit(10);

      if (!course || course.length === 0) continue;

      const courseIds = new Set(course.map((c) => c.id));
      const matchedLesson = lesson.find((l) => courseIds.has(l.course_id));
      if (!matchedLesson) continue;

      // POST to the progress API. We mark it as in_progress since we only
      // know the step they reached, not whether they completed exercises.
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: matchedLesson.id,
          status: "in_progress",
          score: 0,
        }),
      });
    } catch (err) {
      console.error("[local-progress] merge failed for entry:", entry, err);
      // Non-fatal — continue with remaining entries.
    }
  }

  clearLocalProgress();
}
