import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/auth";
import { recordExerciseAttempt } from "@/lib/gamification";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rate limit: 60/min for authenticated users, 30/min for anonymous (by IP)
  const rateLimitKey = user
    ? `exercise-check:${user.id}`
    : `exercise-check:ip:${getClientIP(request)}`;
  const rateLimitCap = user ? 60 : 30;
  const rl = rateLimit(rateLimitKey, {
    limit: rateLimitCap,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { exercise_id?: string; answer?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { exercise_id, answer } = body;

  if (!exercise_id || typeof exercise_id !== "string") {
    return Response.json(
      { error: "exercise_id is required" },
      { status: 400 },
    );
  }

  if (!UUID_REGEX.test(exercise_id)) {
    return Response.json({ error: "Invalid exercise_id" }, { status: 400 });
  }

  if (answer === undefined || answer === null) {
    return Response.json({ error: "answer is required" }, { status: 400 });
  }

  // Max length validation (10KB)
  if (typeof answer === "string" && answer.length > 10_240) {
    return Response.json(
      { error: "Answer exceeds maximum length" },
      { status: 400 },
    );
  }

  // Use admin client to read exercises (RLS revokes SELECT for authenticated users)
  const adminDb = await createSupabaseAdmin();
  const { data: exercise, error } = await adminDb
    .from("exercises")
    .select("correct_answer, explanation, type, lesson_id")
    .eq("id", exercise_id)
    .single();

  if (error || !exercise) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Anonymous users may only check exercises on free lessons.
  // If the user is null, look up the lesson to verify it's free.
  if (!user) {
    const { data: lesson } = await adminDb
      .from("lessons")
      .select("is_free")
      .eq("id", exercise.lesson_id)
      .single();

    if (!lesson?.is_free) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Wave 2 (GTM bible v2.0 §3): Pro paywall is OFF — every signed-in user
  // can check answers on every exercise.

  const correctAnswer = exercise.correct_answer ?? "";

  // Determine correctness based on exercise type
  const correct = checkAnswer(String(answer), correctAnswer, exercise.type);

  // Record the attempt for perfect-run XP tracking. Non-critical —
  // don't fail the request if the insert errors (e.g. migration 014 not
  // yet applied). Uses the admin client because user_exercise_attempts
  // has no authenticated INSERT policy by design.
  // Skip for anonymous users — no user_id to record against.
  if (user) {
    try {
      await recordExerciseAttempt(user.id, exercise_id, correct, adminDb);
    } catch (err) {
      console.error("recordExerciseAttempt failed (non-critical):", err);
    }
  }

  // Only disclose the correct answer + explanation once the user gets it right.
  // Previously these were returned on every POST, letting a scraper harvest
  // the entire course with a single-byte guess per exercise.
  if (correct) {
    return Response.json({
      correct: true,
      correct_answer: correctAnswer,
      explanation: exercise.explanation ?? "",
    });
  }

  return Response.json({ correct: false });
}

// ---------------------------------------------------------------------------
// Answer checking logic (mirrors what was previously done client-side)
// ---------------------------------------------------------------------------
function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  exerciseType: string,
): boolean {
  switch (exerciseType) {
    case "multiple_choice":
    case "scenario":
      // correct_answer is the index as a string
      return userAnswer === correctAnswer;

    case "fill_blank":
    case "fill_in_blank": {
      // correct_answer is JSON: string or string[]
      let expected: string[];
      try {
        const parsed = JSON.parse(correctAnswer);
        expected = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        expected = [correctAnswer];
      }

      let provided: string[];
      try {
        const parsed = JSON.parse(userAnswer);
        provided = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        provided = [userAnswer];
      }

      if (provided.length !== expected.length) return false;
      return provided.every(
        (a, i) => a.trim().toLowerCase() === expected[i].trim().toLowerCase(),
      );
    }

    case "code_exercise":
    case "code_input":
    case "code_challenge": {
      const normalize = (s: string) =>
        s.trim().replace(/\s+/g, " ").toLowerCase();
      return normalize(userAnswer) === normalize(correctAnswer);
    }

    case "drag_drop":
    case "ordering": {
      // Both are JSON arrays representing ordered items
      try {
        const userArr = JSON.parse(userAnswer);
        const correctArr = JSON.parse(correctAnswer);
        if (!Array.isArray(userArr) || !Array.isArray(correctArr)) return false;
        return JSON.stringify(userArr) === JSON.stringify(correctArr);
      } catch {
        return userAnswer === correctAnswer;
      }
    }

    case "matching_pairs": {
      try {
        const userPairs = JSON.parse(userAnswer);
        const correctPairs = JSON.parse(correctAnswer);
        return JSON.stringify(userPairs) === JSON.stringify(correctPairs);
      } catch {
        return userAnswer === correctAnswer;
      }
    }

    case "word_scramble": {
      return (
        userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      );
    }

    case "prompt_builder": {
      // User sends JSON array of piece indices; correct_answer is JSON with correct_order
      try {
        const userOrder = JSON.parse(userAnswer);
        const correctData = JSON.parse(correctAnswer);
        const correctOrder = correctData.correct_order ?? correctData;
        if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) return false;
        return JSON.stringify(userOrder) === JSON.stringify(correctOrder);
      } catch {
        return userAnswer === correctAnswer;
      }
    }

    default:
      // Fallback: exact string match
      return userAnswer === correctAnswer;
  }
}
