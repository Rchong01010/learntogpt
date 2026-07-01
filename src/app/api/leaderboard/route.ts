import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { maskDisplayName } from "@/lib/leaderboard-privacy";

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(user.id, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data, error } = await supabase
    .from("v_leaderboard")
    .select("display_name, avatar_url, total_xp, level, current_streak")
    .order("total_xp", { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }

  const leaderboard = (data ?? []).map((row, index) => ({
    rank: index + 1,
    display_name: maskDisplayName(row.display_name || ""),
    avatar_url: row.avatar_url,
    total_xp: row.total_xp,
    level: row.level,
    current_streak: row.current_streak,
  }));

  return Response.json({ leaderboard });
}
