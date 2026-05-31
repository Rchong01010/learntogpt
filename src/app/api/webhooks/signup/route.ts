import { Resend } from "resend";
import { timingSafeEqual } from "crypto";
import { escapeHtml } from "@/lib/escape-html";
import { pingSignupSlack } from "@/lib/slack-signups";

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || (() => {
  console.warn("[signup-webhook] NOTIFY_EMAIL not set — using fallback reid@getateam.ai");
  return "reid@getateam.ai";
})();

/**
 * Supabase Database Webhook handler — fires on user_profiles INSERT.
 * Sends Reid an email notification for every new signup.
 */
export async function POST(request: Request) {
  // Verify webhook secret with timing-safe comparison
  const secret = request.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || !secret || secret.length !== WEBHOOK_SECRET.length ||
      !timingSafeEqual(Buffer.from(secret), Buffer.from(WEBHOOK_SECRET))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  let body: {
    type?: string;
    record?: {
      user_id?: string;
      display_name?: string;
      email?: string;
      created_at?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const record = body.record;
  if (!record) {
    return Response.json({ error: "No record" }, { status: 400 });
  }

  const displayName = escapeHtml(record.display_name || "Unknown");
  const createdAt = record.created_at
    ? new Date(record.created_at).toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "short",
        timeStyle: "short",
      })
    : "just now";

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: "Learn to GPT <notifications@learntogpt.com>",
      to: NOTIFY_EMAIL,
      subject: `New signup: ${displayName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px;">
          <h2 style="color: #e07a3a; margin-bottom: 8px;">New Learn to GPT Signup</h2>
          <p><strong>Name:</strong> ${displayName}</p>
          <p><strong>Time:</strong> ${createdAt}</p>
          <hr style="border: 1px solid #e5e0d8; margin: 16px 0;" />
          <p style="color: #78716c; font-size: 13px;">
            <a href="https://supabase.com/dashboard/project/mazngjrfjvjxsufjrscv/auth/users" style="color: #e07a3a;">View all users in Supabase</a>
          </p>
        </div>
      `,
    });

    // Free-signup #signups Slack ping (best-effort, never throws).
    await pingSignupSlack({
      tag: "Academy",
      title: "free signup",
      emoji: ":wave:",
      fields: [
        ["Email", record.email],
        ["Name", record.display_name],
        ["Time", createdAt],
      ],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Signup notification error:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
