/**
 * Seed the database with course content from JSON files.
 *
 * Usage: npx tsx scripts/seed-db.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM ?? "learntogpt";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Set them in .env.local or export them before running this script");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface ExerciseData {
  id: string;
  type: string;
  order_index: number;
  prompt: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  hints: string[];
  xp_reward: number;
}

interface LessonData {
  title: string;
  slug: string;
  description: string;
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  is_free?: boolean;
  content: { sections: unknown[] };
  exercises: ExerciseData[];
}

interface CourseData {
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  order_index: number;
  is_free: boolean;
  icon: string;
  campaign_order?: number;
  level_required?: number;
  prerequisite_slug?: string | null;
  lessons: LessonData[];
}

interface TrackData {
  track: string;
  courses: CourseData[];
}

async function seedTrack(data: TrackData, locale: string) {
  console.log(`\nSeeding track: ${data.track} (locale: ${locale})`);

  for (const course of data.courses) {
    // Insert course
    const courseRow: Record<string, unknown> = {
      title: course.title,
      slug: course.slug,
      description: course.description,
      track: data.track,
      difficulty: course.difficulty,
      order_index: course.order_index,
      is_free: course.is_free,
      icon: course.icon,
      lesson_count: course.lessons.length,
      locale,
      platform: PLATFORM,
    };
    if (course.campaign_order != null) courseRow.campaign_order = course.campaign_order;
    if (course.level_required != null) courseRow.level_required = course.level_required;
    if (course.prerequisite_slug !== undefined) courseRow.prerequisite_slug = course.prerequisite_slug;

    const { data: insertedCourse, error: courseError } = await supabase
      .from("courses")
      .upsert(courseRow, { onConflict: "slug,locale,platform" })
      .select("id")
      .single();

    if (courseError) {
      console.error("  Error inserting course %s:", course.title, courseError.message);
      continue;
    }

    const courseId = insertedCourse.id;
    console.log(`  Course: ${course.title} (${courseId})`);

    for (const lesson of course.lessons) {
      // Insert lesson
      const { data: insertedLesson, error: lessonError } = await supabase
        .from("lessons")
        .upsert(
          {
            course_id: courseId,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            order_index: lesson.order_index,
            xp_reward: lesson.xp_reward,
            estimated_minutes: lesson.estimated_minutes,
            content_json: lesson.content,
            is_free: lesson.is_free ?? course.is_free,
            locale,
          },
          { onConflict: "course_id,slug" }
        )
        .select("id")
        .single();

      if (lessonError) {
        console.error("    Error inserting lesson %s:", lesson.title, lessonError.message);
        continue;
      }

      const lessonId = insertedLesson.id;
      console.log(`    Lesson: ${lesson.title} (${lesson.exercises.length} exercises)`);

      // Delete existing exercises for this lesson before reinserting (idempotent reseed)
      const { error: deleteExError } = await supabase
        .from("exercises")
        .delete()
        .eq("lesson_id", lessonId);

      if (deleteExError) {
        console.error(`      Error deleting old exercises:`, deleteExError.message);
      }

      // Insert exercises
      for (let exIdx = 0; exIdx < lesson.exercises.length; exIdx++) {
        const exercise = lesson.exercises[exIdx];
        const { error: exerciseError } = await supabase.from("exercises").insert({
            lesson_id: lessonId,
            type: exercise.type,
            order_index: exercise.order_index ?? exIdx + 1,
            prompt: exercise.prompt ?? exercise.question ?? "",
            options_json: exercise.options,
            correct_answer: String(exercise.correct_answer ?? ""),
            explanation: exercise.explanation ?? "",
            hints_json: exercise.hints ?? [],
            xp_reward: exercise.xp_reward ?? 5,
            locale,
        });

        if (exerciseError) {
          console.error(`      Error inserting exercise:`, exerciseError.message);
        }
      }
    }
  }
}

async function seedAchievements() {
  console.log("\nSeeding achievements...");

  const achievements = [
    // --- First session badges ---
    { name: "First Steps", description: "Complete your first lesson", icon: "🎯", criteria_json: { type: "lessons_completed", threshold: 1 }, xp_bonus: 10 },
    { name: "Curious Mind", description: "Complete your first exercise", icon: "🧪", criteria_json: { type: "lessons_completed", threshold: 1 }, xp_bonus: 15 },
    { name: "Getting Started XP", description: "Earn your first 50 XP", icon: "⚡", criteria_json: { type: "total_xp", threshold: 50 }, xp_bonus: 10 },

    // --- Early momentum (first week) ---
    { name: "On a Roll", description: "Complete 3 lessons", icon: "🔥", criteria_json: { type: "lessons_completed", threshold: 3 }, xp_bonus: 20 },
    { name: "Five Alive", description: "Complete 5 lessons", icon: "🖐️", criteria_json: { type: "lessons_completed", threshold: 5 }, xp_bonus: 25 },
    { name: "Getting Started", description: "Complete 5 lessons", icon: "Rocket", criteria_json: { type: "lessons_completed", threshold: 5 }, xp_bonus: 25 },
    { name: "Momentum", description: "Complete 10 lessons", icon: "🚀", criteria_json: { type: "lessons_completed", threshold: 10 }, xp_bonus: 50 },
    { name: "Dedicated Learner", description: "Complete 25 lessons", icon: "BookOpen", criteria_json: { type: "lessons_completed", threshold: 25 }, xp_bonus: 100 },
    { name: "GPT Scholar", description: "Complete 50 lessons", icon: "GraduationCap", criteria_json: { type: "lessons_completed", threshold: 50 }, xp_bonus: 250 },
    { name: "GPT Master", description: "Complete 100 lessons", icon: "Crown", criteria_json: { type: "lessons_completed", threshold: 100 }, xp_bonus: 500 },

    // --- Streak milestones ---
    { name: "Day One", description: "Start your first streak", icon: "🌱", criteria_json: { type: "streak_days", threshold: 1 }, xp_bonus: 10 },
    { name: "On Fire", description: "Maintain a 3-day streak", icon: "Flame", criteria_json: { type: "streak_days", threshold: 3 }, xp_bonus: 15 },
    { name: "Dedicated Learner Streak", description: "Maintain a 3-day streak", icon: "📅", criteria_json: { type: "streak_days", threshold: 3 }, xp_bonus: 20 },
    { name: "Committed", description: "Maintain a 5-day streak", icon: "🗓️", criteria_json: { type: "streak_days", threshold: 5 }, xp_bonus: 30 },
    { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "Flame", criteria_json: { type: "streak_days", threshold: 7 }, xp_bonus: 50 },
    { name: "Unstoppable", description: "Maintain a 30-day streak", icon: "Flame", criteria_json: { type: "streak_days", threshold: 30 }, xp_bonus: 200 },

    // --- Perfect score milestones ---
    { name: "Perfectionist", description: "Score 100% on any lesson", icon: "Target", criteria_json: { type: "perfect_score", threshold: 1 }, xp_bonus: 20 },
    { name: "Sharp Shooter", description: "Score 100% on 5 lessons", icon: "🎯", criteria_json: { type: "perfect_score", threshold: 5 }, xp_bonus: 40 },

    // --- XP milestones ---
    { name: "Rising Star", description: "Earn 200 XP", icon: "🌟", criteria_json: { type: "total_xp", threshold: 200 }, xp_bonus: 20 },
    { name: "XP Hunter", description: "Earn 500 total XP", icon: "Zap", criteria_json: { type: "total_xp", threshold: 500 }, xp_bonus: 50 },
    { name: "XP Machine", description: "Earn 1,000 XP", icon: "💫", criteria_json: { type: "total_xp", threshold: 1000 }, xp_bonus: 75 },
    { name: "XP Champion", description: "Earn 2,000 total XP", icon: "Zap", criteria_json: { type: "total_xp", threshold: 2000 }, xp_bonus: 100 },
    { name: "XP Legend", description: "Earn 10,000 total XP", icon: "Trophy", criteria_json: { type: "total_xp", threshold: 10000 }, xp_bonus: 500 },

    // --- Track completions ---
    { name: "Why ChatGPT Complete", description: "Complete the Why ChatGPT? track", icon: "Sparkles", criteria_json: { type: "track_completed", threshold: 1, track: "why_claude" }, xp_bonus: 150 },
    { name: "Three Modes Complete", description: "Complete The Three Modes track", icon: "Layers", criteria_json: { type: "track_completed", threshold: 1, track: "three_levels" }, xp_bonus: 250 },
    { name: "Essentials Master", description: "Complete Master the Essentials track", icon: "Target", criteria_json: { type: "track_completed", threshold: 1, track: "essentials" }, xp_bonus: 300 },
    { name: "Leveled Up", description: "Complete the Level Up track", icon: "Rocket", criteria_json: { type: "track_completed", threshold: 1, track: "level_up" }, xp_bonus: 400 },
    { name: "Builder", description: "Complete a Build Something project", icon: "Hammer", criteria_json: { type: "track_completed", threshold: 1, track: "build_something" }, xp_bonus: 500 },
  ];

  for (const achievement of achievements) {
    const { error } = await supabase
      .from("achievements")
      .upsert(achievement, { onConflict: "name" });

    if (error) {
      console.error("  Error inserting achievement %s:", achievement.name, error.message);
    }
  }

  console.log(`  Inserted ${achievements.length} achievements`);
}

async function main() {
  console.log(`LearnToGPT — Database Seeder (platform: ${PLATFORM})`);
  console.log("================================\n");

  // Seed achievements first
  await seedAchievements();

  // Find and seed all track JSON files
  const seedDir = join(process.cwd(), "content", "seed");
  const files = readdirSync(seedDir).filter((f) => f.startsWith("track") && f.endsWith(".json"));

  console.log(`\nFound ${files.length} track files to seed`);

  let totalCourses = 0;
  let totalLessons = 0;
  let totalExercises = 0;

  // Locales that can appear as a suffix in filenames (e.g. track1-why-claude.zh-CN.json).
  // Order matters: check longer tags before shorter ones to avoid partial matches.
  const knownLocales = ["zh-CN", "en", "ja", "ko", "de", "fr", "es"];

  for (const file of files) {
    // Derive locale from filename: "track1-why-claude.zh-CN.json" → "zh-CN",
    // "track1-why-claude.json" → "en".
    const base = file.slice(0, -5); // strip ".json"
    let fileLocale = "en";
    for (const loc of knownLocales) {
      if (base.endsWith(`.${loc}`)) {
        fileLocale = loc;
        break;
      }
    }

    const filePath = join(seedDir, file);
    const raw = readFileSync(filePath, "utf-8");
    const data: TrackData = JSON.parse(raw);

    await seedTrack(data, fileLocale);

    for (const course of data.courses) {
      totalCourses++;
      for (const lesson of course.lessons) {
        totalLessons++;
        totalExercises += lesson.exercises.length;
      }
    }
  }

  console.log("\n================================");
  console.log(`Done! Seeded ${totalCourses} courses, ${totalLessons} lessons, ${totalExercises} exercises`);
}

main().catch(console.error);
