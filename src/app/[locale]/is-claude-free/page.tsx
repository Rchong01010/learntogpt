import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle, HelpCircle, Zap, Lock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/is-claude-free`;

  const title = "Is Claude AI Free? Best Pricing Guide for 2025";
  const description =
    "Yes, Claude AI has a free tier. Here's exactly what's included, what the limits are, and when you'd want to upgrade. Honest, direct answer with no marketing fluff.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Is Claude AI Free? — Learn to GPT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-default.png`],
    },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, pathForLocale(loc)])
      ),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const faqItems = [
  {
    q: "Is Claude AI free to use?",
    a: "Yes. Claude.ai offers a free tier that gives you access to Claude without a credit card. You can start conversations, upload documents, and use Claude for writing, analysis, coding help, and research — all for free.",
  },
  {
    q: "What's included in the Claude free tier?",
    a: "The free tier includes access to Claude's conversational interface at claude.ai, the ability to upload files and images, document analysis, coding help, and general-purpose writing and research tasks. Free accounts have usage limits — you can hit a daily cap during peak hours.",
  },
  {
    q: "What are the free tier limitations?",
    a: "Free users may encounter rate limits during high-demand periods, meaning Claude will ask you to wait before sending more messages. Free accounts also have access to a specific model tier — paid plans unlock access to more powerful models like Claude Opus.",
  },
  {
    q: "Do you need a credit card to use Claude for free?",
    a: "No credit card required to start. Create an account at claude.ai with an email address and you can use the free tier immediately.",
  },
  {
    q: "Is Claude Code free?",
    a: "Claude Code is a CLI tool that uses the Anthropic Claude API. Running it requires an Anthropic API account with API credits — it is not included in the claude.ai free tier. However, Learn to GPT's free courses teach you Custom GPT and prompting workflows before you need to pay for API access.",
  },
  {
    q: "Is Learn to GPT free?",
    a: "Learn to GPT's foundational tracks (Track 1: Foundations and Track 6: Practitioner Setup) are completely free — no credit card required. Advanced content including Track 7 (hooks, agents, multi-agent architectures) is available through our paid masterclass.",
  },
  {
    q: "When should I upgrade from the free tier?",
    a: "Upgrade when you need: (1) higher daily message limits without waiting, (2) access to more powerful Claude models, (3) Claude Projects for team collaboration, or (4) larger context windows for long documents.",
  },
  {
    q: "Is Claude free for businesses?",
    a: "Claude has business and team plans that are not free, but individual employees can use the free tier for personal exploration. Businesses that want team collaboration, administrative controls, and higher limits should look at Claude's team offerings.",
  },
];

const freeIncludes = [
  "Conversations with Claude at claude.ai",
  "File and image uploads",
  "Document analysis and summarization",
  "Writing, editing, and research",
  "Coding help and debugging",
  "Access to Learn to GPT's free tracks (Tracks 1 and 6)",
];

const paidUnlocks = [
  "Higher daily message limits",
  "Access to more powerful Claude models (Opus, etc.)",
  "Claude Projects for team knowledge bases",
  "Larger context windows",
  "Priority access during peak hours",
  "Advanced Learn to GPT content (Track 7 and above)",
];

export default async function IsClaudeFreePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/is-claude-free`;

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                name: "Is Claude AI Free? Free Tier Explained",
                url: pathForLocale(locale),
                inLanguage: locale,
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                  },
                })),
                isPartOf: { "@type": "WebSite", name: "Learn to GPT", url: baseUrl },
                image: `${baseUrl}/og-default.png`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Is Claude Free?", item: pathForLocale(locale) },
                ],
              },
            ],
          }),
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-[4px] border-ink bg-linen">
        <nav>
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
            <Link href="/" className="logo-serif text-[1.75rem] text-ink">
              <span className="text-gpt-green">Learn to</span> GPT
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
                Log In
              </Link>
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO — Direct Answer */}
        <section className="px-6 pb-16 pt-[100px] text-center">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <HelpCircle className="size-4" />
              Direct Answer
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Is{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude AI
              </em>{" "}
              Free?
            </h1>
            <div className="mx-auto mt-8 max-w-[660px] rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917]">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="size-8 text-teal" />
                <span className="text-[1.5rem] font-extrabold text-ink">Yes — Claude AI has a free tier.</span>
              </div>
              <p className="mt-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                You can use Claude at <strong>claude.ai</strong> without paying anything. No credit card required. Create an account with your email and start immediately. Free accounts have usage limits — you may hit a daily cap during peak hours — but the core product is genuinely usable at no cost.
              </p>
            </div>

            <div className="mb-4 mt-10 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start Learning Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Getting Started Guide
              </Link>
            </div>
          </div>
        </section>

        {/* FREE vs PAID */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Free vs. Paid: What&apos;s the difference?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* FREE */}
              <div className="rounded-[18px] border-[4px] border-ink bg-cream p-8 shadow-[6px_6px_0px_#1c1917]">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="size-6 text-teal" />
                  <h3 className="text-[1.3rem] font-extrabold text-ink">Free tier includes</h3>
                </div>
                <ul className="space-y-3">
                  {freeIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                      <CheckCircle className="mt-0.5 size-4 flex-shrink-0 text-teal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* PAID */}
              <div className="rounded-[18px] border-[4px] border-ink bg-linen p-8 shadow-[6px_6px_0px_#1c1917]">
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="size-6 text-orange" />
                  <h3 className="text-[1.3rem] font-extrabold text-ink">Paid plans add</h3>
                </div>
                <ul className="space-y-3">
                  {paidUnlocks.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                      <ArrowRight className="mt-0.5 size-4 flex-shrink-0 text-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CLAUDE ACADEMY FREE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Learn to GPT is also free to start
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Learn to GPT is an independent learning platform (not affiliated with OpenAI) that teaches you how to use ChatGPT effectively. Two full learning tracks — <strong className="text-ink">Track 1: Foundations</strong> and <strong className="text-ink">Track 6: Practitioner Setup</strong> — are completely free, covering everything from your first prompt to Custom GPT configuration and system prompt design.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Advanced content (agent architectures, hooks, multi-agent pipelines) is available through our paid masterclass for learners who want to go deeper. No credit card required for the free tracks.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqItems.map(({ q, a }) => (
                <div key={q} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-teal" />
                    <h3 className="text-[1rem] font-bold text-ink">{q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Start learning{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude for free
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              No credit card. Two free tracks. Start in 60 seconds.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Getting Started Guide
              </Link>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/learn", label: "Learn ChatGPT", desc: "Free interactive lessons" },
                { href: "/getting-started", label: "Getting Started", desc: "New to Claude? Start here" },
                { href: "/claude-vs-chatgpt", label: "Claude vs ChatGPT", desc: "Honest feature comparison" },
              ].map(({ href, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-[18px_20px] shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]"
                >
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">{label}</div>
                  <p className="text-[0.8rem] leading-[1.5] text-text-secondary">{desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-orange">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            © {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
