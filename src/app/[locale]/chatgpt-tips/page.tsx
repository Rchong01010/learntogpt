import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, Zap, Star } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-tips`;

  const title = "Best ChatGPT Tips and Tricks for Power Users (2025)";
  const description =
    "The best advanced ChatGPT tips that most users don't know. Custom Instructions, conversation patterns, prompt chaining, memory, and workflow automation techniques for 2025.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT Tips — Learn to GPT" }],
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

const tips = [
  {
    num: "01",
    title: "Set Custom Instructions once, benefit always",
    desc: "Go to your profile and set Custom Instructions. Add your role, company context, preferred response format, and things ChatGPT should always/never do. This context applies automatically to every new conversation — you won't have to re-explain yourself every time.",
  },
  {
    num: "02",
    title: "Use 'Act as' to activate specialized knowledge",
    desc: "Starting a prompt with 'Act as a senior [role] with [X] years of experience in [domain]' shifts ChatGPT into a more specialized mode. The output tends to use appropriate terminology, make domain-specific assumptions, and avoid beginner-level explanations.",
  },
  {
    num: "03",
    title: "Ask for multiple versions",
    desc: "Instead of 'Write an email,' say 'Write 3 versions of this email: one formal, one casual, one very brief.' Then pick the best. Getting options on the first pass saves iteration time.",
  },
  {
    num: "04",
    title: "Chain prompts for complex work",
    desc: "Break big tasks into smaller prompts: first outline, then expand section by section, then refine. Each response stays in context. This produces better long-form work than a single 'write me a 2000-word article' prompt.",
  },
  {
    num: "05",
    title: "Use the 'Refine until perfect' loop",
    desc: "After a response, say what you'd change: 'Good structure, but make the tone more direct and cut the third paragraph.' Keep iterating in the same conversation until it's right. Don't start over — ChatGPT holds context.",
  },
  {
    num: "06",
    title: "Add 'Be specific, not generic' to any brainstorm",
    desc: "Brainstorming prompts often produce generic outputs ('Build a social media presence'). Adding 'Be specific, not generic. Avoid clichés. Give concrete examples' pushes ChatGPT to produce actually useful ideas.",
  },
  {
    num: "07",
    title: "Use ChatGPT Memory (Plus)",
    desc: "ChatGPT Plus has a memory feature that lets it remember information across conversations. Enable it in settings. Tell ChatGPT things you want it to remember: your role, preferences, ongoing projects. It accumulates context over time.",
  },
  {
    num: "08",
    title: "Paste code or data directly — it handles it",
    desc: "ChatGPT handles raw CSV, JSON, code snippets, and markdown in the chat. Paste data and ask it to analyze, transform, or explain. You don't need to format it specially — just paste and ask.",
  },
  {
    num: "09",
    title: "Use structured output for reusable results",
    desc: "Ask for JSON, tables, or markdown with specific fields. 'Output as a JSON array with fields: name, action, deadline, owner.' Structured output is easier to paste into other tools or work with programmatically.",
  },
  {
    num: "10",
    title: "Ask ChatGPT to critique its own output",
    desc: "After getting a response, ask: 'What are the 3 weakest parts of this response?' Then: 'Fix them.' This self-critique loop often catches issues faster than starting with a correction.",
  },
];

const faqs = [
  { q: "What are the most useful ChatGPT tips for daily work?", a: "Set Custom Instructions to avoid repeating context. Use role-priming ('Act as a...'). Ask for multiple versions. Iterate in the same conversation rather than starting over. These four alone transform casual ChatGPT use into a professional workflow." },
  { q: "Does ChatGPT remember previous conversations?", a: "By default, ChatGPT doesn't carry memory between separate conversations. ChatGPT Plus has a Memory feature that lets it remember things you tell it across sessions. Within a single conversation, it remembers everything from the start." },
  { q: "How do I get ChatGPT to write in my voice?", a: "Paste samples of your own writing and say 'Match this tone and style.' Or describe your voice: 'Direct, no filler, short sentences, professional but not stuffy.' Using Custom Instructions for this means it applies automatically." },
  { q: "What's the best way to use ChatGPT for research?", a: "Paste your source material — don't ask ChatGPT to look things up without browsing enabled. Paste documents, papers, or transcripts, then ask specific questions. ChatGPT's strength is synthesis and analysis, not retrieval." },
  { q: "What are the best ChatGPT settings for productivity?", a: "Three settings make the biggest difference: (1) Custom Instructions with your role and preferences, (2) enabling Memory so ChatGPT learns your patterns over time, and (3) using GPT-4o for complex tasks instead of GPT-3.5. These compound over time." },
  { q: "How do I learn advanced ChatGPT techniques?", a: "Learn to GPT teaches advanced ChatGPT techniques through structured, hands-on practice. Track 2 covers professional prompting (chain-of-thought, few-shot, structured output), Track 3 covers Custom GPTs, and Track 4 covers the API and agents. All interactive, not video lectures." },
];

export default async function ChatGPTTipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-tips`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "ChatGPT Tips and Tricks for Power Users",
        description: "Advanced ChatGPT techniques including Custom Instructions, prompt chaining, memory, and structured output.",
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Power User Techniques</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            10 ChatGPT tips and tricks that actually matter
          </h1>
          <div className="mx-auto mt-6 max-w-[680px] rounded-[16px] border-[3px] border-[#1c1917] bg-white p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The best ChatGPT tips focus on workflow integration, not novelty tricks. Custom Instructions, prompt chaining, and structured output are the three techniques that produce the biggest productivity gains. This guide covers the 10 tips that power users rely on daily.
            </p>
          </div>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Most people use ChatGPT at maybe 20% of its capability. These are the techniques that separate occasional users from people who get real work done with it every day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/prompt-engineering" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Learn Prompt Engineering <ArrowRight className="size-5" />
            </Link>
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Practice Free
            </Link>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="space-y-4">
            {tips.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] font-mono text-[0.75rem] font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">
                  {num}
                </div>
                <div>
                  <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn more CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Build these into actual habits</h2>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Knowing the tips and using them automatically are different things. Learn to GPT's structured tracks put you through scenarios until these patterns become instinct — not just knowledge. Tracks 1 and 6 are free.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Start Free <ArrowRight className="size-4" />
              </Link>
              <Link href="/chatgpt-prompts" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Get Prompt Templates
              </Link>
            </div>
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
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Go Deeper</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-prompts", label: "ChatGPT Prompts", desc: "Copy-paste templates for every task" },
              { href: "/custom-gpts-tutorial", label: "Custom GPTs", desc: "Build specialized tools on top of ChatGPT" },
              { href: "/how-to-use-chatgpt", label: "How to Use ChatGPT", desc: "Foundational guide to productive use" },
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
            <Link href="/chatgpt-prompts" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Prompt Templates</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
