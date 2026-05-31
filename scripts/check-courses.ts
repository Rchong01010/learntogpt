import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
const env = readFileSync(envPath, "utf-8")
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

  const { data, error } = await sb
    .from("courses")
    .select("title, slug, locale, order_index, track")
    .eq("locale", "en")
    .order("order_index");

  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("EN courses:");
  console.table(data);

  const { data: all } = await sb.from("courses").select("locale");
  const byLoc = (all || []).reduce(
    (a: Record<string, number>, r: any) => {
      a[r.locale] = (a[r.locale] || 0) + 1;
      return a;
    },
    {}
  );
  console.log("\nCount per locale:", byLoc);

  const minByLoc: Record<string, number> = {};
  const { data: ordered } = await sb
    .from("courses")
    .select("locale, order_index")
    .order("order_index");
  for (const r of ordered || []) {
    if (minByLoc[r.locale] === undefined) minByLoc[r.locale] = r.order_index;
  }
  console.log("\nMin order_index per locale:", minByLoc);
}

main();
