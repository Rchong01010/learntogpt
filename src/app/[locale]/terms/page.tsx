import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Learn to GPT",
  description: "Terms of service for Learn to GPT.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Last updated: April 3, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-text-secondary">
            <section>
              <h2 className="text-lg font-bold text-ink">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By creating an account or using Learn to GPT, you agree to these terms.
                If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">2. Description of Service</h2>
              <p className="mt-2">
                Learn to GPT is an online learning platform that teaches users how to
                effectively use ChatGPT through interactive lessons, exercises, and
                challenges. We offer a free tier with limited content and a paid Pro plan
                with full access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">3. Accounts</h2>
              <p className="mt-2">
                You must provide accurate information when creating your account. You are
                responsible for maintaining the security of your account. One account per
                person.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">4. Payments</h2>
              <p className="mt-2">
                Courses are free. If you have a historical paid subscription on file,
                refunds are handled on a case-by-case basis — email{" "}
                <a
                  href="mailto:reid@getateam.ai"
                  className="font-semibold text-orange hover:underline"
                >
                  reid@getateam.ai
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">5. Intellectual Property</h2>
              <p className="mt-2">
                All course content, exercises, and materials are owned by Learn to GPT.
                You may not copy, redistribute, or resell any content from the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">6. Acceptable Use</h2>
              <p className="mt-2">You agree not to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Share your account credentials with others</li>
                <li>Attempt to access other users&apos; data</li>
                <li>Use automated tools to scrape content</li>
                <li>Reverse engineer exercise answers for redistribution</li>
                <li>Use the service for any unlawful purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">7. Termination</h2>
              <p className="mt-2">
                We may suspend or terminate your account if you violate these terms. You
                may delete your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">8. Disclaimer</h2>
              <p className="mt-2">
                Learn to GPT is an educational platform. We are not affiliated with
                OpenAI. Completion of courses does not guarantee certification or
                employment outcomes. The service is provided &ldquo;as is&rdquo; without
                warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">9. Limitation of Liability</h2>
              <p className="mt-2">
                To the maximum extent permitted by law, Learn to GPT shall not be liable
                for any indirect, incidental, or consequential damages arising from your
                use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">10. Changes to Terms</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use of the service
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink">11. Contact</h2>
              <p className="mt-2">
                Questions about these terms? Contact us at{" "}
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
