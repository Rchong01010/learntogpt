import { getLocale } from "next-intl/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import { scaledXp, isScaledXpEnabled } from "@/lib/gamification";
import { getLevelFromXP } from "@/types";
import { PLATFORM } from "@/lib/config";

// ---------------------------------------------------------------------------
// /api/projects/submit
//
// One-shot project submission for the Track 5 project shell. Inserts a row
// into project_submissions, awards XP on first submission, updates
// user_profiles.total_xp + level.
//
// XP scaling: mirrors the /api/progress convention. When USE_SCALED_XP=true,
// XP = scaledXp(estimated_minutes). Otherwise we trust the DB xp_reward on
// the courses row. If neither is available (shouldn't happen in practice),
// we fall back to DEFAULT_PROJECT_XP.
//
// Repeat submissions (same user, same project) are idempotent: we update the
// submission row but do NOT re-award XP.
// ---------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,127}$/i;
const URL_REGEX = /^https?:\/\//i;
const MAX_DESCRIPTION_LEN = 500;
const DEFAULT_PROJECT_XP = 500;

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tight rate limit — submission is a rare user action.
  const rl = rateLimit(`projects-submit:${user.id}`, {
    limit: 10,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    project_slug?: string;
    submission_url?: string;
    submission_description?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const projectSlug = body.project_slug;
  const rawUrl = body.submission_url;
  const rawDescription = body.submission_description;

  if (!projectSlug || typeof projectSlug !== "string" || !SLUG_REGEX.test(projectSlug)) {
    return Response.json({ error: "Invalid project_slug" }, { status: 400 });
  }

  if (!rawUrl || typeof rawUrl !== "string") {
    return Response.json({ error: "Missing submission_url" }, { status: 400 });
  }

  const submissionUrl = rawUrl.trim();
  if (!URL_REGEX.test(submissionUrl)) {
    return Response.json(
      { error: "submission_url must start with http:// or https://" },
      { status: 400 },
    );
  }
  // Full URL parse to catch malformed values (e.g. "http:///").
  try {
    const parsed = new URL(submissionUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("protocol");
    }
  } catch {
    return Response.json({ error: "Invalid submission_url" }, { status: 400 });
  }
  if (submissionUrl.length > 2000) {
    return Response.json({ error: "submission_url too long" }, { status: 400 });
  }

  // Sanitize description: trim, cap at 500 chars, strip control chars.
  let submissionDescription: string | null = null;
  if (typeof rawDescription === "string") {
    const cleaned = rawDescription
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim()
      .slice(0, MAX_DESCRIPTION_LEN);
    submissionDescription = cleaned.length > 0 ? cleaned : null;
  }

  // Resolve project_slug → course id, and pull xp_reward / estimated_minutes
  // for XP scaling.
  const locale = await getLocale();
  const { data: course } = await supabase
    .from("courses")
    .select("id, xp_reward, estimated_minutes, is_free, content_type")
    .eq("slug", projectSlug)
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .maybeSingle();

  if (!course) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Wave 2 (GTM bible v2.0 §3): Pro paywall is OFF — every project is
  // accessible to any signed-in user. The `is_free` column on courses is
  // intentionally left in the schema in case the gate is reintroduced.

  const projectId = course.id as string;
  const admin = await createSupabaseAdmin();

  // Check for an existing submission so we don't re-award XP on repeat ships.
  const { data: existing } = await admin
    .from("project_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing) {
    // Update in place — no XP award.
    const { error: updateError } = await admin
      .from("project_submissions")
      .update({
        submission_url: submissionUrl,
        submission_description: submissionDescription,
        submitted_at: now,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Project submission update error:", updateError.message);
      return Response.json(
        { error: "Failed to update submission" },
        { status: 500 },
      );
    }

    return Response.json({ success: true, xp_earned: 0, already_submitted: true });
  }

  // First submission — insert row.
  const { error: insertError } = await admin
    .from("project_submissions")
    .insert({
      user_id: user.id,
      project_id: projectId,
      submission_url: submissionUrl,
      submission_description: submissionDescription,
      is_public: true,
      submitted_at: now,
    });

  if (insertError) {
    console.error("Project submission insert error:", insertError.message);
    return Response.json({ error: "Failed to save submission" }, { status: 500 });
  }

  // ----- Compute XP award -------------------------------------------------
  const estimatedMinutes = (course.estimated_minutes as number | null) ?? 0;
  const dbXpReward = (course.xp_reward as number | null) ?? 0;
  let xpEarned: number;
  if (isScaledXpEnabled() && estimatedMinutes > 0) {
    xpEarned = scaledXp(estimatedMinutes);
  } else if (dbXpReward > 0) {
    xpEarned = dbXpReward;
  } else {
    xpEarned = DEFAULT_PROJECT_XP;
  }

  // ----- Update user_profiles.total_xp + level ----------------------------
  try {
    const { data: profile } = await admin
      .from("user_profiles")
      .select("total_xp")
      .eq("user_id", user.id)
      .maybeSingle();

    const newTotalXp = (profile?.total_xp ?? 0) + xpEarned;
    const newLevel = getLevelFromXP(newTotalXp);

    if (profile) {
      await admin
        .from("user_profiles")
        .update({ total_xp: newTotalXp, level: newLevel })
        .eq("user_id", user.id);
    } else {
      await admin.from("user_profiles").insert({
        user_id: user.id,
        total_xp: newTotalXp,
        level: newLevel,
      });
    }
  } catch (err) {
    // XP update failure is non-critical for submission success — the row is
    // saved. Log loudly rather than silently.
    console.error("Project XP update error (non-critical):", err);
  }

  return Response.json({ success: true, xp_earned: xpEarned });
}
