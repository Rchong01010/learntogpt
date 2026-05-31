import { getLocale } from "next-intl/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import { PLATFORM } from "@/lib/config";

// ---------------------------------------------------------------------------
// /api/projects/progress
//
// Step check-off persistence for the Track 5 project shell.
//
// NOTE ON FIELD NAMING: migration 016 stores the step identifier in a column
// named `step_slug` (stable string defined in the project seed JSON, e.g.
// 'install-claude-code'). For parity with the caller task description this
// route accepts EITHER `step_id` or `step_slug` in the request body — both
// map to the same column. The GET response uses `step_slug` to match the
// DB, and the client is coded against `step_slug`.
//
// Security posture:
//  - validateOrigin + authenticated user only.
//  - Rate-limit: 60 req/min per user (steps check-off fast, higher than /api/progress's 30).
//  - RLS on project_step_progress is per-user, but we still use the admin
//    client for writes to mirror the /api/progress pattern (consistent,
//    explicit server-side authority; avoids any JWT-propagation edge cases).
// ---------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,127}$/i;

async function resolveProjectId(
  projectSlug: string,
  locale: string,
): Promise<string | null> {
  // Anon server client is fine for the public courses read — RLS permits
  // authenticated reads of courses by design.
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", projectSlug)
    .eq("locale", locale)
    .eq("platform", PLATFORM)
    .maybeSingle();
  return data?.id ?? null;
}

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

  // Rate limit: 60 requests per minute per user
  const rl = rateLimit(`projects-progress:${user.id}`, {
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    project_slug?: string;
    step_id?: string;
    step_slug?: string;
    completed?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const projectSlug = body.project_slug;
  const stepSlug = body.step_slug ?? body.step_id;
  const completed = body.completed;

  if (!projectSlug || typeof projectSlug !== "string") {
    return Response.json({ error: "Missing project_slug" }, { status: 400 });
  }
  if (!stepSlug || typeof stepSlug !== "string") {
    return Response.json(
      { error: "Missing step_slug" },
      { status: 400 },
    );
  }
  if (typeof completed !== "boolean") {
    return Response.json(
      { error: "Missing completed (boolean)" },
      { status: 400 },
    );
  }
  if (!SLUG_REGEX.test(projectSlug) || !SLUG_REGEX.test(stepSlug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  const locale = await getLocale();
  const projectId = await resolveProjectId(projectSlug, locale);
  if (!projectId) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const admin = await createSupabaseAdmin();

  if (!completed) {
    const { error: delError } = await admin
      .from("project_step_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("step_slug", stepSlug);

    if (delError) {
      console.error("Project step delete error:", delError.message);
      return Response.json(
        { error: "Failed to update step progress" },
        { status: 500 },
      );
    }
    return Response.json({ success: true, completed_at: null });
  }

  const completedAt = new Date().toISOString();
  const { error: upsertError } = await admin
    .from("project_step_progress")
    .upsert(
      {
        user_id: user.id,
        project_id: projectId,
        step_slug: stepSlug,
        completed_at: completedAt,
      },
      { onConflict: "user_id,project_id,step_slug" },
    );

  if (upsertError) {
    console.error("Project step upsert error:", upsertError.message);
    return Response.json(
      { error: "Failed to save step progress" },
      { status: 500 },
    );
  }

  return Response.json({ success: true, completed_at: completedAt });
}

export async function GET(request: Request) {
  // No origin check on GET — it's read-only and auth-gated. Standard SameSite
  // cookie posture protects against CSRF for state-changing requests.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`projects-progress-get:${user.id}`, {
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const projectSlug = url.searchParams.get("project_slug");
  if (!projectSlug || !SLUG_REGEX.test(projectSlug)) {
    return Response.json({ error: "Invalid project_slug" }, { status: 400 });
  }

  const locale = await getLocale();
  const projectId = await resolveProjectId(projectSlug, locale);
  if (!projectId) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const admin = await createSupabaseAdmin();
  const { data, error } = await admin
    .from("project_step_progress")
    .select("step_slug, completed_at")
    .eq("user_id", user.id)
    .eq("project_id", projectId);

  if (error) {
    console.error("Project step fetch error:", error.message);
    return Response.json(
      { error: "Failed to load progress" },
      { status: 500 },
    );
  }

  // Also report whether a submission already exists so the client can render
  // the completion screen on reload.
  const { data: submission } = await admin
    .from("project_submissions")
    .select("submission_url, submission_description, submitted_at")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .maybeSingle();

  return Response.json({
    success: true,
    steps: data ?? [],
    submission: submission ?? null,
  });
}
