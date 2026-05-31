import { requireUser, getUserSubscription } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getLocale } from "next-intl/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServer();

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, created_at")
    .eq("user_id", user.id)
    .single();

  // Fetch subscription status
  const { status: subscriptionStatus } = await getUserSubscription();

  const locale = await getLocale();
  const displayName = profile?.display_name || user.email?.split("@")[0] || "";
  const email = user.email || "";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" })
    : new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });

  return (
    <SettingsClient
      initialDisplayName={displayName}
      email={email}
      subscription={subscriptionStatus}
      memberSince={memberSince}
    />
  );
}
