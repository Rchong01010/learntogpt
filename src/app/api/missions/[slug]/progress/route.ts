import type { NextRequest } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import { getLevelFromXP } from "@/types";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

  const rl = rateLimit(`missions:progress:${user.id}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await params;

  if (!slug || !SLUG_REGEX.test(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  // Parse and validate body
  let body: { step_number?: number; project_data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { step_number, project_data } = body;

  if (step_number == null || typeof step_number !== "number" || step_number < 1) {
    return Response.json({ error: "Invalid step_number" }, { status: 400 });
  }

  // Look up mission
  const { data: mission } = await supabase
    .from("missions")
    .select("id, step_count, max_xp, is_free")
    .eq("slug", slug)
    .single();

  if (!mission) {
    return Response.json({ error: "Mission not found" }, { status: 404 });
  }

  // Wave 2 (GTM bible v2.0 §3): Pro paywall is OFF — every mission step is
  // open to any signed-in user.

  if (step_number > mission.step_count) {
    return Response.json({ error: "Step number exceeds mission steps" }, { status: 400 });
  }

  // Look up user mission
  const { data: userMission } = await supabase
    .from("user_missions")
    .select("id, user_id, mission_id, status, current_step, progress_percent, project_data, xp_earned, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("mission_id", mission.id)
    .single();

  if (!userMission) {
    return Response.json({ error: "Mission not started" }, { status: 404 });
  }

  if (userMission.status === "completed") {
    return Response.json({ error: "Mission already completed" }, { status: 409 });
  }

  // Prevent step replay (XP farming)
  if (step_number < userMission.current_step) {
    return Response.json({ error: "Step already completed" }, { status: 409 });
  }

  // Look up the step being completed to get its XP reward
  const { data: step } = await supabase
    .from("mission_steps")
    .select("xp_reward")
    .eq("mission_id", mission.id)
    .eq("step_number", step_number)
    .single();

  if (!step) {
    return Response.json({ error: "Step not found" }, { status: 404 });
  }

  const isFinalStep = step_number >= mission.step_count;
  const stepXP = step.xp_reward ?? 25;
  // Award 20% bonus XP on mission completion
  const bonusXP = isFinalStep ? Math.round(mission.max_xp * 0.2) : 0;
  const totalStepXP = stepXP + bonusXP;

  const newXPEarned = userMission.xp_earned + totalStepXP;
  const nextStep = isFinalStep ? step_number : step_number + 1;
  const progressPercent = Math.round((step_number / mission.step_count) * 100);
  const newStatus = isFinalStep ? "completed" : "in_progress";

  // Merge project_data if provided
  const mergedProjectData = project_data
    ? { ...(userMission.project_data ?? {}), ...project_data }
    : userMission.project_data;

  // Update user mission
  const updateData: Record<string, unknown> = {
    current_step: nextStep,
    progress_percent: progressPercent,
    status: newStatus,
    xp_earned: newXPEarned,
    project_data: mergedProjectData,
  };

  if (isFinalStep) {
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("user_missions")
    .update(updateData)
    .eq("id", userMission.id);

  if (updateError) {
    console.error("Mission progress error:", updateError.message);
    return Response.json({ error: "Failed to update progress" }, { status: 500 });
  }

  // Award XP to user profile — must use admin client because migration 009's
  // protect_profile_fields trigger reverts XP/level writes from authenticated.
  if (totalStepXP > 0) {
    const adminDb = await createSupabaseAdmin();
    const { data: profile } = await adminDb
      .from("user_profiles")
      .select("total_xp")
      .eq("user_id", user.id)
      .single();

    const newTotalXP = (profile?.total_xp ?? 0) + totalStepXP;
    const newLevel = getLevelFromXP(newTotalXP);

    await adminDb
      .from("user_profiles")
      .update({ total_xp: newTotalXP, level: newLevel })
      .eq("user_id", user.id);
  }

  return Response.json({
    success: true,
    status: newStatus,
    current_step: nextStep,
    progress_percent: progressPercent,
    xp_earned: totalStepXP,
    bonus_xp: bonusXP,
    completed: isFinalStep,
  });
}
