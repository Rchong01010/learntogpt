import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, MessageSquare, Lightbulb, Zap, Shield, Star, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-for-beginners`;

  const title = "Best AI for Beginners — Start Learning ChatGPT & Claude Free";
  const description =
    "Complete beginner's guide to AI. What is AI, how does it actually work, why ChatGPT is the best place to start, and your first steps. No technical background required.";

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
          alt: "AI for Beginners — Learn to GPT",
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

const misconceptions = [
  {
    myth: "You need to know how to code",
    reality: "The most valuable AI skills — clear communication, task structuring, output evaluation — have nothing to do with code. Non-technical users often adapt faster because they focus on what they want, not how the model works.",
  },
  {
    myth: "AI will replace your job",
    reality: "The more likely outcome: people who know how to work with AI will outproduce, and eventually outcompete, those who don't. Learning AI is a hedge, not a threat to navigate.",
  },
  {
    myth: "You need to understand machine learning",
    reality: "You don't need to know gradient descent to drive a car. Understanding how to direct AI effectively requires the same intuition as giving clear instructions to a highly capable but literal-minded colleague.",
  },
  {
    myth: "AI is just fancy autocomplete",
    reality: "Modern frontier models like ChatGPT can reason through multi-step problems, synthesize information across long documents, write functional code, and iterate on outputs based on feedback. That's qualitatively different from autocomplete.",
  },
];

const firstSteps = [
  {
    icon: MessageSquare,
    step: "1",
    title: "Have your first real conversation",
    desc: "Open claude.ai and ask it to help with something you actually need today — summarize an article, draft an email, explain a concept. Don't test it with trick questions. Use it on a real task and notice what works.",
  },
  {
    icon: Lightbulb,
    step: "2",
    title: "Learn why some prompts work better than others",
    desc: "The most impactful skill you can develop early is writing clear, specific instructions. 'Write me an email' produces generic output. 'Write a 3-paragraph follow-up email to a job application for a marketing manager role, professional but warm tone' produces something useful.",
  },
  {
    icon: BookOpen,
    step: "3",
    title: "Take the foundations track",
    desc: "Learn to GPT's Track 1 (Foundations) is built for absolute beginners. It covers how ChatGPT thinks, what context is and why it matters, how to have effective conversations, and how to get consistent results. Free, interactive, no sign-up required for first lessons.",
  },
  {
    icon: Zap,
    step: "4",
    title: "Apply it to something you care about",
    desc: "The fastest learners are people who apply AI to problems they already understand well. If you work in HR, use ChatGPT for job descriptions and interview prep. If you're a student, use it for research and essay outlining. The domain knowledge you already have becomes a superpower.",
  },
];

const whatAiIs = [
  {
    title: "A very capable reader and writer",
    desc: "ChatGPT has read an enormous amount of text — books, articles, code, research papers, conversations — and learned patterns of language and reasoning from that exposure. It can read what you write and produce relevant, coherent responses.",
  },
  {
    title: "A reasoning engine, not a search engine",
    desc: "Unlike Google, ChatGPT doesn't look things up in a database when you ask a question. It reasons through the answer based on what it learned during training. This makes it excellent for analysis and synthesis, and means you should verify specific facts from authoritative sources.",
  },
  {
    title: "A tool that needs direction",
    desc: "ChatGPT is extraordinarily capable but not telepathic. The quality of what you get out is directly related to the quality of what you put in. Clear context, specific instructions, and explicit success criteria consistently produce better results than vague prompts.",
  },
  {
    title: "A system with real limitations",
    desc: "ChatGPT's training has a knowledge cutoff date, so it may not know about very recent events. It can make errors, especially on specific facts, numbers, and niche topics. Treat its outputs as a very capable first draft that benefits from your domain expertise and verification.",
  },
];

export default async function AIForBeginnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-for-beginners`;

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
                "@type": "WebPage",
                name: "AI for Beginners: Start Here. No Experience Needed.",
                description:
                  "Complete beginner's guide to AI. What is AI, how does it work, why ChatGPT is the best place to start, and your first steps.",
                url: pathForLocale(locale),
                inLanguage: locale,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "Course",
                name: "AI for Beginners — Learn to GPT Foundations Track",
                description:
                  "The beginner track at Learn to GPT. Learn AI from scratch — no technical background required. Interactive exercises, gamified progression, free to start.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                educationalLevel: "Beginner",
                teaches: [
                  "What artificial intelligence is",
                  "How large language models work",
                  "How to write effective prompts",
                  "Getting consistent results from AI",
                  "Applying AI to real work tasks",
                ],
                inLanguage: locale,
                url: pathForLocale(locale),
                image: `${baseUrl}/og-default.png`,
                hasCourseInstance: [
                  { "@type": "CourseInstance", courseMode: "online" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "AI for Beginners", item: pathForLocale(locale) },
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
              <Link
                href="/curriculum"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden"
              >
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                Log In
              </Link>
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="px-6 pb-16 pt-[100px] text-center">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Star className="size-4" />
              No prerequisites · Start in 5 minutes
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Start Using AI Today — No Experience Needed
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              No experience needed. No math. No code. Just start.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              If you feel behind on AI — like everyone around you is using it and you&apos;re not sure where to even begin — this is where to start. No jargon, no prerequisites, no assumed knowledge. Just a clear-eyed introduction to what AI actually is, why it matters, and how to start getting real value from it today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Getting Started Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                The best AI for beginners is whichever tool you start using for real work. ChatGPT and Claude are both excellent starting points. The core skill is writing clear instructions (prompts) in plain language. If you can write an email, you can use AI productively within your first session.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT AI ACTUALLY IS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              The Basics
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              What AI actually is (and isn&apos;t)
            </h2>
            <div className="space-y-4">
              {whatAiIs.map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]"
                >
                  <h3 className="mb-2 font-extrabold text-ink">{title}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISCONCEPTIONS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Common Misconceptions
            </p>
            <h2 className="mt-3 mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Things that stop people from starting
            </h2>
            <div className="space-y-5">
              {misconceptions.map(({ myth, reality }) => (
                <div
                  key={myth}
                  className="overflow-hidden rounded-[18px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="flex items-center gap-3 border-b-[2px] border-ink/20 bg-linen px-6 py-4">
                    <span className="shrink-0 rounded-full border-[2px] border-ink bg-cream px-2 py-0.5 font-mono text-[0.72rem] font-bold text-text-secondary line-through">
                      Myth
                    </span>
                    <span className="font-semibold text-text-secondary">{myth}</span>
                  </div>
                  <div className="flex items-start gap-3 px-6 py-4">
                    <Shield className="mt-0.5 size-4 shrink-0 text-orange" />
                    <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{reality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CLAUDE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Why ChatGPT is the right AI to start with
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                ChatGPT is built by OpenAI with a specific focus on being helpful, harmless, and honest. For beginners, this matters: ChatGPT tends to say when it&apos;s uncertain, explain its reasoning when asked, and resist confidently making things up. These properties make it a safer and more educational tool for someone learning how AI works.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                ChatGPT is also extraordinarily good at long documents. You can paste in a 50-page report and get a structured summary. You can share an entire research paper and have a back-and-forth about it. For most learning and professional use cases, this depth of comprehension is uniquely valuable.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                And for beginners specifically: ChatGPT is patient, articulate, and adapts to your level. Tell it you&apos;re new to a topic and it will explain differently. Ask it to simplify and it will. That responsiveness makes the early learning curve much gentler.
              </p>
            </div>
          </div>
        </section>

        {/* FIRST STEPS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Your Roadmap
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Your first four steps into AI
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {firstSteps.map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={step}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[4px_4px_0px_#1c1917]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full border-[3px] border-ink bg-orange font-mono text-[0.9rem] font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">
                      {step}
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-4 text-orange" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-[1.05rem] font-extrabold text-ink">{title}</h3>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE HONEST PICTURE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#ffecd2] p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                What to expect in your first week
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The first few times you use AI, you&apos;ll probably be underwhelmed. You&apos;ll write a vague prompt, get a generic response, and wonder what the fuss is about. That&apos;s normal. The learning curve is in understanding how to direct AI effectively — which is what Learn to GPT is built to teach.
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                Within a week of regular use and a few focused lessons, most people hit a moment where something clicks — where they ask ChatGPT something and the response is so useful it feels almost unfair. That moment is what we&apos;re trying to get you to, as fast as possible.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                Be patient with the early friction. The skill compounds quickly once it starts.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: "What is the best AI for beginners?", a: "ChatGPT and Claude are both excellent for beginners. ChatGPT has the largest user base and plugin ecosystem. Claude excels at instruction-following and long document analysis. Learn to GPT teaches ChatGPT; Claude Academy teaches Claude." },
                { q: "Do I need technical skills to learn AI?", a: "No. Both Learn to GPT and Claude Academy start with zero prerequisites. You learn by writing prompts in natural language and building practical workflows." },
                { q: "How long does it take to learn AI basics?", a: "You can be productively using AI in 2-3 hours with Track 1 (Foundations). Reaching power-user level takes 2-4 weeks of daily practice." },
                { q: "Is AI hard to learn?", a: "Using AI tools is not hard. The core skill is writing clear instructions in plain language. Mastering advanced techniques takes practice, but basics are accessible to everyone on day one." },
              ].map((item) => (
                <div key={item.q} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-teal" />
                    <h3 className="text-[1rem] font-bold text-ink">{item.q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Start your first lesson — free
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Track 1 requires zero prior knowledge. First two tracks are completely free.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Getting Started Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/getting-started", label: "Getting Started", desc: "Step-by-step first session walkthrough" },
                { href: "/learn", label: "Course Catalog", desc: "All 7 tracks from beginner to expert" },
                { href: "/learn-ai", label: "Learn AI", desc: "Why ChatGPT is the best way to start" },
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
