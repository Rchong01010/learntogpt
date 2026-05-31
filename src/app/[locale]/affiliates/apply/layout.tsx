import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program — Apply | Learn to GPT",
  description:
    "Join the Learn to GPT affiliate program. Earn 30% recurring commission for life by referring your audience to Learn to GPT. Apply in minutes.",
  openGraph: {
    title: "Affiliate Program — Apply | Learn to GPT",
    description:
      "Earn 30% recurring commission for life. Share Learn to GPT with your audience and get paid monthly.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com"}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Learn to GPT Affiliate Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliate Program — Apply | Learn to GPT",
    description:
      "Earn 30% recurring commission for life. Share Learn to GPT with your audience.",
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com"}/og-default.png`,
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AffiliateApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
