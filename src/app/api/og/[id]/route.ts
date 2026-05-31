import { ImageResponse } from "next/og";
import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import React from "react";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const shareTypeLabels: Record<string, string> = {
  course_complete: "Course Completed",
  track_complete: "Track Completed",
  badge_unlock: "Achievement Unlocked",
  level_up: "Level Up",
  streak_milestone: "Learning Streak",
};

const h = React.createElement;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rate limit: OG image generation is expensive (satori + wasm). Cap per-IP
  // to prevent attackers looping valid share UUIDs to burn CPU/quotas.
  const ip = getClientIP(request);
  const rl = rateLimit(`og:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return new Response("Invalid ID", { status: 400 });
  }

  const supabase = await createSupabaseServer();

  const { data: share } = await supabase
    .from("shares")
    .select("id, share_type, title, description")
    .eq("id", id)
    .single();

  if (!share) {
    return new Response("Not found", { status: 404 });
  }

  const label = shareTypeLabels[share.share_type] ?? "Achievement";

  try {
    const element = h(
      "div",
      {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "space-between",
          padding: "60px",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "sans-serif",
        },
      },
      // Top: sparkle + badge
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
          },
        },
        h("span", { style: { fontSize: "40px" } }, "\u2728"),
        h(
          "span",
          {
            style: {
              color: "#e07a3a",
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "2px",
            },
          },
          label,
        ),
      ),
      // Center: title + description
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "16px",
          },
        },
        h(
          "div",
          {
            style: {
              color: "#ffffff",
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: "900px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
          share.title,
        ),
        share.description
          ? h(
              "div",
              {
                style: {
                  color: "#a0aec0",
                  fontSize: "26px",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  maxWidth: "800px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              },
              share.description,
            )
          : null,
      ),
      // Bottom: branding
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
          },
          h("span", { style: { fontSize: "28px" } }, "\ud83d\udcda"),
          h(
            "span",
            {
              style: {
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 700,
              },
            },
            "Learn to GPT",
          ),
        ),
        h(
          "span",
          {
            style: {
              color: "#4a5568",
              fontSize: "18px",
              fontWeight: 400,
            },
          },
          "learntogpt.com",
        ),
      ),
    );

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
    });
  } catch (e) {
    console.error("OG image generation failed:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
