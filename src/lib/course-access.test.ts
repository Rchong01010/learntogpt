/**
 * Tests for canAccessCourse (src/lib/course-access.ts) — the course-access
 * decision shared by the lesson page and POST /api/progress.
 *
 * No jest/vitest in this repo, so this is a self-contained tsx-runnable test:
 *   npx tsx src/lib/course-access.test.ts
 *
 * No network, no DB, no env required: Supabase is replaced by an in-memory
 * fake and isPro is injected.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessCourse } from "./course-access";

type Row = Record<string, string>;

/** Just enough of the query builder for course-access.ts. */
function fakeSupabase(tables: Record<string, Row[]>): SupabaseClient {
  const query = (rows: Row[]) => {
    const builder = {
      select: () => builder,
      eq: (col: string, val: string) => query(rows.filter((r) => r[col] === val)),
      in: (col: string, vals: string[]) => query(rows.filter((r) => vals.includes(r[col]))),
      limit: (n: number) => query(rows.slice(0, n)),
      then: (resolve: (v: { data: Row[] }) => unknown) => resolve({ data: rows }),
    };
    return builder;
  };
  return { from: (t: string) => query(tables[t] ?? []) } as unknown as SupabaseClient;
}

let failures = 0;

async function expect(name: string, got: Promise<boolean>, want: boolean) {
  const value = await got;
  if (value === want) {
    console.log(`  ok   ${name} => ${want}`);
  } else {
    console.error(`  FAIL ${name} => got ${value}, want ${want}`);
    failures++;
  }
}

const USER = "user-1";
const OTHER = "user-2";
const lessons = [
  { id: "a1", course_id: "course-a" },
  { id: "b1", course_id: "course-b" },
  { id: "b2", course_id: "course-b" },
];
const notPro = async () => false;
const pro = async () => true;

async function main() {
  console.log("canAccessCourse");

  await expect(
    "not pro, no progress in course",
    canAccessCourse(
      fakeSupabase({ lessons, user_progress: [{ user_id: USER, lesson_id: "a1" }] }),
      USER,
      "course-b",
      notPro,
    ),
    false,
  );

  await expect(
    "not pro, progress in this course (grace rule)",
    canAccessCourse(
      fakeSupabase({ lessons, user_progress: [{ user_id: USER, lesson_id: "b1" }] }),
      USER,
      "course-b",
      notPro,
    ),
    true,
  );

  await expect(
    "not pro, only another user has progress in course",
    canAccessCourse(
      fakeSupabase({ lessons, user_progress: [{ user_id: OTHER, lesson_id: "b1" }] }),
      USER,
      "course-b",
      notPro,
    ),
    false,
  );

  await expect(
    "not pro, course has no lessons",
    canAccessCourse(fakeSupabase({ lessons, user_progress: [] }), USER, "course-z", notPro),
    false,
  );

  await expect(
    "pro, no progress",
    canAccessCourse(fakeSupabase({ lessons, user_progress: [] }), USER, "course-b", pro),
    true,
  );

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

main();
