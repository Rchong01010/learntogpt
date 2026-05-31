import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

// reference_id can be a course slug, achievement name, or level number
const SAFE_REF_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;

const VALID_SHARE_TYPES = new Set([
  "course_complete",
  "track_complete",
  "badge_unlock",
  "level_up",
  "streak_milestone",
]);

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

  // Rate limit: 10 share generations per minute per user
  const rl = rateLimit(user.id, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    share_type?: string;
    reference_id?: string;
    title?: string;
    description?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { share_type, reference_id, title, description } = body;

  // Input validation
  if (!share_type || !reference_id || !title) {
    return Response.json(
      { error: "Missing required fields: share_type, reference_id, title" },
      { status: 400 },
    );
  }

  if (!VALID_SHARE_TYPES.has(share_type)) {
    return Response.json({ error: "Invalid share_type" }, { status: 400 });
  }

  if (!SAFE_REF_REGEX.test(reference_id)) {
    return Response.json({ error: "Invalid reference_id" }, { status: 400 });
  }

  if (title.length > 200) {
    return Response.json(
      { error: "Title must be 200 characters or fewer" },
      { status: 400 },
    );
  }

  if (description && description.length > 500) {
    return Response.json(
      { error: "Description must be 500 characters or fewer" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("shares")
    .insert({
      user_id: user.id,
      share_type,
      reference_id,
      title,
      description: description ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Share insert error:", error.message);
    return Response.json({ error: "Failed to create share" }, { status: 500 });
  }

  const share_url = `${APP_URL}/share/${share_type}/${data.id}`;

  return Response.json({ id: data.id, share_url });
}
