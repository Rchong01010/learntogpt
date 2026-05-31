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

  const { data: courses, error } = await sb
    .from("courses")
    .select("id, title, slug, locale, order_index, track, is_free, difficulty")
    .eq("slug", "whats-new-in-claude");

  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("'whats-new-in-claude' rows per locale:");
  console.table(courses);

  if (!courses?.length) return;
  const ids = courses.map((c) => c.id);
  const { data: lessons } = await sb
    .from("lessons")
    .select("course_id, title, slug, order_index")
    .in("course_id", ids)
    .order("order_index");
  console.log("\nLessons in those courses:");
  console.table(lessons);
}

main();
