import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
  .split("\n")
  .filter((l) => l.includes("="))
  .reduce((acc: Record<string, string>, line) => {
    const [k, ...v] = line.split("=");
    acc[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});

async function main() {
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get the most recent release-style lesson for content_json schema reference
  const { data, error } = await sb
    .from("lessons")
    .select("title, slug, description, content_json, xp_reward, estimated_minutes")
    .eq("course_id", "c814a725-3c74-427b-aefb-49c5b8b22c59")
    .eq("slug", "opus-4-7")
    .single();

  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("Reference lesson:");
  console.log("title:", data.title);
  console.log("slug:", data.slug);
  console.log("description:", data.description);
  console.log("xp_reward:", data.xp_reward);
  console.log("estimated_minutes:", data.estimated_minutes);
  console.log("\ncontent_json:");
  console.log(JSON.stringify(data.content_json, null, 2).slice(0, 3000));
}

main();
