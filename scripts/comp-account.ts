/**
 * Comp a free Pro Claude Academy account for someone.
 *
 * Creates a Supabase auth user (email pre-confirmed), upserts a Pro
 * subscription row with no expiry, and prints a magic link Reid can
 * paste into an email so the recipient can sign in once and stay in.
 *
 * Usage:
 *   npx tsx scripts/comp-account.ts <email> [display_name]
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const [, , email, displayNameArg] = process.argv;

if (!email) {
  console.error("Usage: npx tsx scripts/comp-account.ts <email> [display_name]");
  process.exit(1);
}

const displayName = displayNameArg || email.split("@")[0];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log(`\nComping Claude Academy Pro for: ${email} (${displayName})`);
  console.log("=".repeat(60));

  // 1. Create user with email pre-confirmed.
  let userId: string;
  const created = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name: displayName, comped: true },
  });

  if (created.error) {
    // If the user already exists, fetch them by email instead of failing.
    const msg = created.error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      const list = await supabase.auth.admin.listUsers();
      const existing = list.data?.users.find((u) => u.email === email);
      if (!existing) {
        console.error("createUser said exists, but listUsers can't find them.");
        process.exit(1);
      }
      userId = existing.id;
      console.log(`User already existed, reusing: ${userId}`);
    } else {
      console.error("createUser failed:", created.error.message);
      process.exit(1);
    }
  } else {
    userId = created.data.user.id;
    console.log(`Created user: ${userId}`);
  }

  // 2. Upsert subscription = active, no expiry.
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 100);

  const { error: subErr } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      status: "active",
      current_period_end: farFuture.toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (subErr) {
    console.error("Subscription upsert failed:", subErr.message);
    process.exit(1);
  }
  console.log("Subscription: status=active, no expiry (perpetual comp)");

  // 3. Set a strong random password so the recipient can sign in any time
  //    via email + password (no link-expiry surprises). They can rotate it
  //    from account settings later.
  const password =
    [...crypto.getRandomValues(new Uint8Array(18))]
      .map((b) => "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 57])
      .join("") + "!";

  const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });

  if (pwErr) {
    console.error("Password set failed:", pwErr.message);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Sign-in credentials (paste into email):");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  URL:      https://learntogpt.com`);
  console.log("=".repeat(60));
  console.log("\nNo expiry. Recipient can change password from account settings.");
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
