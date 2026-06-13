import { redirect } from "@/i18n/routing";

// Masterclass decommissioned (2026-06-12): the $250 masterclass was cancelled.
// The route is preserved so old inbound links (search results, scrapers,
// in-the-wild URLs) don't 404 — we redirect to the curriculum page instead.
// Mirrors the /pricing decommission pattern. Reverting this file restores the
// prior masterclass landing page in one diff (git log has the original).

export const dynamic = "force-dynamic";

export default async function MasterclassPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/curriculum", locale });
}
