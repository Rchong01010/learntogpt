import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, HelpCircle, Lightbulb } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/how-to-use-chatgpt`;

  const title = "How to Use ChatGPT Effectively at Work";
  const description =
    "Practical guide to using ChatGPT effectively. Covers prompting techniques, Custom Instructions, workflow integration, and the mistakes that waste time.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "How to Use ChatGPT — Learn to GPT" }],
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

const useCases = [
  { title: "Writing and editing", desc: "Draft emails, reports, proposals, or social posts. Give ChatGPT context about your audience and purpose. Then iterate — 'shorter,' 'more formal,' 'add an example.'" },
  { title: "Research and summarizing", desc: "Paste in a document, article, or chunk of text and ask for a structured summary. ChatGPT handles long documents well and can extract specific information on demand." },
  { title: "Coding and debugging", desc: "Paste broken code and describe the error. ChatGPT will identify the issue and suggest a fix. For longer projects, give it the full context — it can hold an entire file in mind." },
  { title: "Brainstorming", desc: "Use ChatGPT as a thought partner. Ask for 10 angles on a problem, a devil's advocate perspective, or a list of considerations you might be missing. It synthesizes broadly." },
  { title: "Data analysis and spreadsheets", desc: "Paste CSV data and ask for summaries, trends, or calculations. Or ask it to write a formula or Python script to process your data in a specific way." },
  { title: "Learning new topics", desc: "Ask ChatGPT to explain complex topics at different levels. 'Explain this like I have a business background but no technical knowledge.' Socratic dialogue mode works exceptionally well." },
];

const mistakes = [
  { title: "Vague prompts", fix: "Add specificity: who is this for, what format do you need, what tone. Vague in = generic out." },
  { title: "Single-shot only", fix: "ChatGPT holds context. Follow up with 'make it shorter,' 'switch the tone,' 'add a counterargument.' One prompt is rarely the final answer." },
  { title: "Treating it like a search engine", fix: "ChatGPT doesn't browse the web by default. Give it the information you want analyzed. It processes — it doesn't fetch." },
  { title: "Not setting Custom Instructions", fix: "Go to your profile and set your role, context, and preferences. ChatGPT will apply them to every conversation automatically." },
];

const faqs = [
  { q: "How do I get better responses from ChatGPT?", a: "Three things: be specific about what you want, give it context (role, audience, purpose), and iterate on the first response rather than starting over. Power users treat it as a conversation, not a single query." },
  { q: "Can ChatGPT access the internet?", a: "The free tier does not browse the web by default. ChatGPT Plus has a browsing feature. For real-time information, you need to either enable browsing or paste the content yourself." },
  { q: "What can't ChatGPT do?", a: "It can't reliably do precise arithmetic on large numbers. It doesn't have real-time data without browsing enabled. It sometimes confidently states incorrect facts — always verify important claims, especially for dates, statistics, and citations." },
  { q: "Is ChatGPT safe to use for work?", a: "ChatGPT does not use your conversations to train future models if you opt out (under Settings > Data Controls). For sensitive data, use the API or an enterprise subscription with data processing agreements." },
  { q: "What is Custom Instructions in ChatGPT?", a: "Custom Instructions are persistent preferences you set once and ChatGPT applies to every conversation. You can specify your role, how you want responses formatted, and things ChatGPT should always or never do. Find it under your profile menu." },
];

export default async function HowToUseChatGPTPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/how-to-use-chatgpt`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "How to Use ChatGPT Effectively at Work",
        description: "Practical guide to using ChatGPT for writing, research, coding, brainstorming, and professional workflows.",
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Practical Guide</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            How to use ChatGPT effectively at work
          </h1>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Most people use ChatGPT wrong. They write vague prompts, get generic responses, and give up. This guide covers the techniques that actually produce useful results — and the common mistakes that don't.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/getting-started" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Start Free Course <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-prompts" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Get Prompt Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            What ChatGPT is actually useful for
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {useCases.map(({ title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="size-5 shrink-0 text-[#22c55e]" />
                  <h3 className="font-extrabold text-[#1c1917]">{title}</h3>
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mistakes */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Common mistakes and how to fix them
          </h2>
          <div className="space-y-4">
            {mistakes.map(({ title, fix }) => (
              <div key={title} className="overflow-hidden rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] shadow-[3px_3px_0px_#1c1917]">
                <div className="flex items-center gap-3 border-b-[2px] border-[#1c1917]/20 bg-[#fdf0e0] px-6 py-4">
                  <span className="rounded-full border-[2px] border-[#1c1917] bg-[#fdf8f0] px-2 py-0.5 font-mono text-[0.72rem] font-bold text-[#6b5e52] line-through">Mistake</span>
                  <span className="font-semibold text-[#6b5e52]">{title}</span>
                </div>
                <div className="flex items-start gap-3 px-6 py-4">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#f97316]" />
                  <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]"><strong className="text-[#1c1917]">Fix:</strong> {fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA box */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Turn these techniques into actual habits</h2>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Reading about ChatGPT is different from building the muscle memory. Learn to GPT's interactive lessons put you in real scenarios with a live prompt sandbox — so you practice the techniques until they're automatic. Tracks 1 and 6 are free to start.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Start Free <ArrowRight className="size-4" />
              </Link>
              <Link href="/curriculum" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                View Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
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
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Keep Learning</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-tutorial", label: "ChatGPT Tutorial", desc: "Step-by-step setup and first lessons" },
              { href: "/chatgpt-tips", label: "ChatGPT Tips", desc: "Advanced techniques for power users" },
              { href: "/chatgpt-for-business", label: "ChatGPT for Business", desc: "Department use cases and team setup" },
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
            <Link href="/chatgpt-tutorial" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Tutorial</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
