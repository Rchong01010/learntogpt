import Link from "next/link";

/**
 * Root-level 404 for requests that don't match any locale segment.
 * Since this renders outside the [locale] layout, next-intl is not available.
 * Uses hardcoded English text and the color tokens from globals.css.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-ink" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="flex min-h-screen flex-col">
          {/* Nav — minimal */}
          <header className="border-b border-[#e5e7eb] bg-white">
            <div className="mx-auto flex max-w-[1160px] items-center px-6 py-4">
              <Link
                href="/"
                className="text-[1.5rem] font-bold text-ink"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Learn to <span className="text-orange">GPT</span>
              </Link>
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-[#e5e7eb] bg-white px-5 py-2 shadow-sm">
                <span className="text-[0.85rem] font-semibold text-ink" style={{ fontFamily: "monospace" }}>
                  404
                </span>
              </div>

              <h1 className="text-[3rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.2rem]">
                Page not found
              </h1>

              <p className="mx-auto mt-4 max-w-[480px] text-[1.1rem] leading-[1.7] text-text-secondary">
                The page you are looking for does not exist or has been moved.
              </p>

              <div className="mx-auto mt-8 max-w-[420px] rounded-lg border border-ink bg-ink px-6 py-4 shadow-sm">
                <p className="text-left text-[0.8rem] leading-relaxed text-[#a8a29e]" style={{ fontFamily: "monospace" }}>
                  <span className="text-orange">$</span>{" "}
                  <span className="text-[#e7e5e4]">learn-to-gpt --start</span>
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-lg bg-orange px-[22px] py-[10px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md"
                >
                  Back to Home
                </Link>
                <Link
                  href="/curriculum"
                  className="inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-[22px] py-[10px] text-[0.85rem] font-semibold text-ink shadow-sm transition-all hover:border-orange hover:shadow-md"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
