import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Sora, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {
      title: "Learn to GPT — Master ChatGPT from Day One",
      description:
        "The gamified learning platform for ChatGPT. Go from beginner to certified expert with interactive lessons, hands-on exercises, and real-world projects.",
    };
  }

  const t = await getTranslations({ locale, namespace: "landing" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION
        ? { google: process.env.GOOGLE_SITE_VERIFICATION }
        : {}),
      ...(process.env.BING_SITE_VERIFICATION
        ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
        : {}),
    },
    openGraph: {
      type: "website",
      siteName: "Learn to GPT",
      title: t("meta.title"),
      description: t("meta.description"),
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "Learn to GPT" }],
      locale: locale.replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
      images: [`${baseUrl}/og-default.png`],
    },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, pathForLocale(loc)])
      ),
    },
    other: {
      "citation_title": "Learn to GPT",
      "citation_author": "Learn to GPT",
      "citation_public_url": "https://learntogpt.com",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sora.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://mazngjrfjvjxsufjrscv.supabase.co" />
        <link rel="dns-prefetch" href="https://yaiuujiducipbdzdbzrl.supabase.co" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(function(){var K="sb_publishable_lKjfMY-OCLFk2f5cuCpGVA_p0Lm7vU8",U="https://yaiuujiducipbdzdbzrl.supabase.co/rest/v1/page_views",id=sessionStorage.getItem("pv_sid");if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem("pv_sid",id)}try{fetch(U,{method:"POST",keepalive:true,headers:{"apikey":K,"Authorization":"Bearer "+K,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({property:"learntogpt",path:location.pathname,session_id:id,referrer:document.referrer||null})})}catch(e){}},0);`,
          }}
        />
      </body>
    </html>
  );
}
