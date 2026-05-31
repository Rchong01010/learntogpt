import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Learn to GPT",
  description: "Privacy policy for Learn to GPT.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b-[3px] border-ink bg-warm-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-[10px] border-[2px] border-ink bg-orange text-xs font-bold text-white shadow-[2px_2px_0px_#1c1917]">
              CA
            </div>
            <span className="logo-serif text-lg text-ink">Learn to GPT</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-text-secondary transition-colors hover:text-ink">
              Home
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-8 items-center rounded-full border-[2px] border-ink bg-ink px-4 text-sm font-bold text-cream transition-all hover:bg-walnut"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Last updated: April 3, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-text-secondary">
            <section>
              <h2 className="text-lg font-bold text-ink">1. Information We Collect</h2>
              <p className="mt-2">
                When you create an account, we collect your name and email address through
                Google OAuth. We also collect usage data such as lesson progress, exercise
                completions, and streaks to provide and improve the learning experience.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">2. How We Use Your Information</h2>
              <p className="mt-2">We use your information to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Provide, maintain, and improve Learn to GPT</li>
                <li>Track your learning progress and achievements</li>
                <li>Process payments through Stripe (Pro plan)</li>
                <li>Send important account notifications</li>
                <li>Respond to support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">3. Payment Processing</h2>
              <p className="mt-2">
                Payments are processed by Stripe. We do not store your credit card information.
                Stripe&apos;s privacy policy governs their handling of your payment data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">4. Data Storage</h2>
              <p className="mt-2">
                Your data is stored securely using Supabase with row-level security enabled.
                We use industry-standard security measures to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">5. Third-Party Services</h2>
              <p className="mt-2">We use the following third-party services:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Google OAuth for authentication</li>
                <li>Stripe for payment processing</li>
                <li>Supabase for data storage</li>
                <li>Vercel for hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">6. Your Rights</h2>
              <p className="mt-2">
                You can request deletion of your account and associated data at any time by
                contacting us. You can also export your learning progress data upon request.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">7. Cookies</h2>
              <p className="mt-2">
                We use essential cookies for authentication and session management. We do not
                use third-party tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">8. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this policy from time to time. We will notify you of significant
                changes via email or through the application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">9. Contact</h2>
              <p className="mt-2">
                Questions about this policy? Contact us at{" "}
                <a href="mailto:reid@getateam.ai" className="font-semibold text-orange hover:underline">
                  reid@getateam.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-[2px] border-ink/10 bg-linen">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Zap className="size-4 text-orange" />
            <span className="font-semibold">Learn to GPT</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms
            </Link>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
