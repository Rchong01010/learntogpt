'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Play, Loader2 } from 'lucide-react';

interface StartMissionButtonProps {
  slug: string;
}

export function StartMissionButton({ slug }: StartMissionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleStart() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/missions/${slug}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to start mission');
      }

      // Refresh the page to show player mode
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3 text-center">
      <button
        type="button"
        onClick={handleStart}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-full border-3 border-ink bg-orange px-10 py-4 text-base font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_#1c1917] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Play className="size-5" />
            Start This Mission
          </>
        )}
      </button>
      {error && (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}
