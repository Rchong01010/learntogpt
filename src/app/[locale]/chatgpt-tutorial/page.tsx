import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, HelpCircle, BookOpen, Zap } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-tutorial`;

  const title = "ChatGPT Tutorial: Step-by-Step Guide for 2025";
  const description =
    "Complete ChatGPT tutorial for 2025. Learn how to write effective prompts, use Custom GPTs, set up Custom Instructions, and get real results at work.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT Tutorial — Learn to GPT" }],
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
    title: "Create your ChatGPT account",
    desc: "Go to chat.openai.com and sign up. The free tier gives you access to GPT-4o with usage limits. You don't need ChatGPT Plus to start.",
  },
  {
    num: "2",
    title: "Write your first prompt",
    desc: "Open a new chat and type a specific request. Start narrow: 'Summarize this paragraph in three bullet points' works better than 'Tell me about this topic.' Specificity is the core skill.",
  },
  {
    num: "3",
    title: "Set up Custom Instructions",
    desc: "Go to your profile → Custom Instructions. Add your role, context, and preferred output style. ChatGPT will apply these to every new conversation automatically.",
  },
  {
    num: "4",
    title: "Learn conversation patterns",
    desc: "ChatGPT keeps context within a conversation. Use follow-up prompts to refine: 'Make it shorter,' 'Switch to bullet points,' 'Add a counterargument.' One-shot prompts are a fraction of the power.",
  },
  {
    num: "5",
    title: "Try a Custom GPT",
    desc: "Open the GPT Store and try a Custom GPT built for your field — writing, coding, research, or business analysis. Custom GPTs have specialized instructions baked in.",
  },
  {
    num: "6",
    title: "Build a repeatable workflow",
    desc: "Identify one task you do regularly — weekly reports, email drafts, research summaries — and build a reliable prompt template for it. One good workflow pays the learning cost immediately.",
  },
];

const tips = [
  { title: "Give ChatGPT a role", desc: "Start with 'You are a senior financial analyst...' and watch output quality jump. Role assignment activates specialized language patterns." },
  { title: "Ask for a format", desc: "Specify: 'Give me a numbered list,' 'Format as a table,' or 'Write a JSON object.' ChatGPT defaults to prose — you often want something else." },
  { title: "Use examples", desc: "Show ChatGPT what you want with one or two examples. Few-shot prompting is the fastest way to get consistent, on-format output." },
  { title: "Iterate, don't restart", desc: "Bad first response? Don't start a new chat. Say 'Try again, this time...' and course-correct. ChatGPT remembers the full context." },
];

const faqs = [
  { q: "Is ChatGPT free to use?", a: "Yes. ChatGPT has a free tier with access to GPT-4o. There are usage limits on the free tier — once you hit them, you wait a few hours or upgrade to Plus ($20/month)." },
  { q: "What is ChatGPT best at?", a: "Writing, editing, summarizing, coding, brainstorming, and data analysis. It excels at tasks that require generating, transforming, or evaluating text. It is weaker on real-time data (unless given browsing access) and precise numerical calculations." },
  { q: "How is ChatGPT different from Google?", a: "Google returns links to sources. ChatGPT synthesizes information and generates a direct response. Use Google to find sources you want to verify. Use ChatGPT to process, summarize, and work with information you already have." },
  { q: "What are Custom GPTs?", a: "Custom GPTs are versions of ChatGPT with specific instructions, knowledge files, and API connections baked in. You can build your own or use ones shared in the GPT Store — no coding required for basic Custom GPTs." },
  { q: "How do I get better at using ChatGPT?", a: "The fastest path is structured practice with feedback — which is what Learn to GPT is built for. The key skill is learning to diagnose why a prompt produced a bad result and how to fix it. That pattern recognition is what separates power users from casual users." },
];

export default async function ChatGPTTutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-tutorial`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "ChatGPT Tutorial: How to Use ChatGPT Step by Step",
        description: "A step-by-step guide to getting started with ChatGPT, writing effective prompts, and building professional workflows.",
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Step-by-Step Guide</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            ChatGPT Tutorial: from setup to professional results
          </h1>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            The practical walkthrough for 2025. Account setup, your first prompts, Custom Instructions, Custom GPTs, and the workflow patterns that actually save time at work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              Start the Course Free <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/learn-chatgpt"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              Browse Lessons
            </Link>
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            6-step ChatGPT tutorial
          </h2>
          <div className="space-y-4">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] font-mono font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">
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

      {/* Pro tips */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            4 techniques that immediately improve your results
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {tips.map(({ title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-[#22c55e]" />
                  <h3 className="font-extrabold text-[#1c1917]">{title}</h3>
                </div>
                <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Want interactive practice */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">
              Want to practice, not just read?
            </h2>
            <p className="mb-4 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              This tutorial gives you the concepts. Learn to GPT gives you the reps. Every lesson has a live prompt sandbox so you write real prompts against real scenarios — the kind of practice that actually builds skill.
            </p>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Track 1 (Foundations) and Track 6 (Practitioner Setup) are completely free. Start the interactive version of this tutorial inside the platform.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
            >
              Try It Free <ArrowRight className="size-4" />
            </Link>
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
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Next Steps</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-prompts", label: "ChatGPT Prompts", desc: "Copy-paste prompt templates for real tasks" },
              { href: "/custom-gpts-tutorial", label: "Custom GPTs Tutorial", desc: "Build your first Custom GPT" },
              { href: "/chatgpt-tips", label: "ChatGPT Tips", desc: "Advanced techniques for daily use" },
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

      {/* Footer */}
      <footer className="border-t-[4px] border-[#1c1917] py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-[#1c1917]">
            <span className="text-[#22c55e]">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Curriculum</Link>
            <Link href="/learn-chatgpt" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Learn ChatGPT</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
