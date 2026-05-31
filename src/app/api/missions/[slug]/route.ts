import type { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIP(request);
  const rl = rateLimit(`missions:detail:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await params;

  if (!slug || !SLUG_REGEX.test(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id, title, slug, description, difficulty, project_type, project_brief, learning_outcomes, estimated_hours, max_xp, is_free, cover_emoji, step_count, created_at")
    .eq("slug", slug)
    .single();

  if (missionError || !mission) {
    return Response.json({ error: "Mission not found" }, { status: 404 });
  }

  const { data: steps, error: stepsError } = await supabase
    .from("mission_steps")
    .select("id, mission_id, step_number, title, description, step_type, course_slug, lesson_slug, instructions, xp_reward, estimated_minutes")
    .eq("mission_id", mission.id)
    .order("step_number", { ascending: true });

  if (stepsError) {
    console.error("Mission steps fetch error:", stepsError.message);
    return Response.json({ error: "Failed to fetch mission steps" }, { status: 500 });
  }

  return Response.json({ mission, steps: steps ?? [] });
}
