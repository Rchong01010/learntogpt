import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getLevelFromXP } from "@/types";
import { AppShell } from "./app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  let userData = {
    displayName: "Guest",
    avatarUrl: null as string | null,
    xp: 0,
    streak: 0,
    level: 1,
  };

  if (user) {
    const supabase = await createSupabaseServer();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name, avatar_url, total_xp, current_streak, level")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      userData = {
        displayName: profile.display_name || user.email?.split("@")[0] || "Learner",
        avatarUrl: profile.avatar_url,
        xp: profile.total_xp ?? 0,
        streak: profile.current_streak ?? 0,
        level: profile.level ?? getLevelFromXP(profile.total_xp ?? 0),
      };
    } else {
      userData.displayName = user.email?.split("@")[0] || "Learner";
    }
  }

  return <AppShell userData={userData}>{children}</AppShell>;
}
