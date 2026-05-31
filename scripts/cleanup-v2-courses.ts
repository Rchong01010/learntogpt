/**
 * Remove old V2 curriculum courses from the database.
 *
 * This deletes all courses with the old track values (fundamentals, work,
 * claude_code, api_agents, architect_prep). Cascading foreign keys handle
 * lessons, exercises, and user_progress automatically.
 *
 * User profiles, subscriptions, and streaks are NOT affected.
 *
 * Usage: npx tsx scripts/cleanup-v2-courses.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const OLD_TRACKS = ["fundamentals", "work", "claude_code", "api_agents", "architect_prep"];

async function main() {
  console.log("Claude Academy — V2 Course Cleanup");
  console.log("===================================\n");

  // Show what will be deleted
  const { data: oldCourses, error: fetchError } = await supabase
    .from("courses")
    .select("id, title, slug, track")
    .in("track", OLD_TRACKS);

  if (fetchError) {
    console.error("Error fetching old courses:", fetchError.message);
    process.exit(1);
  }

  if (!oldCourses || oldCourses.length === 0) {
    console.log("No old V2 courses found. Nothing to clean up.");
    return;
  }

  console.log(`Found ${oldCourses.length} old courses to remove:\n`);
  for (const course of oldCourses) {
    console.log(`  [${course.track}] ${course.title} (${course.slug})`);
  }

  // Also delete old track-completed achievements that reference old track names
  const { error: achievementError } = await supabase
    .from("achievements")
    .delete()
    .in("name", [
      "Fundamentals Complete",
      "Work Pro",
      "Code Master",
      "Agent Builder",
      "Architect Ready",
    ]);

  if (achievementError) {
    console.error("\nError deleting old achievements:", achievementError.message);
  } else {
    console.log("\nDeleted old track-completion achievements");
  }

  // Delete old courses (cascades to lessons -> exercises, user_progress)
  const { error: deleteError } = await supabase
    .from("courses")
    .delete()
    .in("track", OLD_TRACKS);

  if (deleteError) {
    console.error("\nError deleting old courses:", deleteError.message);
    process.exit(1);
  }

  console.log(`\nDeleted ${oldCourses.length} old courses and all associated data.`);
  console.log("User profiles, subscriptions, and streaks are untouched.");
}

main().catch(console.error);
