"use client";

import { useState, useEffect } from "react";
import { getTodayTip, getTomorrowTip, type DailyTip } from "@/lib/daily-tips";
import { Lightbulb, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const categoryColors: Record<DailyTip["category"], string> = {
  prompting: "bg-orange/10 text-orange border-orange/30",
  workflow: "bg-teal/10 text-teal border-teal/30",
  feature: "bg-game-blue/10 text-game-blue border-game-blue/30",
  mindset: "bg-purple-100 text-purple-700 border-purple-300",
};

export function TipOfTheDay() {
  const t = useTranslations("tips");
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [tomorrow, setTomorrow] = useState<DailyTip | null>(null);

  useEffect(() => {
    setTip(getTodayTip());
    setTomorrow(getTomorrowTip());
  }, []);

  if (!tip || !tomorrow) return null;
  const categoryKey = `tipCategory_${tip.category}` as const;
  const tomorrowCategoryKey = `tipCategory_${tomorrow.category}` as const;

  return (
    <div className="card-f-static overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b-[2px] border-ink/10 px-5 py-3">
        <Lightbulb className="size-4 text-orange" />
        <h3 className="text-sm font-bold text-ink">{t("tipOfTheDay")}</h3>
      </div>

      {/* Tip content */}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryColors[tip.category]}`}
          >
            {t(categoryKey)}
          </span>
        </div>

        <h4 className="text-base font-extrabold text-ink">{tip.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {tip.body}
        </p>

        {tip.proTip && (
          <div className="mt-3 rounded-[10px] border-[2px] border-ink/10 bg-cream/50 px-3.5 py-2.5">
            <p className="text-xs leading-relaxed text-ink">
              <span className="font-bold text-orange">{t("tipProTip")}:</span>{" "}
              {tip.proTip}
            </p>
          </div>
        )}

        {/* Tomorrow teaser */}
        <Link
          href="/tips"
          className="group mt-4 flex items-center gap-2 text-xs text-text-secondary transition-colors hover:text-ink"
        >
          <span className="font-semibold">{t("tipTomorrow")}:</span>
          <span className="italic">{tomorrow.title}</span>
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
