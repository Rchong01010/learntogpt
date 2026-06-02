import { getLocale } from "next-intl/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getUser, isPro as checkIsPro } from "@/lib/auth";
import { PLATFORM } from "@/lib/config";
import type { Course } from "@/types";
import { CoursesClient } from "./CoursesClient";
import { LocalContinueBanner } from "@/components/LocalContinueBanner";

export default async function CoursesPage() {
  const supabase = await createSupabaseServer();
  const locale = await getLocale();
  const user = await getUser();

  // Fetch courses scoped to the user's locale. The DB has a (slug, locale)
  // composite unique after migration 012, so locale filtering is required
  // to avoid cross-locale duplicates in the list.
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, track, difficulty, order_index, is_free, icon, lesson_count, campaign_order, level_required, prerequisite_slug, created_at")
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .order("order_index");

  if (error) {
    console.error("Failed to fetch courses:", error.message);
  }

  const courseList: Course[] = (courses ?? []) as Course[];

  // Check if user has full access (paid unlock OR < 1 completed courses)
  const isPro = user ? await checkIsPro(user.id) : true;

  return (
    <>
      {/* Show localStorage-based continue banner for anonymous users */}
      {!user && <LocalContinueBanner />}
      <CoursesClient courses={courseList} isPro={isPro} />
    </>
  );
}
