import { getTranslations } from "next-intl/server";
import { getTodayTip, getTomorrowTip, getRecentTips, type DailyTip } from "@/lib/daily-tips";
import { Lightbulb } from "lucide-react";

const categoryColors: Record<DailyTip["category"], string> = {
  prompting: "bg-orange/10 text-orange border-orange/30",
  workflow: "bg-teal/10 text-teal border-teal/30",
  feature: "bg-game-blue/10 text-game-blue border-game-blue/30",
  mindset: "bg-purple-100 text-purple-700 border-purple-300",
};

export default async function TipsPage() {
  const t = await getTranslations("tips");
  const todayTip = getTodayTip();
  const tomorrowTip = getTomorrowTip();
  // Get last 7 days of tips (today + 6 previous days)
  const recentTips = getRecentTips(7);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Lightbulb className="size-6 text-orange" />
          {t("tipOfTheDay")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("tipsPageSubtitle")}
        </p>
      </div>

      {/* Today's tip — featured */}
      <div className="card-f-static overflow-hidden">
        <div className="flex items-center gap-2 border-b-[2px] border-ink/10 bg-cream/30 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange">
            {t("tipToday")}
          </span>
        </div>
        <div className="p-6">
          <div className="mb-3">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryColors[todayTip.category]}`}
            >
              {t(`tipCategory_${todayTip.category}`)}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-ink">{todayTip.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {todayTip.body}
          </p>
          {todayTip.proTip && (
            <div className="mt-4 rounded-[10px] border-[2px] border-ink/10 bg-cream/50 px-4 py-3">
              <p className="text-xs leading-relaxed text-ink">
                <span className="font-bold text-orange">{t("tipProTip")}:</span>{" "}
                {todayTip.proTip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tomorrow preview */}
      <div className="card-f-static p-5">
        <p className="text-xs font-semibold text-text-secondary">
          {t("tipTomorrow")}
        </p>
        <p className="mt-1 font-bold text-ink">{tomorrowTip.title}</p>
        <span
          className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryColors[tomorrowTip.category]}`}
        >
          {t(`tipCategory_${tomorrowTip.category}`)}
        </span>
      </div>

      {/* Recent tips archive */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-ink">{t("tipArchive")}</h2>
        <div className="space-y-3">
          {recentTips.slice(1).map((tip, index) => (
            <div
              key={`${tip.id}-${index}`}
              className="card-f-static p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${categoryColors[tip.category]}`}
                    >
                      {t(`tipCategory_${tip.category}`)}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {index + 1} {index === 0 ? t("tipDayAgo") : t("tipDaysAgo")}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-ink">{tip.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    {tip.body}
                  </p>
                  {tip.proTip && (
                    <p className="mt-2 text-[11px] text-ink">
                      <span className="font-bold text-orange">{t("tipProTip")}:</span>{" "}
                      {tip.proTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
