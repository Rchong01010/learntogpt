import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, PenLine, Lightbulb, RefreshCw, Microscope, BookOpen, MessageSquare } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-writers`;

  const title = "Claude for Writers: When to Use It Over ChatGPT for Writing";
  const description =
    "A writer's guide to Claude: where it beats ChatGPT for drafting, editing, and voice-matching, where it doesn't, and the model-agnostic workflows that make any AI a better writing partner.";

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
          alt: "Claude for Writers | Learn to GPT",
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

const writingWorkflows = [
  {
    icon: Lightbulb,
    title: "Brainstorming and ideation",
    desc: "Ask for angles in bulk and force variety: personal essay, data piece, satire, reported feature. The spread is the value; your judgment does the picking. Claude and ChatGPT are equally good sparring partners here.",
    prompt: "I'm writing about [topic]. Pitch me a dozen takes a bored editor hasn't seen. One line each: the claim, who it's for, and why the usual version of this piece fails.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: PenLine,
    title: "First draft generation",
    desc: "Hand over the outline, the thesis, and a sample of how you actually write, and let the model produce the ugly first version. Its job is momentum, not the finish. Writers who like Claude here like it for sounding less templated out of the gate.",
    prompt: "Below: my outline and two samples of my writing. Produce a rough opening section arguing [thesis]. Keep the claim sharp, skip any throat-clearing intro, and leave TODO markers where you'd want a real anecdote from me.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: RefreshCw,
    title: "Structural editing",
    desc: "Before line edits, get a diagnosis of the skeleton: where the argument sags, what earns its place, what a ruthless cut list looks like. Any frontier model plays structural editor well if you ask for verdicts instead of compliments.",
    prompt: "Act as a structural editor who bills by the minute. For this draft: name the load-bearing paragraphs, the ones you'd cut tonight, the point where a reader quits, and the one missing move that would fix the piece.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Microscope,
    title: "Line editing and polish",
    desc: "Line editing is where AI most wants to sand your voice into oatmeal, so the instructions carry the whole job. Name what's off-limits (your vocabulary, your deliberate rule-breaking) and demand a change log. Constraints beat brand choice here.",
    prompt: "Tighten this passage. Off-limits: my word choices, sentence fragments I used on purpose, and the rhythm of the last line. Return two things: the edited text, and a list of every change with a one-word reason.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: BookOpen,
    title: "Research synthesis",
    desc: "For essays and features built on sources, dump the whole reading pile into one conversation. Claude's context window is the reason writers pick it for this; a stack of PDFs that would need chunking elsewhere fits in one pass.",
    prompt: "Here are my sources for a piece on [topic]. Build me: the consensus in two sentences, the live disagreements with who's on each side, and the three facts most likely to surprise a general reader. Cite by source name.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: MessageSquare,
    title: "Voice-matching and ghostwriting",
    desc: "Feed it enough of your published work and the model can draft in a credible imitation of you. More sample text means a better forgery. Useful for newsletters and ghostwritten posts; always do the final read yourself, since the misses are subtle.",
    prompt: "Study the writing samples below until you can describe my style in five concrete rules. State the rules first. Then apply them to draft [content type] about [topic], and flag the two sentences you're least confident sound like me.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const voiceTips = [
  {
    title: "Show the model your writing, don't describe it",
    body: "\"I write in a clear, direct style\" tells any AI nothing. Paste three to five paragraphs of your best work. The model reads the actual patterns (sentence length, vocabulary, rhythm, structural habits) and matches those. This works the same on Claude and ChatGPT.",
  },
  {
    title: "Be specific about what NOT to change",
    body: "\"Edit for clarity\" is vague. \"Edit for clarity. Keep my vocabulary. Don't add em dashes. Don't insert transitions I haven't written.\" Constraints are what separate an edit that helps from one that quietly overwrites your voice, on every model.",
  },
  {
    title: "Use AI for the draft, not the final version",
    body: "The reliable workflow: the model produces a rough first draft, you rewrite it in your voice. You get structure and substance faster and keep the part only you can add. The output stays yours; the AI is scaffolding, whichever one you use.",
  },
  {
    title: "Ask for several versions, not one",
    body: "\"Give me three openings: one that starts with a scene, one with an argument, one with data.\" Pick the strongest and develop it. You spend your energy choosing and refining instead of generating from a blank page. A model-agnostic habit worth keeping.",
  },
];

const contentTypes = [
  { type: "Essays & articles", desc: "Angle-hunting, skeleton edits, headline batches to test" },
  { type: "Newsletters", desc: "Recurring voice held issue to issue via saved style context" },
  { type: "Books & long-form", desc: "Claude's lane: whole-manuscript continuity and timeline checks" },
  { type: "Scripts & screenplays", desc: "Table-reading dialogue aloud, beat logic, pacing passes" },
  { type: "Email campaigns", desc: "Variant generation in bulk; your send data picks winners" },
  { type: "Social media", desc: "One idea recut per platform; ChatGPT adds the image side" },
  { type: "Speeches & talks", desc: "Spoken-rhythm drafts, callback structure, cut-to-time passes" },
  { type: "Academic writing", desc: "Source synthesis and counterargument stress-testing, never uncited claims" },
];

export default async function ClaudeForWritersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-for-writers`;

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
                name: "Claude for Writers: When to Use It Over ChatGPT",
                description:
                  "A writer's guide to where Claude beats ChatGPT for drafting, editing, and voice-matching, plus the model-agnostic workflows that make any AI a better writing partner.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "Course",
                name: "Writing with Claude",
                description:
                  "Learn to use Claude AI as a professional writing assistant: brainstorming, drafting, editing, voice-matching, and research synthesis.",
                provider: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                isAccessibleForFree: true,
                inLanguage: locale,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude for Writers", item: pagePath },
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
              <Link href="/courses/essentials/make-claude-sound-like-you" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">For Writers & Content Creators</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude for Writers: When It Beats ChatGPT (and When It Doesn&apos;t)
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Brainstorm partner, structural editor, research synthesizer
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Among writers who use AI daily, Claude has a reputation for drafts that hold a voice and for honest editing. It won&apos;t write the piece for you, but it makes every stage faster without flattening how you sound. If ChatGPT is already your default, this is where Claude tends to earn a second tab, and the workflows below work on either.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Writing Prompt Templates
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

        {/* Why Claude for writing */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Claude vs ChatGPT for Writing</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Where Claude tends to help writers most</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Long documents in one pass</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Paste an entire manuscript, a stack of research, or a year of newsletters and Claude reasons across the whole thing. That&apos;s useful for consistency checks and structural feedback on book-length work. ChatGPT can take long inputs too now, but on the biggest documents Claude is still the more comfortable pick.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Critique that isn&apos;t just flattery</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Every model has a tendency to tell you your draft is great. Claude is a bit more willing to say what&apos;s weak when you explicitly ask it to be a tough editor. It&apos;s a lean, not a guarantee, and you can push ChatGPT the same direction with a firm prompt. The point is to ask for the hard read on purpose.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">And where ChatGPT still wins</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  If your writing work touches images, a voice-dictated first draft, or a specific publishing integration, ChatGPT&apos;s built-in tools are the faster route. This isn&apos;t Claude-versus-the-world; it&apos;s picking the right tab for the task, which is exactly the habit worth building.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Writing workflows */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Workflows</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Six writing workflows, with prompts</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {writingWorkflows.map((wf) => (
                <div key={wf.title} className="rounded-[24px] border-[4px] border-ink bg-cream p-[28px_24px] shadow-[4px_4px_0px_#1c1917]">
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${wf.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <wf.icon className={`size-5 ${wf.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1.1rem] font-bold text-ink">{wf.title}</div>
                  <p className="mb-4 text-[0.88rem] leading-[1.6] text-text-secondary">{wf.desc}</p>
                  <div className="rounded-[8px] border-[2px] border-ink/30 bg-linen p-3">
                    <p className="font-mono text-[0.75rem] italic leading-[1.5] text-text-secondary">{wf.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice tips */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Voice Preservation</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">How to keep your voice when working with AI</h2>
            <div className="mt-10 space-y-4">
              {voiceTips.map((tip, i) => (
                <div key={i} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{tip.title}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content types grid */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Content Types</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What Claude helps writers create</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contentTypes.map((ct) => (
                <div key={ct.type} className="rounded-[16px] border-[3px] border-ink bg-cream p-[18px_20px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">{ct.type}</div>
                  <p className="text-[0.8rem] leading-[1.5] text-text-secondary">{ct.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Start with free writing courses
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Hands-on exercises for writers. No credit card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Prompt Templates
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering
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
                { href: "/best-claude-prompts", label: "Best Prompts", desc: "20 copy-paste writing templates" },
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Advanced prompting techniques" },
                { href: "/learn", label: "Free Courses", desc: "Interactive Claude lessons" },
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
            <Link href="/best-claude-prompts" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Best Prompts</Link>
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
