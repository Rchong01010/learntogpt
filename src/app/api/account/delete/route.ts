import { NextRequest } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";

import { getStripe } from "@/lib/stripe";
import { validateOrigin } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

  const rl = rateLimit(user.id, { limit: 1, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // M5: Require explicit confirmation in request body
  let body: { confirm?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.confirm !== "DELETE") {
    return Response.json(
      { error: "Confirmation required. Send { confirm: \"DELETE\" } to proceed." },
      { status: 400 },
    );
  }

  try {
    const admin = await createSupabaseAdmin();

    // M4: Cancel active Stripe subscription before deleting data
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", user.id)
      .single();

    if (subscription?.stripe_subscription_id && subscription.status === "active") {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (stripeErr) {
        console.error(
          "Failed to cancel Stripe subscription:",
          stripeErr instanceof Error ? stripeErr.message : stripeErr,
        );
        // Continue with deletion even if Stripe cancel fails —
        // the webhook will handle cleanup, and we don't want to
        // trap a user in an undeletable state.
      }
    }

    // Delete user data from all related tables
    const tables = [
      "user_progress",
      "user_achievements",
      "user_streaks",
      "user_profiles",
      "subscriptions",
    ];

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq("user_id", user.id);
      if (error) {
        console.error("Failed to delete from %s: %s", table, error.message);
      }
    }

    // Delete the auth user
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError.message);
      return Response.json(
        { error: "Failed to delete account" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(
      "Account deletion error:",
      err instanceof Error ? err.message : err
    );
    return Response.json(
      { error: "Account deletion failed" },
      { status: 500 }
    );
  }
}
