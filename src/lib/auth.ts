import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import type { Subscription, SubscriptionStatus } from "@/types";
import { PLATFORM } from "@/lib/config";

/**
 * Validates that the request Origin header matches the app's allowed origin.
 * Returns true if valid, false if the origin is missing or doesn't match.
 * Effective CSRF protection for same-origin POST requests.
 */
export function validateOrigin(request: Request): boolean {
  const allowedOrigin = (
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com"
  ).replace(/[\r\n\s]+/g, "").replace(/\/+$/, "");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return origin === allowedOrigin;
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return refererOrigin === allowedOrigin;
    } catch {
      return false;
    }
  }

  // No Origin or Referer header — reject
  return false;
}

/**
 * Returns the current authenticated user, or null if not signed in.
 */
export async function getUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Returns the current authenticated user, or redirects to /sign-in.
 */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

/**
 * Returns the subscription status for the current user.
 */
export async function getUserSubscription(): Promise<{
  status: SubscriptionStatus;
  subscription: Subscription | null;
}> {
  const user = await getUser();

  if (!user) {
    return { status: "free", subscription: null };
  }

  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("subscriptions")
    .select("id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at")
    .eq("user_id", user.id)
    .single();

  if (!data || data.status !== "active") {
    return { status: "free", subscription: data ?? null };
  }

  return { status: data.status as SubscriptionStatus, subscription: data };
}

/**
 * Returns the number of distinct courses (by slug) the user has fully completed
 * in any locale. A course is "completed" when every lesson in that course row
 * has status='completed' in user_progress.
 *
 * Counts by slug so multi-locale completions don't double-count (e.g. finishing
 * the 'es' version of a course still counts as one completed course).
 */
export async function getCompletedCourseCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServer();

  // Fetch all courses with slug (to deduplicate across locales)
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("platform", PLATFORM);

  if (!courses || courses.length === 0) return 0;

  // Build map: course_id → slug
  const courseSlugById = new Map(courses.map((c) => [c.id, c.slug]));
  const allCourseIds = courses.map((c) => c.id);

  // All lessons across all courses
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", allCourseIds);

  if (!allLessons || allLessons.length === 0) return 0;

  // User's completed lessons
  const allLessonIds = allLessons.map((l) => l.id);
  const { data: completedProgress } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("lesson_id", allLessonIds);

  const completedSet = new Set((completedProgress ?? []).map((p) => p.lesson_id));

  // Build map: course_id → lesson IDs
  const lessonsByCourse = new Map<string, string[]>();
  for (const lesson of allLessons) {
    if (!lessonsByCourse.has(lesson.course_id)) {
      lessonsByCourse.set(lesson.course_id, []);
    }
    lessonsByCourse.get(lesson.course_id)!.push(lesson.id);
  }

  // A course_id row is "completed" when all its lessons are completed.
  // Deduplicate by slug so multi-locale rows for the same course count once.
  const completedSlugs = new Set<string>();
  for (const [courseId, lessonList] of lessonsByCourse) {
    if (lessonList.length > 0 && lessonList.every((id) => completedSet.has(id))) {
      const slug = courseSlugById.get(courseId);
      if (slug) completedSlugs.add(slug);
    }
  }

  return completedSlugs.size;
}

/**
 * Returns whether the user has purchased the one-time course unlock.
 */
export async function hasUnlocked(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("course_unlocks")
    .select("id")
    .eq("user_id", userId)
    .eq("platform", PLATFORM)
    .maybeSingle();
  return data !== null;
}

/**
 * Checks if a user has full access to all courses.
 *
 * Rules (paywall v1):
 *   - Unauthenticated:            false (handled upstream)
 *   - < 2 completed courses:      true  (free tier, enjoy)
 *   - >= 2 completed courses AND has paid unlock: true
 *   - >= 2 completed courses AND NOT paid:               false (paywall)
 *
 * "Completed" means every lesson in the course has status='completed'.
 * The first 2 courses (any 2, user's choice) are always free.
 * Starting from the 3rd course the user tries to open, they hit the wall.
 *
 * Grace rule: a course the user has *already started* (has any in_progress
 * or completed lessons) is never blocked — they can always finish it.
 * That logic lives in the page/lesson layer, not here.
 */
export async function isPro(userId: string): Promise<boolean> {
  // Fast path: paid unlock overrides everything
  const unlocked = await hasUnlocked(userId);
  if (unlocked) return true;

  // Count fully completed courses
  const completedCount = await getCompletedCourseCount(userId);

  // Fewer than 2 completed → still in the free tier
  if (completedCount < 2) return true;

  // 2+ completed and no payment → paywall active
  return false;
}
