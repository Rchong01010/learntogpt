import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { createSupabaseServer } from "@/lib/supabase-server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  params: Promise<{ type: string; id: string }>;
};

async function getShare(id: string) {
  if (!UUID_REGEX.test(id)) return null;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("shares")
    .select("id, share_type, title, description, created_at")
    .eq("id", id)
    .single();
  return data;
}

const shareTypeLabel: Record<string, string> = {
  course_complete: "Course Completed",
  track_complete: "Track Completed",
  badge_unlock: "Achievement Unlocked",
  level_up: "Level Up",
  streak_milestone: "Learning Streak",
};

const shareTypeEmoji: Record<string, string> = {
  course_complete: "\ud83c\udf93",
  track_complete: "\ud83c\udfc6",
  badge_unlock: "\ud83c\udfc6",
  level_up: "\u2b50",
  streak_milestone: "\ud83d\udd25",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id);

  if (!share) {
    return { title: "Share Not Found | Learn to GPT" };
  }

  const description =
    share.description || "Master ChatGPT with interactive lessons";

  return {
    title: share.title + " | Learn to GPT",
    description,
    openGraph: {
      title: share.title,
      description,
      images: [`${APP_URL}/api/og/${share.id}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description,
      images: [`${APP_URL}/api/og/${share.id}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const share = await getShare(id);

  if (!share) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold text-white">
            Share Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            This share link may have expired or been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#e07a3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c96a2f]"
          >
            Go to Learn to GPT
          </Link>
        </div>
      </div>
    );
  }

  const label = shareTypeLabel[share.share_type] ?? "Achievement";
  const emoji = shareTypeEmoji[share.share_type] ?? "\u2728";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2d3748] bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-[#e07a3a]">
          <span>{emoji}</span>
          <span>{label}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {share.title}
        </h1>

        {/* Description */}
        {share.description && (
          <p className="text-base leading-relaxed text-gray-400">
            {share.description}
          </p>
        )}

        {/* Divider */}
        <div className="mx-auto h-px w-24 bg-[#2d3748]" />

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Learn to master ChatGPT with interactive, gamified lessons.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#e07a3a] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#c96a2f]"
          >
            Join Learn to GPT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Branding */}
        <p className="pt-4 text-xs text-gray-600">learntogpt.com</p>
      </div>
    </div>
  );
}
