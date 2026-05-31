import type { ExerciseCheckResponse } from '@/types';

/**
 * Checks an exercise answer via the server-side API.
 * Keeps correct_answer off the client until after submission.
 */
export async function checkExercise(
  exerciseId: string,
  answer: string,
): Promise<ExerciseCheckResponse> {
  const res = await fetch('/api/exercises/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercise_id: exerciseId, answer }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to check answer');
  }

  return res.json();
}
