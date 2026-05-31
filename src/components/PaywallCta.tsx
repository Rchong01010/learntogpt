"use client";

import { Lock, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

// ---------------------------------------------------------------------------
// PaywallCta
//
// Shown when a user has completed 2 free courses and tries to access a third.
// No pricing shown here — price appears only at Stripe checkout.
// CTA links to /api/checkout/unlock which uses STRIPE_UNLOCK_PRICE_ID.
// ---------------------------------------------------------------------------

export function PaywallCta({ completedCount }: { completedCount: number }) {
  const t = useTranslations('paywall');

  return (
    <div className="mx-auto max-w-lg">
      <div className="card-f-static overflow-hidden">
        {/* Orange accent bar — matches design language */}
        <div className="h-2 w-full bg-orange" />

        <div className="space-y-6 p-8 text-center">
          {/* Lock icon */}
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full border-3 border-ink bg-orange text-white shadow-[4px_4px_0px_#1c1917]">
              <Lock className="size-8" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-ink">
              {t('heading', { count: completedCount })}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t('subheading')}
            </p>
          </div>

          {/* What you get */}
          <ul className="space-y-2 text-left text-sm font-semibold text-ink">
            <li className="flex items-center gap-2">
              <Zap className="size-4 shrink-0 text-orange" />
              {t('feature1')}
            </li>
            <li className="flex items-center gap-2">
              <Zap className="size-4 shrink-0 text-orange" />
              {t('feature2')}
            </li>
            <li className="flex items-center gap-2">
              <Zap className="size-4 shrink-0 text-orange" />
              {t('feature3')}
            </li>
          </ul>

          {/* CTA — no price displayed here */}
          <a
            href="/api/checkout/unlock"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-6 py-3.5 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
          >
            <Lock className="size-5" />
            {t('cta')}
          </a>

          <p className="text-xs text-muted-foreground">
            {t('dismiss')}
          </p>
        </div>
      </div>
    </div>
  );
}
