import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
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

  const rl = rateLimit(user.id, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return Response.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Portal session error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Portal session failed" }, { status: 500 });
  }
}
