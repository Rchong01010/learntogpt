import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { getTodayChallenge } from "@/lib/daily-challenges";
import { updateStreak } from "@/lib/gamification";
import { getLevelFromXP } from "@/types";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";

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

  // Rate limit: 5 requests per minute per user (generous but prevents spam)
  const rl = rateLimit(user.id, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { clientDate } = body as { challengeId?: number; clientDate?: string };

  // Get today's challenge to read the XP reward
  const challenge = getTodayChallenge();

  // Check if already completed today by looking at user_streaks
  // We use a localStorage key convention on the client, but server-side
  // we check the streak table to enforce once-per-day.
  const utcToday = new Date().toISOString().split("T")[0];
  let today = utcToday;
  if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
    const clientMs = new Date(clientDate + "T00:00:00Z").getTime();
    const utcMs = new Date(utcToday + "T00:00:00Z").getTime();
    const diffDays = Math.abs(clientMs - utcMs) / 86_400_000;
    if (diffDays <= 1) {
      today = clientDate;
    }
  }

  const adminSupabase = await createSupabaseAdmin();

  // Server-side dedup — atomic and cold-start-proof. Claim today's completion by
  // inserting into daily_challenge_completions, which is UNIQUE on
  // (user_id, challenge_date). If the row already exists the insert fails with
  // Postgres 23505 (unique_violation) → the user already completed today.
  //
  // This replaces the previous in-memory rateLimit() guard, which lived in a
  // single serverless instance's memory and reset on cold start — letting a user
  // re-claim daily-challenge XP repeatedly by landing on a fresh instance.
  // Table is created by claude-academy migration 038 (shared DB).
  const { error: claimErr } = await adminSupabase
    .from("daily_challenge_completions")
    .insert({ user_id: user.id, challenge_date: today });

  if (claimErr) {
    // 23505 = unique_violation → already claimed today. Expected, not an error.
    if (claimErr.code === "23505") {
      return Response.json(
        { error: "Already completed today", success: false },
        { status: 409 },
      );
    }
    // Any other DB failure: fail loud and do NOT award XP (never award unmetered).
    console.error("[daily-challenge] dedup claim failed:", {
      userId: user.id,
      error: claimErr.message,
    });
    return Response.json(
      { error: "Could not record completion" },
      { status: 500 },
    );
  }

  // Update streak — this records today's activity and protects their streak
  await updateStreak(user.id, adminSupabase, clientDate);

  // Award XP
  const { error: xpErr } = await adminSupabase.rpc("increment_xp", {
    p_user_id: user.id,
    p_amount: challenge.xpReward,
  });

  if (xpErr) {
    console.error("[daily-challenge] XP award failed:", {
      userId: user.id,
      error: xpErr.message,
    });
    return Response.json({ error: "XP award failed" }, { status: 500 });
  }

  // Sync level after XP bump
  const { data: updated } = await adminSupabase
    .from("user_profiles")
    .select("total_xp")
    .eq("user_id", user.id)
    .single();

  if (updated) {
    await adminSupabase
      .from("user_profiles")
      .update({ level: getLevelFromXP(updated.total_xp ?? 0) })
      .eq("user_id", user.id);
  }

  return Response.json({
    success: true,
    xp_awarded: challenge.xpReward,
  });
}
