import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import { MISSIONS_ENABLED } from "@/lib/config";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Missions are Claude-branded and not platform-scoped — disabled on LearnToGPT.
  if (!MISSIONS_ENABLED) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

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

  const rl = rateLimit(`missions:start:${user.id}`, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await params;

  if (!slug || !SLUG_REGEX.test(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  // Look up the mission
  const { data: mission } = await supabase
    .from("missions")
    .select("id, step_count, is_free")
    .eq("slug", slug)
    .single();

  if (!mission) {
    return Response.json({ error: "Mission not found" }, { status: 404 });
  }

  // Wave 2 (GTM bible v2.0 §3): Pro paywall is OFF — every mission is open
  // to any signed-in user. `is_free` column stays so the gate can be
  // reintroduced without a schema change.

  // Check if user already started this mission
  const { data: existing } = await supabase
    .from("user_missions")
    .select("id, user_id, mission_id, status, current_step, progress_percent, project_data, xp_earned, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("mission_id", mission.id)
    .single();

  if (existing) {
    return Response.json({ user_mission: existing });
  }

  // Create new user_mission row
  const { data: userMission, error } = await supabase
    .from("user_missions")
    .insert({
      user_id: user.id,
      mission_id: mission.id,
      status: "started",
      current_step: 1,
      progress_percent: 0,
      project_data: {},
      xp_earned: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Start mission error:", error.message);
    return Response.json({ error: "Failed to start mission" }, { status: 500 });
  }

  return Response.json({ user_mission: userMission }, { status: 201 });
}
