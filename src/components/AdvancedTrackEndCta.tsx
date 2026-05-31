import { getTranslations } from 'next-intl/server';
import { BookOpen, Calendar } from 'lucide-react';

// ---------------------------------------------------------------------------
// AdvancedTrackEndCta
//
// Two-tier upsell after advanced courses:
// 1. $250 Masterclass — self-serve Stripe checkout
// 2. 1:1 with Reid — calendar booking, no price shown
// ---------------------------------------------------------------------------

export async function AdvancedTrackEndCta() {
  const t = await getTranslations('lessons.advancedCta');

  return (
    <div className="card-f-static overflow-hidden">
      <div className="h-2 w-full bg-orange" />
      <div className="space-y-6 p-6">
        <h3 className="text-center text-xl font-extrabold text-ink">{t('heading')}</h3>

        {/* Masterclass — $250 */}
        <div className="rounded-xl border-2 border-ink bg-cream p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-bold text-ink">{t('masterclassTitle')}</h4>
            <span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-cream">$250</span>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            {t('masterclassBody')}
          </p>
          <a
            href="/api/checkout/masterclass"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
          >
            <BookOpen className="size-4" />
            {t('masterclassButton')}
          </a>
        </div>

        {/* 1:1 with Reid — no price shown */}
        <div className="rounded-xl border border-ink/20 bg-linen p-5">
          <h4 className="mb-2 text-lg font-bold text-ink">{t('setupTitle')}</h4>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            {t('setupBody')}
          </p>
          <a
            href="https://calendar.app.google/E3dpDQ73QazDzYgE6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-white"
          >
            <Calendar className="size-4" />
            {t('setupButton')}
          </a>
        </div>
      </div>
    </div>
  );
}
