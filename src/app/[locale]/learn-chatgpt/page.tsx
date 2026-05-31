import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, Zap, Star, CheckCircle2, HelpCircle, Play, Trophy } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/learn-chatgpt`;

  const title = "Learn ChatGPT — Free Interactive Lessons";
  const description =
    "Learn ChatGPT from scratch with free interactive lessons. Hands-on exercises, no experience needed. Go from first prompt to professional in 7 guided tracks.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "Learn ChatGPT — Learn to GPT" }],
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

const tracks = [
  { num: "1", title: "Foundations", desc: "How ChatGPT thinks, your first prompts, conversation patterns. Free.", free: true },
  { num: "2", title: "Professional Prompting", desc: "Chain-of-thought, structured output, few-shot techniques, prompt evaluation.", free: false },
  { num: "3", title: "Custom GPTs", desc: "Build your own Custom GPT — system prompts, Actions, knowledge files.", free: false },
  { num: "4", title: "API & Agents", desc: "OpenAI API, tool use, multi-step workflows, production patterns.", free: false },
  { num: "5", title: "Architect", desc: "Evals, monitoring, cost optimization, enterprise deployment.", free: false },
  { num: "6", title: "Practitioner Setup", desc: "Account config, Custom Instructions, GPT Builder basics, daily workflow. Free.", free: true },
];

const reasons = [
  { icon: Play, title: "Hands-on from lesson one", desc: "Every lesson has a live prompt sandbox. You practice, not just read." },
  { icon: Trophy, title: "Gamified progression", desc: "XP, streaks, achievements, and a leaderboard keep you moving forward." },
  { icon: Star, title: "Built around real work", desc: "Lessons are grounded in writing, analysis, coding, and professional tasks — not toy examples." },
  { icon: Zap, title: "Free to start", desc: "Tracks 1 and 6 are completely free. No credit card, no trial period." },
];

const faqs = [
  { q: "How long does it take to learn ChatGPT?", a: "Most learners complete Track 1 (Foundations) in 2-3 hours. Track 6 (Practitioner Setup) takes another 2-3 hours. After those two free tracks, you will have a working mental model and be getting real value from ChatGPT in your daily work." },
  { q: "Do I need a ChatGPT account to start?", a: "You need a free ChatGPT account to practice the exercises — but you can start reading the lessons immediately. We recommend creating your ChatGPT account before lesson 2 so you can follow along." },
  { q: "Is this beginner-friendly?", a: "Track 1 is designed for zero prior experience. No coding, no technical background, no prior AI knowledge required. If you can use Google, you can start here." },
  { q: "What makes Learn to GPT different from YouTube tutorials?", a: "Passive video watching doesn't build skills. Learn to GPT is built around active exercises — you write real prompts in a live sandbox, see immediate results, and progress through structured tracks. The gamification keeps you accountable." },
  { q: "Is ChatGPT free?", a: "ChatGPT has a free tier with access to GPT-4o (with usage limits). ChatGPT Plus costs $20/month and removes limits. Learn to GPT's free tracks work with the free ChatGPT tier." },
];

export default async function LearnChatGPTPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/learn-chatgpt`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: "Learn ChatGPT — Interactive Course",
        description: "Free interactive course to learn ChatGPT from scratch. Covers foundations, professional prompting, Custom GPTs, and the OpenAI API.",
        provider: { "@type": "Organization", name: "Learn to GPT", url: "https://learntogpt.com" },
        url: pathForLocale(locale),
        isAccessibleForFree: true,
        inLanguage: locale,
        educationalLevel: "Beginner to Advanced",
        teaches: ["ChatGPT prompting", "Custom GPTs", "OpenAI API", "AI workflow automation"],
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          instructor: { "@type": "Organization", name: "Learn to GPT" },
        },
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">
            Free Interactive Course
          </p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            Learn ChatGPT — from first prompt to professional
          </h1>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Structured, gamified lessons that teach you how to actually use ChatGPT at work. Not theory. Hands-on exercises with a live prompt sandbox in every lesson. Start free — no credit card.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              Start Learning Free <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
            >
              Browse Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* Why Learn ChatGPT */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-4 text-[2rem] font-extrabold leading-[1.2] text-[#1c1917] text-center">
            Why learning ChatGPT is worth your time
          </h2>
          <p className="mb-8 text-center text-[1.05rem] leading-[1.7] text-[#6b5e52]">
            ChatGPT is the most-used AI tool in the world — but most people only use 10% of what it can do. Knowing how to direct it precisely is the difference between a generic response and one that saves you two hours.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] shadow-[2px_2px_0px_#1c1917]">
                  <Icon className="size-4 text-white" />
                </div>
                <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-2 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            7 tracks. From zero to ChatGPT power user.
          </h2>
          <p className="mb-8 text-center text-[1rem] text-[#6b5e52]">Tracks 1 and 6 are free. No credit card required.</p>
          <div className="space-y-4">
            {tracks.map(({ num, title, desc, free }) => (
              <div key={num} className="flex items-start gap-4 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-5 shadow-[3px_3px_0px_#1c1917]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] font-mono font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">
                  {num}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-extrabold text-[#1c1917]">{title}</span>
                    {free && (
                      <span className="rounded-full border-[2px] border-[#1c1917] bg-[#22c55e] px-2 py-0.5 text-[0.7rem] font-bold text-white">Free</span>
                    )}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/curriculum" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
              View Full Curriculum <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Common questions about learning ChatGPT
          </h2>
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

      {/* Related pages */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Keep Exploring</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-tutorial", label: "ChatGPT Tutorial", desc: "Step-by-step guide to getting real results" },
              { href: "/chatgpt-for-beginners", label: "ChatGPT for Beginners", desc: "No-experience-required starting guide" },
              { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Advanced techniques for precise output" },
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

      {/* CTA */}
      <section className="px-6 pb-[80px] pt-8 text-center">
        <div className="mx-auto max-w-[700px]">
          <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-[#1c1917] max-md:text-[1.8rem]">
            Ready to actually learn ChatGPT?
          </h2>
          <p className="mt-2 font-serif text-[1.3rem] italic text-[#7c6248]">Free. No credit card. Start in 60 seconds.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Create Free Account <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-tutorial" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.1rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              View Tutorial
            </Link>
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
            <Link href="/chatgpt-tutorial" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">ChatGPT Tutorial</Link>
            <Link href="/for-teams" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">For Teams</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
