import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
  return key;
}

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client using the service_role key.
 *
 * **WARNING — BYPASSES ROW LEVEL SECURITY (RLS) ENTIRELY.**
 *
 * This client has unrestricted access to every table and row in the database.
 * It must ONLY be used in server-side contexts where RLS cannot apply:
 *
 *  1. **Webhook handlers** — e.g. Stripe webhooks that run without a user session.
 *  2. **Account deletion** — cascading deletes that span multiple tables.
 *  3. **Admin / back-office operations** — one-off scripts or admin API routes
 *     that are themselves protected by an auth gate.
 *
 * **NEVER** use this client for user-facing queries where the authenticated
 * user's session should restrict which rows are visible. Use
 * `createSupabaseServer()` (which respects RLS via the anon key + user JWT)
 * for all standard request-scoped queries.
 */
export async function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(getSupabaseUrl(), serviceKey);
}
