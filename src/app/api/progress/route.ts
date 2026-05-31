import { getLocale } from "next-intl/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import {
  calculateXP,
  checkAchievements,
  computeLessonXpBreakdown,
  isPerfectRun,
  logXpModeOnce,
  updateStreak,
} from "@/lib/gamification";
import { getLevelFromXP, type LessonXpBreakdown } from "@/types";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES = new Set(["in_progress", "completed"]);

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  // Log XP-scaling mode on first request after boot (no-op on subsequent).
  logXpModeOnce();

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 requests per minute per user
  const rl = rateLimit(user.id, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    lesson_id?: string;
    status?: string;
    score?: number;
    client_date?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { lesson_id, status, score } = body;

  // Input validation
  if (!lesson_id || !status || score == null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!UUID_REGEX.test(lesson_id)) {
    return Response.json({ error: "Invalid lesson_id" }, { status: 400 });
  }

  if (!VALID_STATUSES.has(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const validScore = Math.max(0, Math.min(100, Math.round(Number(score))));
  if (isNaN(validScore)) {
    return Response.json({ error: "Invalid score" }, { status: 400 });
  }

  // Look up lesson + course to check tier and XP reward server-side
  const { data: lesson } = await supabase
    .from("lessons")
    .select("xp_reward, estimated_minutes, is_free")
    .eq("id", lesson_id)
    .single();

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Wave 2 (GTM bible v2.0 §3): Pro paywall is OFF — every signed-in user
  // can record progress on every lesson.

  const serverXP = lesson.xp_reward ?? 10;
  const estimatedMinutes = lesson.estimated_minutes ?? 5;

  // Check if this is a first attempt
  const { data: existing } = await supabase
    .from("user_progress")
    .select("id, score, status")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson_id)
    .single();

  const isFirstAttempt = !existing;
  // A lesson is "already completed" only if it was previously marked completed,
  // not merely because it has a non-zero score from in-progress saves. The old
  // check (score > 0) caused the completion request to see the in-progress
  // score and skip XP entirely — users earned 0 XP on lesson finish.
  const alreadyCompleted = existing?.status === "completed";
  const isPerfect = validScore === 100;

  // --- Compute final XP ---------------------------------------------------
  // Lesson-completion path uses computeLessonXpBreakdown (perfect-run + streak).
  // The legacy calculateXP() path stays for non-completion status writes so we
  // don't double-count bonuses before the user has finished the lesson.
  let xpBreakdown: LessonXpBreakdown | null = null;
  let finalXP = 0;

  if (!alreadyCompleted) {
    if (status === "completed") {
      // Read current streak BEFORE updateStreak() runs later — we want the
      // "pre-completion" streak to drive the multiplier (so day 7 completing
      // their 7th-day lesson still gets the 2x for that lesson).
      const { data: profileRow } = await supabase
        .from("user_profiles")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();
      const preStreak = profileRow?.current_streak ?? 0;

      // Perfect-run check: every exercise correct on first attempt?
      // Uses admin client — user_exercise_attempts has no authenticated read
      // policy for cross-user safety, and we already trust this server path.
      // Also reused below for XP/streak/achievement writes (migration 009 trigger).
      const adminDb = await createSupabaseAdmin();
      let perfectRun = false;
      try {
        perfectRun = await isPerfectRun(user.id, lesson_id, adminDb);
      } catch (err) {
        console.error("isPerfectRun failed (non-critical):", err);
      }

      xpBreakdown = computeLessonXpBreakdown({
        dbXpReward: serverXP,
        estimatedMinutes,
        perfectRun,
        currentStreak: preStreak,
      });
      finalXP = xpBreakdown.final_xp;
    } else {
      // in_progress save — use the legacy exercise-level formula.
      finalXP = calculateXP(serverXP, isFirstAttempt, isPerfect);
    }
  }

  // Upsert user_progress (always update status/score, but only set xp_earned on first completion)
  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    lesson_id,
    status,
    score: validScore,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };
  if (!alreadyCompleted) {
    upsertData.xp_earned = finalXP;
  }

  const { error: progressError } = await supabase
    .from("user_progress")
    .upsert(upsertData, { onConflict: "user_id,lesson_id" });

  if (progressError) {
    console.error("Progress save error:", progressError.message);
    return Response.json({ error: "Failed to save progress" }, { status: 500 });
  }

  // Post-save operations (XP, streaks, achievements) — non-critical, don't fail the request
  let newAchievements: { name: string }[] = [];
  try {
    // Use admin client for all gamification writes — migration 009's
    // protect_profile_fields trigger reverts XP/level/streak changes
    // from non-service_role clients.
    const adminForXp = await createSupabaseAdmin();

    // Atomic XP increment via RPC — avoids read-modify-write race when
    // multiple lessons complete concurrently.
    if (finalXP > 0) {
      await adminForXp.rpc("increment_xp", {
        p_user_id: user.id,
        p_amount: finalXP,
      });
      // Sync level after atomic XP bump
      const { data: updatedProfile } = await adminForXp
        .from("user_profiles")
        .select("total_xp")
        .eq("user_id", user.id)
        .single();
      if (updatedProfile) {
        await adminForXp
          .from("user_profiles")
          .update({ level: getLevelFromXP(updatedProfile.total_xp ?? 0) })
          .eq("user_id", user.id);
      }
    }

    if (status === "completed") {
      await updateStreak(user.id, adminForXp, body.client_date);
    }

    const locale = await getLocale();
    const achievements = await checkAchievements(user.id, adminForXp, locale);
    newAchievements = achievements.map((a) => ({ name: a.name }));
  } catch (err) {
    console.error("Post-save error (non-critical):", err);
  }

  return Response.json({
    success: true,
    new_xp: finalXP,
    achievements: newAchievements.map((a) => a.name),
    // Null unless this request was a first-time lesson completion.
    xp_breakdown: xpBreakdown,
  });
}
