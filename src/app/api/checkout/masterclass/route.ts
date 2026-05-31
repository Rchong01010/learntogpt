import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

const MASTERCLASS_PRICE_ID = process.env.STRIPE_MASTERCLASS_PRICE_ID;

function getOrigin(): string {
  let origin = (process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com")
    .replace(/[\r\n\s]+/g, "")
    .replace(/\/+$/, "");
  if (!origin.startsWith("http")) {
    origin = `https://${origin}`;
  }
  return origin;
}

export async function GET(request: NextRequest) {
  if (!MASTERCLASS_PRICE_ID) {
    console.error("STRIPE_MASTERCLASS_PRICE_ID is not configured");
    return NextResponse.redirect(new URL("/curriculum?checkout=unavailable", request.url));
  }

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Parameters<typeof NextResponse.prototype.cookies.set>[2];
  }> = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  function redirectWithCookies(url: URL | string): NextResponse {
    const target = typeof url === "string" ? url : url.toString();
    const res = target.startsWith("http")
      ? NextResponse.redirect(target)
      : NextResponse.redirect(new URL(target, request.url));
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies("/sign-in");
  }

  const rl = rateLimit(user.id, { limit: 5, windowSeconds: 60 });
  if (!rl.allowed) {
    return redirectWithCookies("/curriculum?checkout=rate-limited");
  }

  const origin = getOrigin();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: MASTERCLASS_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/dashboard?masterclass=success`,
      cancel_url: `${origin}/curriculum?masterclass=canceled`,
      metadata: {
        user_id: user.id,
        product: "masterclass",
      },
      customer_email: user.email ?? undefined,
    });

    if (!session.url) {
      return redirectWithCookies("/curriculum?checkout=failed");
    }

    return redirectWithCookies(session.url);
  } catch (err) {
    console.error("Masterclass checkout error:", err instanceof Error ? err.message : err);
    return redirectWithCookies("/curriculum?checkout=failed");
  }
}
