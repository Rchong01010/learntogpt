'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// AccountGate
//
// Shown to anonymous users attempting to access Lesson 3+ (order_index >= 2).
// Captures email for re-engagement without being a paywall. After sign-in or
// sign-up, the user continues directly to the lesson they were trying to reach.
// ---------------------------------------------------------------------------

interface AccountGateProps {
  /** Current lesson slug for redirect-after-auth */
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
}

export function AccountGate({ courseSlug, lessonSlug, lessonTitle }: AccountGateProps) {
  const [loading, setLoading] = useState(false);

  const redirectPath = `/courses/${courseSlug}/${lessonSlug}`;

  async function handleGoogleSignIn() {
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const callbackUrl = new URL('/api/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', redirectPath);

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-f-static overflow-hidden shadow-[4px_4px_0px_#1c1917]">
          <div className="h-2 w-full bg-orange" />

          <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border-[2px] border-ink bg-orange/10">
              <BookOpen className="size-7 text-orange" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-ink">
                Create a free account to continue
              </h2>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-text-secondary">
                Save your progress and pick up where you left off. Takes 10 seconds — no credit card required.
              </p>
            </div>

            <p className="text-xs text-text-secondary">
              Next up: <span className="font-semibold text-ink">{lessonTitle}</span>
            </p>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2 rounded-full border-[3px] border-ink bg-orange text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </Button>

              <Link
                href={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[2px] border-ink bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-linen"
              >
                Sign up with email
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <Link
                href={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}
                className="font-semibold text-orange hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
