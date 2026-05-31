import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, XCircle, Minus, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-vs-claude`;

  const title = "ChatGPT vs Claude: Honest Comparison for 2025";
  const description =
    "ChatGPT vs Claude — which AI is better for your use case? Side-by-side comparison of features, strengths, pricing, and best use cases. No hype, just facts.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT vs Claude — Learn to GPT" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${baseUrl}/og-default.png`] },
    alternates: {
      canonical: pathForLocale(locale),
      languages: Object.fromEntries(routing.locales.map((loc) => [loc, pathForLocale(loc)])),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const comparisons = [
  {
    category: "Conversational quality",
    chatgpt: "Excellent — natural, adaptive, good at multi-turn dialogue",
    claude: "Excellent — nuanced, precise, adapts to complexity",
    winner: "tie" as const,
  },
  {
    category: "Long-form writing",
    chatgpt: "Strong — good range, can feel formulaic at high volume",
    claude: "Very strong — structured, adapts to voice, lower hallucination rate",
    winner: "claude" as const,
  },
  {
    category: "Code generation",
    chatgpt: "Strong — large ecosystem, GPT-4o speed, good plugin support",
    claude: "Strong — explains reasoning, catches edge cases, Claude Code CLI",
    winner: "tie" as const,
  },
  {
    category: "Image generation",
    chatgpt: "Native DALL-E 3 built in — no extra tools needed",
    claude: "Not built in — requires external tools or API integrations",
    winner: "chatgpt" as const,
  },
  {
    category: "Web browsing",
    chatgpt: "Native browsing built into ChatGPT Plus",
    claude: "Available via computer use and MCP integrations",
    winner: "chatgpt" as const,
  },
  {
    category: "Context window",
    chatgpt: "128K tokens — handles most documents and codebases",
    claude: "200K tokens — reads entire codebases, books, long transcripts",
    winner: "claude" as const,
  },
  {
    category: "Custom GPTs / Projects",
    chatgpt: "GPT Builder — no-code Custom GPTs with knowledge files and Actions",
    claude: "Claude Projects — persistent context and instructions across conversations",
    winner: "tie" as const,
  },
  {
    category: "Developer tools",
    chatgpt: "OpenAI API + Assistants API + plugin ecosystem",
    claude: "Claude API + Claude Code CLI + MCP server ecosystem",
    winner: "tie" as const,
  },
  {
    category: "Pricing (paid tier)",
    chatgpt: "ChatGPT Plus: $20/month",
    claude: "Claude Pro: $20/month",
    winner: "tie" as const,
  },
];

const faqs = [
  { q: "Is ChatGPT or Claude better for writing?", a: "Both are strong, but for long-form, nuanced writing — reports, essays, professional communication — Claude tends to produce more precise, less generic output. For creative writing and variety, ChatGPT's range is comparable. Try both with your actual use case." },
  { q: "Is ChatGPT or Claude better for coding?", a: "GPT-4o and Claude 3.5 Sonnet are closely matched on standard code generation. Claude's advantage is Claude Code — an agentic CLI that works in your terminal, edits real project files, and runs tests. If you want autonomous coding workflows, Claude Code is ahead." },
  { q: "Which AI should beginners start with?", a: "Start with ChatGPT. It has a longer track record of beginner-friendly UX, a larger knowledge base of tutorials, and more integration options (image generation, browsing) built in by default. Claude is excellent, but the ChatGPT ecosystem is more mature for general learning." },
  { q: "Can I use both ChatGPT and Claude?", a: "Yes, and many professionals do. A common workflow: ChatGPT for image generation, web browsing, and tasks where the GPT plugin ecosystem is useful. Claude for deep document analysis, long-form writing, and coding workflows via Claude Code." },
  { q: "Which is faster, ChatGPT or Claude?", a: "GPT-4o (ChatGPT) tends to have faster response times for short tasks. For long-context tasks — analyzing a 200-page document or a large codebase — Claude's architecture is optimized differently. Real-world speed depends on task type and server load." },
];

type Winner = "tie" | "chatgpt" | "claude";

function WinnerIcon({ winner, side }: { winner: Winner; side: "chatgpt" | "claude" }) {
  if (winner === "tie") return <Minus className="size-4 text-[#9a7b5c]" />;
  if (winner === side) return <CheckCircle2 className="size-4 text-[#22c55e]" />;
  return <XCircle className="size-4 text-[#6b5e52]/40" />;
}

export default async function ChatGPTvsClaudePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-vs-claude`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "ChatGPT vs Claude: Honest Comparison for 2025",
        description: "Side-by-side comparison of ChatGPT and Claude across writing, coding, browsing, context window, developer tools, and pricing.",
        url: pathForLocale(locale),
        publisher: { "@type": "Organization", name: "Learn to GPT", url: "https://learntogpt.com" },
        inLanguage: locale,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="px-6 pt-[80px] pb-16 text-center">
        <div className="mx-auto max-w-[760px]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Honest Comparison</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            ChatGPT vs Claude: which AI is right for your work?
          </h1>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Both are excellent. The right answer depends on your specific use case. This comparison is fact-based — no sponsored conclusion, no fanboy framing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/learn-chatgpt" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Learn ChatGPT Free <ArrowRight className="size-5" />
            </Link>
            <Link href="/what-is-claude" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Learn About Claude
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Feature-by-feature comparison
          </h2>
          <div className="overflow-hidden rounded-[18px] border-[3px] border-[#1c1917] bg-[#fdf8f0] shadow-[6px_6px_0px_#1c1917]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b-[3px] border-[#1c1917] bg-[#1c1917] text-white">
              <div className="px-4 py-3 text-[0.8rem] font-bold">Feature</div>
              <div className="border-l border-white/20 px-4 py-3 text-[0.8rem] font-bold">ChatGPT</div>
              <div className="border-l border-white/20 px-4 py-3 text-[0.8rem] font-bold">Claude</div>
            </div>
            {comparisons.map(({ category, chatgpt, claude, winner }, i) => (
              <div
                key={category}
                className={`grid grid-cols-[1fr_1fr_1fr] ${i < comparisons.length - 1 ? "border-b-[2px] border-[#1c1917]/15" : ""}`}
              >
                <div className="px-4 py-4 text-[0.85rem] font-semibold text-[#1c1917]">{category}</div>
                <div className="border-l-[2px] border-[#1c1917]/15 px-4 py-4">
                  <div className="mb-1 flex items-center gap-1.5">
                    <WinnerIcon winner={winner} side="chatgpt" />
                    <span className="text-[0.75rem] text-[#6b5e52] leading-[1.5]">{chatgpt}</span>
                  </div>
                </div>
                <div className="border-l-[2px] border-[#1c1917]/15 px-4 py-4">
                  <div className="mb-1 flex items-center gap-1.5">
                    <WinnerIcon winner={winner} side="claude" />
                    <span className="text-[0.75rem] text-[#6b5e52] leading-[1.5]">{claude}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Which should you use?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[18px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-7 shadow-[4px_4px_0px_#1c1917]">
              <h3 className="mb-3 text-[1.1rem] font-extrabold text-[#1c1917]">Choose ChatGPT if you need:</h3>
              <ul className="space-y-2">
                {[
                  "Native image generation (DALL-E 3)",
                  "Built-in web browsing on Plus",
                  "The largest selection of Custom GPTs in the Store",
                  "Beginner-friendly onboarding and UX",
                  "Wider ecosystem of third-party integrations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[0.88rem] text-[#6b5e52]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#22c55e]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[18px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-7 shadow-[4px_4px_0px_#1c1917]">
              <h3 className="mb-3 text-[1.1rem] font-extrabold text-[#1c1917]">Choose Claude if you need:</h3>
              <ul className="space-y-2">
                {[
                  "200K token context for large documents",
                  "Claude Code for agentic coding workflows",
                  "Lower hallucination rate on complex documents",
                  "The MCP tool ecosystem for developer workflows",
                  "Superior nuance for long-form writing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[0.88rem] text-[#6b5e52]">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#22c55e]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf0e0] p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[0.95rem] leading-[1.7] text-[#6b5e52]">
              <strong className="text-[#1c1917]">Honest answer:</strong> Many professionals use both. ChatGPT for image generation and browsing tasks. Claude for document-heavy analysis and coding. The skills you build working with one transfer directly to the other — they're both conversational AI with the same core mechanic.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 flex items-start gap-3">
                  <HelpCircle className="mt-0.5 size-5 shrink-0 text-[#14b8a6]" />
                  <h3 className="text-[1rem] font-bold text-[#1c1917]">{item.q}</h3>
                </div>
                <p className="ml-8 text-[0.9rem] leading-[1.6] text-[#6b5e52]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="px-6 pb-[80px]">
        <div className="mx-auto max-w-[800px]">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Learn Both</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/learn-chatgpt", label: "Learn ChatGPT", desc: "Free interactive course to master ChatGPT" },
              { href: "/claude-vs-chatgpt", label: "Claude vs ChatGPT", desc: "The same comparison from Claude's side" },
              { href: "/chatgpt-tutorial", label: "ChatGPT Tutorial", desc: "Step-by-step tutorial for ChatGPT" },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-[18px_20px] shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]">
                <div className="mb-1 text-[0.95rem] font-bold text-[#1c1917]">{label}</div>
                <p className="text-[0.8rem] leading-[1.5] text-[#6b5e52]">{desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-[#f97316]">Explore <ArrowRight className="size-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-[4px] border-[#1c1917] py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-[#1c1917]"><span className="text-[#22c55e]">Learn to</span> GPT</div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Curriculum</Link>
            <Link href="/claude-vs-chatgpt" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Claude vs ChatGPT</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
