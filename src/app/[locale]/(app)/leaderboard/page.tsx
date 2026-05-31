import type { LeaderboardEntry } from "@/types";
import { getLevelFromXP } from "@/types";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { Flame, Trophy, Globe, MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";
import { Link } from "@/i18n/routing";

const rankEmoji: Record<number, string> = {
  1: "\ud83e\udd47",
  2: "\ud83e\udd48",
  3: "\ud83e\udd49",
};

/** Mask email addresses on the leaderboard for privacy. "javier@gmail.com" → "jav***" */
function maskDisplayName(name: string): string {
  if (!name.includes("@")) return name;
  const local = name.split("@")[0];
  if (local.length <= 2) return local[0] + "***";
  return local.slice(0, 3) + "***";
}

// ── Seed entries for empty locales ────────────────────────────

interface PlaceholderEntry extends LeaderboardEntry {
  isPlaceholder: true;
}

const SEED_NAMES: Record<string, string[]> = {
  en: ["Swift Learner", "Prompt Pro", "GPT Rookie", "AI Starter", "Code Curious"],
  es: ["Estudiante Veloz", "Explorador AI", "Aprendiz Audaz", "Alumno Estrella", "Genio Novato"],
  fr: ["Esprit Rapide", "Apprenti Malin", "GPT Curieux", "Cerveau Agile", "Futur Expert"],
  de: ["Schneller Lerner", "KI-Entdecker", "Prompt Profi", "Wissens-Held", "Neugier-Nerd"],
  ja: ["\u901f\u7fd2\u8005", "AI\u63a2\u691c\u5bb6", "\u30d7\u30ed\u30f3\u30d7\u30c8\u540d\u4eba", "\u5b66\u3073\u306e\u9054\u4eba", "\u30af\u30ed\u30fc\u30c9\u65b0\u4eba"],
  ko: ["\ubbff\uc74c\uc758 \ud559\uc2b5\uc790", "AI \ud0d0\ud5d8\uac00", "\ud504\ub86c\ud504\ud2b8 \uace0\uc218", "\uc2e0\uc785 \ud559\uc2b5\uc790", "\ud638\uae30\uc2ec \ud559\uc0dd"],
  "zh-CN": ["\u5feb\u901f\u5b66\u4e60\u8005", "AI\u63a2\u7d22\u5bb6", "\u63d0\u793a\u8fbe\u4eba", "\u65b0\u624b\u5c0f\u5c06", "\u597d\u5947\u5b66\u751f"],
};

const SEED_XP = [175, 140, 105, 80, 55];

function getSeedEntries(locale: string): PlaceholderEntry[] {
  const names = SEED_NAMES[locale] ?? SEED_NAMES.en;
  return names.map((name, i) => ({
    rank: i + 1,
    user_id: `placeholder-${locale}-${i}`,
    display_name: name,
    avatar_url: null,
    total_xp: SEED_XP[i],
    level: getLevelFromXP(SEED_XP[i]),
    current_streak: 0,
    isPlaceholder: true as const,
  }));
}

function isPlaceholder(entry: LeaderboardEntry | PlaceholderEntry): entry is PlaceholderEntry {
  return "isPlaceholder" in entry && (entry as PlaceholderEntry).isPlaceholder === true;
}

// ── Page ───────────────────────────────────────────────────

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const t = await getTranslations("leaderboard");
  const locale = await getLocale();
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab === "global" ? "global" : "local";

  // ── Fetch locale-scoped entries ──
  // Note: preferred_locale is never written by app code (always defaults to
  // 'en'), so filtering by it would show nothing for non-EN locales. Use the
  // same global query for both tabs until locale preference is implemented.
  let localeQuery = supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url, total_xp, level, current_streak")
    .order("total_xp", { ascending: false })
    .limit(50);

  // ── Fetch global entries ──
  let globalQuery = supabase
    .from("user_profiles")
    .select("user_id, display_name, avatar_url, total_xp, level, current_streak")
    .order("total_xp", { ascending: false })
    .limit(50);

  const [localeResult, globalResult] = await Promise.all([
    localeQuery,
    globalQuery,
  ]);

  const localeData = localeResult.data ?? [];
  const globalData = globalResult.data ?? [];

  // Build ranked entries for locale tab
  let localeEntries: (LeaderboardEntry | PlaceholderEntry)[] = localeData.map((row, index) => ({
    rank: index + 1,
    user_id: row.user_id,
    display_name: maskDisplayName(row.display_name || "") || t("anonymous"),
    avatar_url: row.avatar_url,
    total_xp: row.total_xp ?? 0,
    level: row.level ?? getLevelFromXP(row.total_xp ?? 0),
    current_streak: row.current_streak ?? 0,
  }));

  // Pad with seed entries if locale has fewer than 5 real users
  if (localeEntries.length < 5) {
    const seeds = getSeedEntries(locale);
    // Only add enough seeds to reach 5 total, and rank them after real entries
    const needed = 5 - localeEntries.length;
    const startRank = localeEntries.length + 1;
    const padding = seeds.slice(0, needed).map((seed, i) => ({
      ...seed,
      rank: startRank + i,
    }));
    localeEntries = [...localeEntries, ...padding];
  }

  // Build ranked entries for global tab
  const globalEntries: LeaderboardEntry[] = globalData.map((row, index) => ({
    rank: index + 1,
    user_id: row.user_id,
    display_name: maskDisplayName(row.display_name || "") || t("anonymous"),
    avatar_url: row.avatar_url,
    total_xp: row.total_xp ?? 0,
    level: row.level ?? getLevelFromXP(row.total_xp ?? 0),
    current_streak: row.current_streak ?? 0,
  }));

  const currentUserId = user?.id ?? null;
  const entries = tab === "global" ? globalEntries : localeEntries;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          <Trophy className="size-6 text-gold" />
          {t("heading")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("subheading")}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Link
          href="?tab=local"
          className={cn(
            "flex items-center gap-1.5 rounded-full border-[2px] border-ink px-4 py-1.5 text-sm font-bold transition-colors",
            tab === "local"
              ? "bg-orange text-white"
              : "bg-cream text-ink hover:bg-orange/10"
          )}
        >
          <MapPin className="size-3.5" />
          {t("tabLocal")}
        </Link>
        <Link
          href="?tab=global"
          className={cn(
            "flex items-center gap-1.5 rounded-full border-[2px] border-ink px-4 py-1.5 text-sm font-bold transition-colors",
            tab === "global"
              ? "bg-orange text-white"
              : "bg-cream text-ink hover:bg-orange/10"
          )}
        >
          <Globe className="size-3.5" />
          {t("tabGlobal")}
        </Link>
      </div>

      <div className="card-f-static overflow-hidden">
        {/* Header row */}
        <div className="border-b-[3px] border-ink px-5 py-3">
          <div className="grid grid-cols-[2.5rem_1fr_5rem_3.5rem_3.5rem] items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary sm:grid-cols-[2.5rem_1fr_5rem_4rem_4rem]">
            <span>{t("colRank")}</span>
            <span>{t("colPlayer")}</span>
            <span className="text-right">{t("colXp")}</span>
            <span className="text-center">{t("colLevel")}</span>
            <span className="text-right">{t("colStreak")}</span>
          </div>
        </div>

        {/* Rows */}
        {entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-secondary">
            {t("emptyState")}
          </div>
        ) : (
          <div className="divide-y-[2px] divide-ink/10">
            {entries.map((entry) => {
              const isCurrentUser = currentUserId !== null && entry.user_id === currentUserId;
              const isPodium = entry.rank <= 3;
              const placeholder = isPlaceholder(entry);

              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "grid grid-cols-[2.5rem_1fr_5rem_3.5rem_3.5rem] items-center gap-2 px-5 py-3 transition-colors sm:grid-cols-[2.5rem_1fr_5rem_4rem_4rem]",
                    isCurrentUser && "bg-orange/5 ring-2 ring-inset ring-orange/20",
                    isPodium && !isCurrentUser && !placeholder && "bg-gold/5",
                    placeholder && "opacity-50",
                  )}
                >
                  {/* Rank */}
                  <span className={cn(
                    "text-sm font-extrabold tabular-nums",
                    placeholder
                      ? "text-text-secondary/50"
                      : entry.rank === 1 ? "text-gold" : entry.rank <= 3 ? "text-walnut" : "text-text-secondary"
                  )}>
                    {placeholder ? entry.rank : (rankEmoji[entry.rank] ?? entry.rank)}
                  </span>

                  {/* Player */}
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-[2px] font-bold text-xs",
                      placeholder
                        ? "border-ink/30 bg-cream text-ink/40"
                        : "border-ink bg-gold text-ink"
                    )}>
                      {entry.display_name[0]}
                    </div>
                    <span className={cn(
                      "truncate text-sm font-semibold",
                      isCurrentUser ? "text-orange" : placeholder ? "text-ink/50 italic" : "text-ink"
                    )}>
                      {entry.display_name}
                      {isCurrentUser && <span className="ml-1 text-xs text-text-secondary">{t("youLabel")}</span>}
                    </span>
                  </div>

                  {/* XP */}
                  <span className={cn(
                    "mono-f text-right text-sm font-bold tabular-nums",
                    placeholder ? "text-ink/40" : "text-ink"
                  )}>
                    {entry.total_xp.toLocaleString()}
                  </span>

                  {/* Level */}
                  <div className="flex justify-center">
                    <LevelBadge level={entry.level} size="sm" />
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-end gap-1 text-sm tabular-nums text-text-secondary">
                    {entry.current_streak > 0 && <Flame className="size-3 text-orange" />}
                    <span className="mono-f font-semibold">{entry.current_streak}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
