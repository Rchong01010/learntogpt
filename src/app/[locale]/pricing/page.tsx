import type { Metadata } from "next";
import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

// Wave 2 (GTM bible v2.0 §3): pricing tier removed. The route is preserved
// so old inbound links (search results, scrapers, in-the-wild URLs) don't
// 404 — we redirect to the curriculum page where every course is now free.
//
// The static Stripe + checkout wiring stays dormant in the rest of the
// codebase; reverting this file restores the prior pricing UI in one diff.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/curriculum", locale });
}
