'use client';

import { useEffect } from 'react';

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Courses error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
      <h2 className="text-2xl font-extrabold text-ink">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Courses failed to load. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917]"
      >
        Try again
      </button>
    </div>
  );
}
