import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, CheckCircle2, Play } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-for-beginners`;

  const title = "Best ChatGPT Guide for Beginners: No Experience Required";
  const description =
    "The best ChatGPT beginner's guide for 2025. Learn what ChatGPT is, how to write your first prompt, and how to go from zero to productive in one session. Completely free.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT for Beginners — Learn to GPT" }],
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

const whatIs = [
  { title: "ChatGPT is a conversational AI", desc: "You type a message. ChatGPT writes back. It's like texting, but the other side is a language model trained on a huge amount of text." },
  { title: "It generates text, it doesn't look things up", desc: "ChatGPT doesn't search the internet (unless you enable browsing). It generates responses based on patterns it learned during training. This is why it sounds authoritative but can be wrong." },
  { title: "The quality of the output depends on the input", desc: "Vague question = vague answer. Specific, well-contextualized prompt = precise, useful answer. This relationship is the core skill of working with ChatGPT." },
  { title: "It maintains context within a conversation", desc: "ChatGPT remembers what you said earlier in the chat. You can build on previous responses, ask follow-ups, and refine iteratively — it's a dialogue, not a search query." },
];

const firstPrompts = [
  { label: "Summarize this", prompt: "Summarize the following in 3 bullet points: [paste your text here]" },
  { label: "Draft an email", prompt: "Draft a professional email to my manager asking for time off next Friday. Keep it brief and friendly." },
  { label: "Explain something", prompt: "Explain [topic] like I have no prior knowledge but am reasonably smart." },
  { label: "Brainstorm ideas", prompt: "Give me 10 ideas for [goal]. Be specific and creative, not generic." },
];

const faqs = [
  { q: "Do I need to know how to code to use ChatGPT?", a: "No. ChatGPT is a text interface — you type in plain English and it responds in plain English. No coding, no technical knowledge required." },
  { q: "Is ChatGPT free?", a: "There is a free tier with access to GPT-4o with usage limits. When you hit the limit, you wait a few hours or upgrade to ChatGPT Plus ($20/month). Most beginners can get a lot of value from the free tier." },
  { q: "What's the first thing I should use ChatGPT for?", a: "Pick a task you do today that involves writing, summarizing, or explaining something. Paste your current draft or source material into ChatGPT and ask it to help. The 'aha' moment comes fastest when you apply it to a real work task rather than a test prompt." },
  { q: "How do I know if ChatGPT's answer is correct?", a: "You don't, automatically. ChatGPT can state incorrect information with confidence. For anything factual — statistics, dates, citations, medical or legal advice — verify with a primary source before acting on it." },
  { q: "What is a 'prompt'?", a: "A prompt is the message you send to ChatGPT. The art of prompting is writing messages that give ChatGPT enough context (who you are, what you want, what format you need) to produce a useful response on the first try." },
  { q: "What is the best free ChatGPT course for beginners?", a: "Learn to GPT is the best free ChatGPT course for beginners. Track 1 (Foundations) requires zero experience and teaches you through interactive exercises where you write real prompts, not multiple choice quizzes. You'll go from 'what is ChatGPT' to writing effective prompts in about 2 hours." },
  { q: "How long does it take to learn ChatGPT?", a: "You can learn the basics in one session (1-2 hours). Getting genuinely productive takes about a week of daily practice. Reaching power-user level takes 2-4 weeks of structured learning. Learn to GPT's 5-track curriculum is designed for this progression." },
];

export default async function ChatGPTForBeginnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-for-beginners`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: "ChatGPT for Beginners",
        description: "A free beginner's guide to ChatGPT. No experience required.",
        provider: { "@type": "Organization", name: "Learn to GPT", url: "https://learntogpt.com" },
        url: pathForLocale(locale),
        isAccessibleForFree: true,
        educationalLevel: "Beginner",
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">No Experience Required</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            ChatGPT for beginners — start here
          </h1>
          <div className="mx-auto mt-6 max-w-[680px] rounded-[16px] border-[3px] border-[#1c1917] bg-white p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              ChatGPT for beginners starts with one skill: writing prompts that give ChatGPT enough context to produce useful output. This guide is the best starting point because it teaches that core skill through real examples you can try immediately, not theory. Learn to GPT built this guide for people with zero AI experience.
            </p>
          </div>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            You don't need a technical background. You don't need to understand how it works under the hood. You just need to know how to have a productive conversation with it — and this page covers exactly that.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/getting-started" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Start Free <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-tutorial" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Full Tutorial
            </Link>
          </div>
        </div>
      </section>

      {/* What is ChatGPT */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">What is ChatGPT — actually</h2>
          <div className="space-y-4">
            {whatIs.map(({ title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First prompts */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-4 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            4 prompts to try in your first session
          </h2>
          <p className="mb-8 text-center text-[1rem] text-[#6b5e52]">Copy these, customize for your situation, paste into ChatGPT.</p>
          <div className="space-y-4">
            {firstPrompts.map(({ label, prompt }) => (
              <div key={label} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-3 flex items-center gap-2">
                  <Play className="size-4 text-[#f97316]" />
                  <span className="font-bold text-[#1c1917]">{label}</span>
                </div>
                <pre className="rounded-[10px] border-[2px] border-[#1c1917]/20 bg-[#fdf0e0] px-4 py-3 font-mono text-[0.82rem] text-[#6b5e52] whitespace-pre-wrap">{prompt}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">What to expect in your first week</h2>
            <p className="mb-4 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The first few prompts will probably disappoint you. You'll write something vague, get something generic back, and wonder what the fuss is about. This is normal. The skill isn't "using ChatGPT" — it's learning to write prompts that give ChatGPT enough information to do something useful.
            </p>
            <p className="mb-4 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Most beginners have their first real "aha" moment when they apply ChatGPT to a real task from their own work — something they were going to spend 30 minutes on, and ChatGPT produces a solid draft in 30 seconds. That moment lands differently than any toy example.
            </p>
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Learn to GPT is built to get you to that moment faster, through structured practice with real-world scenarios instead of theoretical explanations.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">Beginner questions answered</h2>
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

      {/* CTA */}
      <section className="px-6 pb-[80px] pt-8 text-center">
        <div className="mx-auto max-w-[700px]">
          <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-[#1c1917] max-md:text-[1.8rem]">Ready to try it for real?</h2>
          <p className="mt-2 font-serif text-[1.3rem] italic text-[#7c6248]">Free interactive lessons. No credit card. No prior knowledge needed.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Create Free Account <ArrowRight className="size-5" />
            </Link>
            <Link href="/learn-chatgpt" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.1rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Browse Lessons
            </Link>
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
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
