import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { MISSIONS_ENABLED } from "@/lib/config";

const DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced", "expert"];

export async function GET(request: Request) {
  // Missions are Claude-branded and not platform-scoped — disabled on LearnToGPT.
  if (!MISSIONS_ENABLED) {
    return Response.json({ missions: [] });
  }

  const ip = getClientIP(request);
  const rl = rateLimit(`missions:list:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createSupabaseServer();

  const { data: missions, error } = await supabase
    .from("missions")
    .select("id, title, slug, description, difficulty, project_type, project_brief, learning_outcomes, estimated_hours, max_xp, is_free, cover_emoji, step_count, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Missions fetch error:", error.message);
    return Response.json({ error: "Failed to fetch missions" }, { status: 500 });
  }

  // Sort by difficulty order since Supabase can't sort by custom enum order
  const sorted = (missions ?? []).sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty)
  );

  return Response.json({ missions: sorted });
}
