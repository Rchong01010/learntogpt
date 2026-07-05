import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, FileText, BarChart3, Lightbulb, Users, Briefcase, MessageSquare } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-non-programmers`;

  const title = "Claude Without Code: How It Compares to ChatGPT for Everyday Work";
  const description =
    "Already using ChatGPT for emails, summaries, and reports? Here's where Claude fits for non-programmers: the tasks it tends to handle better, the ones ChatGPT or Gemini still win, and how to pick by task instead of brand.";

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
          alt: "Claude for Non-Programmers | Learn to GPT",
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

const capabilities = [
  {
    icon: FileText,
    title: "Long-form writing: Claude's lean",
    desc: "Memos, proposals, and reports that need to hold one voice for pages at a time. People who write for a living often find Claude's drafts need less de-robotifying than ChatGPT's defaults. Both improve sharply once you show them examples of your tone. A lean, not a law.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: BarChart3,
    title: "Long documents: Claude's other lean",
    desc: "Feed it a full contract, a board pack, or a month of meeting notes and ask questions across the whole thing. Claude's large context window made its name here. Gemini handles very long inputs too, and ChatGPT's limits keep growing, so test on your own files.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Lightbulb,
    title: "Brainstorming: pick any of the three",
    desc: "Naming a project, generating campaign angles, stress-testing a plan. All three models do this well, and the differences are mostly in how the ideas are organized. If you already have ChatGPT open, there is no reason to switch tabs for this.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: MessageSquare,
    title: "Live research: Gemini and ChatGPT lead",
    desc: "Questions that need current information favor tools wired into search. Gemini leans on Google directly; ChatGPT's browsing is mature. Claude can search the web too, but if your day is lookup-heavy, the other two are the more natural fit.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Briefcase,
    title: "Structuring messy input: a near-tie",
    desc: "Notes into outlines, walls of text into tables, requirements into project plans. Every frontier model imposes structure well. The skill that matters is yours: saying exactly what shape you want the output in.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Users,
    title: "Rewriting for an audience: tone matters",
    desc: "Technical email to plain English, formal to friendly, one language to another. All three handle it; Claude tends to preserve nuance in the rewrite a little more faithfully, which is why editors keep it around even when ChatGPT is their daily driver.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
];

const roleWorkflows = [
  {
    role: "Marketing",
    tasks: "Claude for brand-voice drafts and long positioning docs; ChatGPT for image generation and quick social variants; either for calendars and competitor teardowns.",
  },
  {
    role: "HR and People Ops",
    tasks: "Claude for policy language and sensitive employee comms where wording precision matters; any model for job posts, onboarding checklists, and interview question banks.",
  },
  {
    role: "Finance and Operations",
    tasks: "Claude for digesting long reports and contracts in one pass; ChatGPT's data analysis mode for spreadsheet work; either for process docs and vendor comparisons.",
  },
  {
    role: "Sales",
    tasks: "ChatGPT or Gemini for prospect research that needs live web data; Claude for proposal drafts and call prep built from long email threads and transcripts.",
  },
  {
    role: "Executive and Leadership",
    tasks: "Claude for board narratives and strategy memos that have to read well; Gemini if your decision docs already live in Google Workspace; any model for talking points.",
  },
  {
    role: "Education and Training",
    tasks: "Any of the three for lesson plans, quizzes, and study guides. Claude pulls ahead when you paste a full curriculum or a stack of student work and ask for feedback across it.",
  },
];

const faqItems = [
  {
    q: "I already use ChatGPT. Is Claude worth adding?",
    a: "For most everyday tasks, no single model is worth a religious conversion. Where Claude earns a second tab is long documents and writing that has to sound human. If your work is short prompts, images, or voice, ChatGPT already covers you. Try Claude's free tier on your longest, hardest document and judge from that.",
  },
  {
    q: "Do the free tiers cover non-technical work?",
    a: "Usually. Claude, ChatGPT, and Gemini all offer free tiers with daily limits, and writing, summarizing, and brainstorming sit comfortably inside them. Paid plans buy you heavier usage and the top-end models. Start free on whichever tool fits your task and upgrade only when you hit the ceiling.",
  },
  {
    q: "Which one is safest for sensitive business documents?",
    a: "Check the plan, not the brand. Consumer free tiers across all three providers have looser data terms than their business tiers. If you are pasting contracts or employee data, use a Team or Enterprise plan (or the API) from whichever provider your company approves, and read the current data policy rather than trusting a summary.",
  },
  {
    q: "Is there a learning curve difference between the tools?",
    a: "Not really. All three are chat windows: type what you need, read the reply, refine. The skill that compounds is prompting, and it transfers. Context, format, iteration. Learn it once on any model and you can sit down at the other two without starting over.",
  },
];

export default async function ClaudeForNonProgrammersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-for-non-programmers`;

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
                name: "Claude Without Code: How It Compares to ChatGPT for Everyday Work",
                url: pagePath,
                inLanguage: locale,
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                  },
                })),
              },
              {
                "@type": "WebPage",
                name: "Claude Without Code: How It Compares to ChatGPT for Everyday Work",
                description:
                  "A model-agnostic guide for non-programmers: which everyday tasks favor Claude, which favor ChatGPT or Gemini, and how to pick by task instead of brand.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude for Non-Programmers", item: pagePath },
                ],
              },
            ],
          }),
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b-[4px] border-ink bg-linen">
        <nav>
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
            <Link href="/" className="logo-serif text-[1.75rem] text-ink">
              <span className="text-gpt-green">Learn to</span> GPT
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                {t("nav.curriculum")}
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
                {t("nav.logIn")}
              </Link>
              <Link href="/courses/why-chatgpt/meet-chatgpt" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
                {t("nav.getStarted")}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pb-16 pt-[80px] text-center">
          <div className="mx-auto max-w-[800px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">No Code Required</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude for people who don&apos;t code, next to the tool you already use
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Pick the model by the task, not the logo
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              If you&apos;re a non-programmer using AI at work, odds are you&apos;re already in ChatGPT. The question isn&apos;t whether to abandon it. It&apos;s knowing which everyday tasks Claude handles better, which ones ChatGPT or Gemini still win, and when it&apos;s worth a second browser tab.
            </p>
            <p className="mx-auto mb-10 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              The short version: Claude&apos;s reputation with non-technical users comes from two things, writing that sounds less like a machine and the ability to digest very long documents in one conversation. ChatGPT keeps the edge on images, voice, and its app ecosystem. Gemini wins when your work lives in Google&apos;s stack. Everything below is that decision, task by task.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free Foundations Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/what-is-claude"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                What Is Claude?
              </Link>
            </div>
          </div>
        </section>

        {/* What Claude Can Do Without Code */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Capabilities</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Six everyday tasks, and which model leans ahead</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              All of this happens in a chat window on any of the three tools. No terminal, no IDE. The useful question is where each model&apos;s defaults give you a head start.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {capabilities.map((cap) => (
                <div key={cap.title} className="rounded-[24px] border-[4px] border-ink bg-cream p-[28px_24px] shadow-[4px_4px_0px_#1c1917]">
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${cap.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <cap.icon className={`size-5 ${cap.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1.1rem] font-bold text-ink">{cap.title}</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Workflows for Non-Technical Roles */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">By Role</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Which tool for which job, by role</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              Most teams end up running two models side by side rather than standardizing on one. Here&apos;s a practical split by role, based on where each tool&apos;s defaults help.
            </p>
            <div className="mt-10 space-y-4">
              {roleWorkflows.map((rw) => (
                <div key={rw.role} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{rw.role}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{rw.tasks}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Better Results */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Tips</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Prompting habits that work on every model</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Say who you are and what the output is for</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  A bare &quot;write a follow-up email&quot; produces boilerplate on Claude, ChatGPT, and Gemini alike. Name your role, the recipient, the situation, and the tone you want, and every one of them sharpens up. Context up front means less editing after, whichever tab you typed it into.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Specify the shape of the output</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Ask for a summary and you get a wall of prose. Ask for five bullets under twenty words each, sorted by financial impact, and you get something you can drop straight into Slack. Format instructions are the cheapest quality upgrade in prompting, and no model reads your mind about them.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Refine in place, don&apos;t restart</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Every major chat model keeps the running conversation in view. When a draft misses, give surgical feedback (&quot;more casual,&quot; &quot;cut the second paragraph, expand the third with an example&quot;) instead of re-prompting from zero. Two or three rounds of that usually beats one perfect mega-prompt.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Set up persistent context for repeat work</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Weekly reports, client proposals, and recurring summaries shouldn&apos;t require re-explaining your company every Monday. Claude calls this feature Projects; ChatGPT has Projects and custom instructions; Gemini has Gems. Load your templates and style notes once and the tool carries them into every session.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When You Might Want Claude Code */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Level Up</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">The next step up: agent tools without being a programmer</h2>
            <div className="mt-10 rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
              <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                A growing number of non-programmers run terminal-based AI agents: Anthropic&apos;s Claude Code and OpenAI&apos;s Codex CLI both take plain-English instructions and then read files, run commands, and build things on your machine for you.
              </p>
              <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                Typical non-programmer uses: sorting thousands of files into folders, converting spreadsheets between formats, generating charts from a CSV, or stitching together a small internal tool. The agent writes and runs the code; you describe the outcome and check the result.
              </p>
              <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                The skill barrier is lower than it looks. If you can write a clear request in a chat window, you can drive one of these tools. Claude Code is the more established of the two for this kind of general automation, which is why we cover it here even on a GPT-focused site.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-[#d0f0ea] px-8 py-3 text-[0.95rem] font-bold text-ink shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Learn About Claude Code
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">FAQ</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Frequently asked questions</h2>
            <div className="mt-10 space-y-4">
              {faqItems.map((item) => (
                <div key={item.q} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{item.q}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="A">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Start learning Claude today, free
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Stop reading about it. Build something.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/why-chatgpt/meet-chatgpt"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Free Foundations Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering Course
              </Link>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Explore More</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/what-is-claude", label: "What Is Claude?", desc: "Overview of Claude AI" },
                { href: "/claude-for-writers", label: "Claude for Writers", desc: "AI-assisted writing workflows" },
                { href: "/ai-for-beginners", label: "AI for Beginners", desc: "Start from zero with AI" },
              ].map(({ href, label, desc }) => (
                <Link key={href} href={href} className="rounded-[16px] border-[3px] border-ink bg-cream p-[18px_20px] shadow-[3px_3px_0px_#1c1917] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1917]">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">{label}</div>
                  <p className="text-[0.8rem] leading-[1.5] text-text-secondary">{desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-orange">Explore <ArrowRight className="size-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/learn" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Learn</Link>
            <Link href="/prompt-engineering" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Prompt Engineering</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
