import type { SupabaseClient } from "@supabase/supabase-js";
import { isPro } from "@/lib/auth";

/**
 * Grace rule (paywall v1, see isPro in src/lib/auth.ts): a user who has
 * already started a course can always finish it. True when the user has any
 * user_progress row for a lesson in `courseId`.
 */
export async function hasProgressInCourse(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data: courseLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const ids = (courseLessons ?? []).map((l: { id: string }) => l.id);
  if (ids.length === 0) return false;

  const { data: existingProgress } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", ids)
    .limit(1);

  return (existingProgress ?? []).length > 0;
}

/**
 * Single course-access decision for a signed-in user: entitled (isPro) or
 * already started under the grace rule. Shared by the lesson page (render)
 * and POST /api/progress (write) so both paths apply the same rule.
 */
export async function canAccessCourse(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  isProFn: (userId: string) => Promise<boolean> = isPro,
): Promise<boolean> {
  if (await isProFn(userId)) return true;
  return hasProgressInCourse(supabase, userId, courseId);
}
