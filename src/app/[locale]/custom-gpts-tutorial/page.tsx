import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, Zap, Settings, Globe, BookOpen } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/custom-gpts-tutorial`;

  const title = "Custom GPTs Tutorial: Build Your Own GPT (2025)";
  const description =
    "How to make a Custom GPT from scratch. System prompt design, knowledge files, Actions (API integrations), and publishing. Step-by-step tutorial with examples.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "Custom GPTs Tutorial — Learn to GPT" }],
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

const steps = [
  {
    num: "1",
    title: "Open GPT Builder",
    icon: Settings,
    desc: "Go to chat.openai.com and click 'Explore GPTs' → 'Create.' You'll see two panels: Configure (where you build) and Preview (where you test in real time). Requires ChatGPT Plus.",
  },
  {
    num: "2",
    title: "Write a system prompt",
    icon: BookOpen,
    desc: "The system prompt defines your GPT's personality, expertise, and constraints. Be specific: 'You are a support agent for [product]. Always respond in the user's language. Never make promises about refunds without escalating.' Precision here matters.",
  },
  {
    num: "3",
    title: "Add knowledge files",
    icon: Zap,
    desc: "Upload PDFs, text files, or spreadsheets. Your GPT can reference this content in answers. Upload product documentation, FAQs, style guides, or reference material your GPT should know about.",
  },
  {
    num: "4",
    title: "Set up Actions (optional)",
    icon: Globe,
    desc: "Actions connect your GPT to external APIs. Using an OpenAPI schema, you can let your GPT fetch live data, create records, or call any REST API. Requires some technical setup but unlocks powerful real-world workflows.",
  },
  {
    num: "5",
    title: "Test and refine",
    icon: Settings,
    desc: "Use the Preview panel to test your GPT against real scenarios. Test edge cases: what happens when users ask something outside scope? Refine the system prompt until behavior is consistent.",
  },
  {
    num: "6",
    title: "Publish",
    icon: Globe,
    desc: "Choose visibility: Only Me (private), Anyone with the link, or publish to the GPT Store. Published GPTs in the Store can earn revenue through ChatGPT's revenue share program (currently US-only).",
  },
];

const useCases = [
  { title: "Customer support assistant", desc: "Upload your documentation. Write a system prompt that keeps the GPT on-topic and escalates edge cases. Result: consistent, accurate support replies without agent guesswork." },
  { title: "Writing coach", desc: "Define a style guide in the system prompt. Upload brand voice examples. Your GPT reviews content and rewrites it to match — on demand, at scale." },
  { title: "Research synthesizer", desc: "Upload a corpus of reports, papers, or transcripts. Ask questions across all of them. No manual reading required." },
  { title: "Internal knowledge base", desc: "Upload company wikis, playbooks, and SOPs. Your team can query plain English instead of searching through docs." },
];

const faqs = [
  { q: "Do I need to know how to code to build a Custom GPT?", a: "No. Basic Custom GPTs — with a system prompt and knowledge files — require no coding. Actions (API integrations) require writing or understanding an OpenAPI schema, which is closer to configuration than programming." },
  { q: "What's the difference between a Custom GPT and the regular ChatGPT?", a: "A Custom GPT is ChatGPT with pre-loaded instructions, knowledge, and optionally API connections. Regular ChatGPT starts from scratch each conversation. A Custom GPT is a specialized, purpose-built version." },
  { q: "Do I need ChatGPT Plus to build Custom GPTs?", a: "Yes, building Custom GPTs requires a ChatGPT Plus subscription ($20/month). Free users can use Custom GPTs built by others but cannot create their own." },
  { q: "Can Custom GPTs browse the internet?", a: "Yes — if you enable the Web Browsing capability when building your GPT. You can also enable Code Interpreter and DALL-E image generation per GPT." },
  { q: "Can I make money from a Custom GPT?", a: "OpenAI has a revenue share program for GPTs published in the GPT Store (currently available to US-based builders). Revenue is based on user engagement, not a subscription model." },
];

export default async function CustomGPTsTutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/custom-gpts-tutorial`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "How to Build a Custom GPT",
        description: "Step-by-step tutorial for creating a Custom GPT in ChatGPT. Covers system prompts, knowledge files, Actions, and publishing.",
        step: steps.map((s) => ({
          "@type": "HowToStep",
          name: s.title,
          text: s.desc,
          position: parseInt(s.num),
        })),
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Build Your Own GPT</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            Custom GPTs tutorial: how to make a Custom GPT
          </h1>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Custom GPTs are purpose-built versions of ChatGPT with specialized instructions, uploaded knowledge, and optional API connections. This tutorial covers the full build — from first prompt to published GPT.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Take the Full Course <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-tutorial" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              ChatGPT Basics First
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            How to build a Custom GPT — step by step
          </h2>
          <div className="space-y-4">
            {steps.map(({ num, title, icon: Icon, desc }) => (
              <div key={num} className="flex gap-4 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] font-mono font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">{num}</div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-4 text-[#f97316]" />
                    <h3 className="font-extrabold text-[#1c1917]">{title}</h3>
                  </div>
                  <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            What people build Custom GPTs for
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {useCases.map(({ title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course CTA */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Build your first Custom GPT with guided exercises</h2>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Learn to GPT's Custom GPTs track walks you through building a real GPT from scratch — system prompt design, knowledge file strategy, and Actions setup. Interactive exercises at every step, not passive video.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Start Building <ArrowRight className="size-4" />
              </Link>
              <Link href="/curriculum" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                View Track 3
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">Custom GPTs FAQ</h2>
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
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Related Guides</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-prompts", label: "ChatGPT Prompts", desc: "Prompt templates including system prompts" },
              { href: "/chatgpt-api-tutorial", label: "ChatGPT API", desc: "Build beyond the interface with the API" },
              { href: "/prompt-engineering", label: "Prompt Engineering", desc: "The technique behind good system prompts" },
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
            <Link href="/chatgpt-tutorial" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">ChatGPT Tutorial</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
