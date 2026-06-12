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

  const title = "Claude for Non-Programmers: Use AI Without Writing Code";
  const description =
    "You don't need to write code to use Claude effectively. Claude excels at writing, analysis, research, brainstorming, and organizing information — skills that help anyone in any role work faster.";

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
          alt: "Claude for Non-Programmers — Learn to GPT",
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
    title: "Writing and editing",
    desc: "Draft emails, reports, proposals, blog posts, or any professional document. Claude matches your tone when you give it examples. Ask it to edit for clarity, shorten a long memo, or rewrite something for a different audience.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: BarChart3,
    title: "Summarizing and analyzing",
    desc: "Paste a 50-page PDF, a long email thread, or meeting notes. Claude reads the full text and gives you the key points, action items, or a structured summary. Its 200K context window means it can process entire reports in one pass.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Lightbulb,
    title: "Brainstorming and ideation",
    desc: "Need 20 campaign ideas? A name for a new initiative? Angles for a presentation? Claude generates diverse, structured options — not just the obvious ones. Then you pick, combine, and refine.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: MessageSquare,
    title: "Research and Q&A",
    desc: "Ask Claude to explain a concept, compare options, or break down a complex topic. It draws on broad training data to give you clear, structured answers. Paste articles or data and ask specific questions about them.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Briefcase,
    title: "Organizing and formatting",
    desc: "Turn messy notes into a clean outline. Convert a wall of text into a table. Build a project plan from a list of requirements. Claude is excellent at imposing structure on unstructured information.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Users,
    title: "Communication and translation",
    desc: "Rewrite a technical email for a non-technical audience. Adjust the formality of a message. Translate between languages while preserving nuance. Claude adapts content for different readers without losing the core message.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
];

const roleWorkflows = [
  {
    role: "Marketing",
    tasks: "Campaign copy, social media posts, email sequences, brand voice documents, competitive analysis summaries, content calendars",
  },
  {
    role: "HR and People Ops",
    tasks: "Job descriptions, policy drafts, onboarding checklists, performance review templates, interview questions, employee communications",
  },
  {
    role: "Finance and Operations",
    tasks: "Report summaries, data interpretation, process documentation, meeting minutes, vendor comparison matrices, compliance checklists",
  },
  {
    role: "Sales",
    tasks: "Prospect research, outreach personalization, proposal drafts, objection handling scripts, call prep notes, follow-up emails",
  },
  {
    role: "Executive and Leadership",
    tasks: "Board deck narratives, strategic analysis, stakeholder communications, decision frameworks, town hall talking points, initiative briefs",
  },
  {
    role: "Education and Training",
    tasks: "Lesson plans, assessment questions, study guides, curriculum outlines, feedback on student work, learning objective frameworks",
  },
];

const faqItems = [
  {
    q: "Is the free tier enough for non-programmers?",
    a: "Yes. Claude's free tier gives you access to the conversational interface with generous daily limits. For most writing, analysis, and brainstorming tasks, the free tier is sufficient. You only need a paid plan for heavy daily usage or access to the most powerful models.",
  },
  {
    q: "Is my data private when I use Claude?",
    a: "Anthropic does not train on your conversations by default. In the API and Team/Enterprise plans, your data is never used for training. On the free consumer plan, you can opt out of data usage in your privacy settings. For sensitive business documents, use Claude's Team or Enterprise tier.",
  },
  {
    q: "How steep is the learning curve?",
    a: "Most people get useful results within their first conversation. The interface is a chat window — you type what you need, Claude responds. The learning curve is about getting better results, not figuring out how to use the tool. Start with simple requests and add specificity as you learn what works.",
  },
  {
    q: "How is Claude different from ChatGPT for non-coders?",
    a: "Claude tends to follow complex, multi-part instructions more reliably. It also has a 200K token context window (roughly 150,000 words), so it can read and analyze much longer documents in a single conversation. Many users report that Claude produces more natural-sounding writing with less of the 'AI voice' that other tools default to.",
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
                name: "Claude for Non-Programmers: Use AI Without Writing Code",
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
                name: "Claude for Non-Programmers: Use AI Without Writing Code",
                description:
                  "You don't need to write code to use Claude effectively. Learn the workflows, prompts, and techniques that help anyone in any role work faster with AI.",
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
              Get More Done with AI — No Coding Required
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Powerful AI that works through plain conversation
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              You don&apos;t need to write code to use Claude effectively. Claude excels at writing, analysis, research, brainstorming, and organizing information — skills that help anyone in any role work faster. If you can describe what you need in plain language, you can use Claude.
            </p>
            <p className="mx-auto mb-10 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Most AI tools are marketed to developers. Claude is different. While it has powerful coding capabilities, its core strength is understanding and generating natural language — which means it&apos;s just as useful for a marketing manager, HR director, or financial analyst as it is for a software engineer. Here&apos;s how.
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
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What Claude can do without code</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              Every one of these workflows happens through plain conversation. You type what you need, Claude responds. No terminal, no IDE, no programming language.
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
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Real workflows for non-technical roles</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              Claude isn&apos;t a generic chatbot that gives you the same bland answers regardless of context. When you tell Claude your role, your audience, and your constraints, it tailors its output accordingly. Here&apos;s what that looks like in practice.
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
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Getting better results from Claude</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Give Claude context about who you are and what you need</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Instead of &quot;write a follow-up email,&quot; try &quot;I&apos;m an account manager at a B2B SaaS company. Write a follow-up email to a prospect who attended our demo yesterday but hasn&apos;t responded to my recap email. Tone: professional but warm, not pushy.&quot; The more context you provide, the less editing you do afterward.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Be specific about format and length</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  &quot;Summarize this report&quot; gives you a wall of text. &quot;Summarize this report in 5 bullet points, each under 20 words, focusing on financial impact&quot; gives you something you can paste into a Slack message. Tell Claude exactly how you want the output structured — bullets, tables, numbered lists, headers, or plain paragraphs.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Iterate instead of starting over</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude remembers your entire conversation. If the first draft isn&apos;t right, don&apos;t re-prompt from scratch. Say &quot;Make the tone more casual&quot; or &quot;Cut paragraphs 2 and 4, expand paragraph 3 with specific examples.&quot; Each round of feedback gets you closer to what you need, and Claude learns your preferences within the conversation.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Use Claude Projects for recurring work</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  If you do the same type of work repeatedly — weekly reports, client proposals, meeting summaries — create a Claude Project with your templates, style guides, and preferences as project knowledge. Claude will reference these documents in every conversation within that project, so you don&apos;t have to re-explain your context every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When You Might Want Claude Code */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Level Up</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">When you might want Claude Code</h2>
            <div className="mt-10 rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
              <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                Here&apos;s a secret: even non-programmers can use Claude Code (Anthropic&apos;s command-line tool) for automation tasks. Claude Code can read your files, run commands, and build things — and you tell it what to do in plain English.
              </p>
              <p className="mb-4 text-[0.9rem] leading-[1.6] text-text-secondary">
                Examples that non-programmers have used Claude Code for: organizing thousands of files into folders, converting spreadsheets between formats, building simple internal tools, creating data visualizations, and automating repetitive file operations.
              </p>
              <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                You don&apos;t need to know how to code — you need to know how to describe what you want. Claude Code writes and runs the code for you. It&apos;s the bridge between &quot;I wish I could automate this&quot; and actually automating it.
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
              Start learning Claude today — free
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
