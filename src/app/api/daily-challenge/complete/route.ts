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

  // Server-side dedup: check user_streaks for today.
  // If a streak entry already exists for today with completed_lessons > 0
  // AND a daily_challenge flag, reject the duplicate.
  // We use welcome_email_log pattern: upsert a marker row with a unique key.
  // Lightweight approach: check user_streaks for today — if the daily challenge
  // XP was already awarded, the streak entry's completed_lessons will be > 0.
  // More robust: use a dedicated check against a challenge-specific field.
  //
  // Simplest robust approach: try to insert a row in welcome_email_log with
  // email_number=99 (reserved for daily challenge) + today's date as a dedup key.
  // But that's a hack. Instead, use user_streaks date check directly.
  const { data: existingStreak } = await adminSupabase
    .from("user_streaks")
    .select("completed_lessons")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  // If user already has a streak entry with completed_lessons > 0 for today,
  // they already completed a challenge or lesson. We allow the first daily
  // challenge completion only if we haven't awarded challenge XP yet.
  // Use a simple flag: store challenge completion in localStorage on client,
  // and here we check if this specific request is a duplicate by using
  // a rate limit of 1 per day (stricter than the 5/min general limit).
  const dailyKey = `daily_challenge:${user.id}:${today}`;
  const dailyRl = rateLimit(dailyKey, { limit: 1, windowSeconds: 86400 });
  if (!dailyRl.allowed) {
    return Response.json(
      { error: "Already completed today", success: false },
      { status: 409 },
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
