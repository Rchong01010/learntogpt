/**
 * Re-seed a single course by slug, optionally for a specific locale.
 * Deletes old exercises + lessons, then re-inserts from seed JSON.
 *
 * Usage:
 *   npx tsx scripts/reseed-course.ts <course-slug> [track-file] [--locale <locale>]
 *
 * Examples:
 *   npx tsx scripts/reseed-course.ts what-is-claude track1-why-claude.json
 *   npx tsx scripts/reseed-course.ts what-is-claude track1-why-claude --locale ja
 *
 * Seed file resolution:
 *   en  → content/seed/<track-file-base>.json
 *   ja  → content/seed/<track-file-base>.ja.json
 *   etc.
 *
 * Track-file arg can be passed with or without the `.json` extension.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Parse args: positional + optional --locale flag
const rawArgs = process.argv.slice(2);
let locale = "en";
const positional: string[] = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === "--locale" && i + 1 < rawArgs.length) {
    locale = rawArgs[i + 1];
    i++;
  } else {
    positional.push(rawArgs[i]);
  }
}

const courseSlug = positional[0];
let trackBase = positional[1] || "track1-why-claude";
if (trackBase.endsWith(".json")) trackBase = trackBase.slice(0, -5);
// Also strip an existing locale suffix if present (e.g. "track1-why-claude.ja")
const knownLocales = ["en", "ja", "ko", "zh-CN", "de", "fr", "es"];
for (const loc of knownLocales) {
  if (trackBase.endsWith(`.${loc}`)) {
    trackBase = trackBase.slice(0, -(loc.length + 1));
    break;
  }
}

const trackFile =
  locale === "en" ? `${trackBase}.json` : `${trackBase}.${locale}.json`;

if (!courseSlug) {
  console.error(
    "Usage: npx tsx scripts/reseed-course.ts <course-slug> [track-file] [--locale <locale>]"
  );
  process.exit(1);
}

async function main() {
  console.log(
    `Re-seeding course: ${courseSlug} from ${trackFile} (locale: ${locale})\n`
  );

  // Load seed data
  const seedPath = join(process.cwd(), "content", "seed", trackFile);
  const data = JSON.parse(readFileSync(seedPath, "utf-8"));
  const courseData = data.courses.find(
    (c: { slug: string }) => c.slug === courseSlug
  );

  if (!courseData) {
    console.error(`Course "${courseSlug}" not found in ${trackFile}`);
    process.exit(1);
  }

  // Find existing course in DB — scoped to this locale
  const { data: existingCourse } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .eq("locale", locale)
    .single();

  if (existingCourse) {
    console.log(`Found existing course (${locale}): ${existingCourse.id}`);

    // Get all lesson IDs for this course
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("course_id", existingCourse.id);

    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      console.log(`  Deleting exercises for ${lessons.length} lessons...`);

      const { error: delExError } = await supabase
        .from("exercises")
        .delete()
        .in("lesson_id", lessonIds);

      if (delExError)
        console.error("  Error deleting exercises:", delExError.message);
      else console.log("  Exercises deleted.");

      // Delete user progress for these lessons (so users can redo them)
      const { error: delProgressError } = await supabase
        .from("user_progress")
        .delete()
        .in("lesson_id", lessonIds);

      if (delProgressError)
        console.error("  Error deleting progress:", delProgressError.message);
      else console.log("  User progress cleared.");

      // Delete lessons
      const { error: delLessonError } = await supabase
        .from("lessons")
        .delete()
        .eq("course_id", existingCourse.id);

      if (delLessonError)
        console.error("  Error deleting lessons:", delLessonError.message);
      else console.log("  Lessons deleted.");
    }
  }

  // Upsert the course for this locale.
  // onConflict uses the (slug, locale) composite unique index from migration 012.
  const { data: upsertedCourse, error: courseError } = await supabase
    .from("courses")
    .upsert(
      {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        track: data.track,
        difficulty: courseData.difficulty,
        order_index: courseData.order_index,
        is_free: courseData.is_free,
        icon: courseData.icon,
        lesson_count: courseData.lessons.length,
        locale,
      },
      { onConflict: "slug,locale" }
    )
    .select("id")
    .single();

  if (courseError) {
    console.error("Error upserting course:", courseError.message);
    process.exit(1);
  }

  const courseId = upsertedCourse.id;
  console.log(`\nCourse upserted: ${courseData.title} (${courseId})`);

  // Insert lessons + exercises
  let totalExercises = 0;

  for (const lesson of courseData.lessons) {
    const { data: insertedLesson, error: lessonError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        order_index: lesson.order_index,
        xp_reward: lesson.xp_reward,
        estimated_minutes: lesson.estimated_minutes,
        content_json: lesson.content,
        is_free: lesson.is_free ?? courseData.is_free,
        locale,
      })
      .select("id")
      .single();

    if (lessonError) {
      console.error(
        `  Error inserting lesson "${lesson.title}":`,
        lessonError.message
      );
      continue;
    }

    console.log(
      `  Lesson: ${lesson.title} (${lesson.exercises.length} exercises)`
    );

    for (const exercise of lesson.exercises) {
      const { error: exError } = await supabase.from("exercises").insert({
        lesson_id: insertedLesson.id,
        type: exercise.type,
        order_index: exercise.order_index ?? 0,
        prompt: exercise.prompt ?? exercise.question ?? "",
        options_json: exercise.options ?? null,
        correct_answer: String(exercise.correct_answer ?? ""),
        explanation: exercise.explanation ?? "",
        hints_json: exercise.hints ?? [],
        xp_reward: exercise.xp_reward ?? 5,
        locale,
      });

      if (exError) console.error(`    Exercise error:`, exError.message);
      else totalExercises++;
    }
  }

  console.log(
    `\nDone! Re-seeded ${courseData.lessons.length} lessons, ${totalExercises} exercises (locale: ${locale}).`
  );
}

main().catch(console.error);
