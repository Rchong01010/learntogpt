import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Copy } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/best-claude-prompts`;

  const title = "20 Best Claude Prompts: Templates for Writing, Code & Analysis";
  const description =
    "The 20 best Claude prompt templates across writing, coding, analysis, and research. Copy-paste ready with examples. Learn prompt engineering at Learn to GPT.";

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
          alt: "Best Claude Prompts — Learn to GPT",
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

const promptCategories = [
  {
    label: "Writing",
    color: "teal",
    bgColor: "#d0f0ea",
    prompts: [
      {
        title: "Voice-matching editor",
        prompt:
          "Here are three examples of my writing: [paste examples]. Now rewrite the following draft so it matches my voice exactly — same sentence rhythm, vocabulary level, and tone. Do not add em dashes, clichés, or a summary paragraph at the end.\n\nDraft: [paste draft]",
        why: "Prevents Claude from defaulting to generic AI prose. The examples anchor the output to your actual style.",
      },
      {
        title: "Long-form outline",
        prompt:
          "I'm writing a [article/report/essay] on [topic] for [audience]. Create a detailed outline with: a working headline, 5-7 section headings, 3-4 bullet points per section with the key point each should make, and a note on what evidence or examples to include.",
        why: "Structured output request forces Claude to organize the content before writing it — saves significant revision time.",
      },
      {
        title: "Email with a clear ask",
        prompt:
          "Write a [tone: professional/friendly/direct] email to [recipient] asking them to [action]. Context: [1-2 sentences of background]. The email should be under 150 words. End with a specific CTA, not an open-ended question.",
        why: "The word limit and CTA constraint prevent the vague, padded emails Claude produces by default.",
      },
      {
        title: "Content repurpose",
        prompt:
          "I have this [blog post / transcript / report]: [paste content]. Repurpose it into: (1) a LinkedIn post under 200 words, (2) three tweet-length takeaways, (3) a TL;DR paragraph for email. Match the original's tone.",
        why: "One source, three formats — saves an hour of reformatting per piece.",
      },
    ],
  },
  {
    label: "Coding",
    color: "orange",
    bgColor: "#ffecd2",
    prompts: [
      {
        title: "Code review with criteria",
        prompt:
          "Review this [language] code for: security issues (injection, auth, data exposure), performance bottlenecks, missing error handling, TypeScript type errors, and anything that would fail a production code review. Be specific about line numbers and what to fix.\n\n[paste code]",
        why: "Explicit criteria prevent vague 'looks good' reviews. Claude will surface real issues when you tell it what to look for.",
      },
      {
        title: "Bug hunt with reproduction",
        prompt:
          "I have a bug in my [framework/language] code. Here's what's happening: [describe symptom]. Here's what I expect to happen: [expected behavior]. Here's the relevant code: [paste code]. Walk through what's causing this, then give me the fix.",
        why: "Expected vs actual behavior framing forces systematic diagnosis instead of guessing.",
      },
      {
        title: "Function with tests",
        prompt:
          "Write a [language] function that [description of what it does]. Requirements: [list requirements]. Include: input validation, error handling, JSDoc comments, and a test suite using [Jest/Pytest/etc] that covers the happy path, edge cases, and error cases.",
        why: "Asking for tests alongside the function ensures Claude writes testable code — not just code that runs.",
      },
      {
        title: "Refactor for readability",
        prompt:
          "Refactor this code to be more readable and maintainable without changing behavior. Apply: extract repeated logic into named functions, replace magic numbers with named constants, improve variable names, add comments only where the why isn't obvious.\n\n[paste code]",
        why: "The 'without changing behavior' constraint is critical — it prevents Claude from helpfully 'improving' logic.",
      },
    ],
  },
  {
    label: "Analysis",
    color: "teal",
    bgColor: "#d0f0ea",
    prompts: [
      {
        title: "Document summary with key decisions",
        prompt:
          "Summarize this [document type] in three layers: (1) one-sentence TL;DR, (2) 5 key points with supporting evidence, (3) decisions or actions required from the reader. Be direct — no filler phrases like 'The document explores...'\n\n[paste document]",
        why: "Three-layer summary forces Claude to separate signal from noise and surface the actionable content.",
      },
      {
        title: "Competitive analysis",
        prompt:
          "Compare [Company A] and [Company B] across: pricing, target customer, key features, positioning, known weaknesses, and recent moves. Format as a table. End with: which one wins for [my use case] and why.",
        why: "Table format with a winner forces Claude to make a judgment call rather than presenting 'both have pros and cons.'",
      },
      {
        title: "Data interpretation",
        prompt:
          "Here's a dataset: [paste data or describe it]. Tell me: (1) what's the most important trend or anomaly, (2) what's missing that would change the interpretation, (3) what decisions this data does and does not support. Be specific.",
        why: "Asking for what the data doesn't support is the critical question — prevents overconfident conclusions.",
      },
      {
        title: "Risk analysis",
        prompt:
          "Analyze the risks of [decision / project / plan]: list each risk, rate it High/Medium/Low probability and High/Medium/Low impact, describe what would trigger it, and suggest one mitigation for each High-rated risk. Format as a table.",
        why: "Probability × impact matrix forces prioritization instead of a flat list of every possible concern.",
      },
    ],
  },
  {
    label: "Research",
    color: "orange",
    bgColor: "#ffecd2",
    prompts: [
      {
        title: "Explain a complex topic",
        prompt:
          "Explain [topic] to me as if I'm [level: a smart 12-year-old / a business person with no technical background / an expert in a related field]. Use analogies. Avoid jargon unless you define it. End with the three things I'd most likely misunderstand about this topic.",
        why: "The misunderstanding section is the most valuable part — it surfaces the non-obvious gaps in most explanations.",
      },
      {
        title: "Research synthesis",
        prompt:
          "I'm researching [topic]. Here are my sources: [paste excerpts or notes]. Synthesize what they agree on, where they disagree and why, what questions they leave unanswered, and what the strongest current consensus seems to be.",
        why: "Synthesis across sources is where Claude adds value — not just summarizing each one individually.",
      },
      {
        title: "Devil's advocate",
        prompt:
          "I believe [position]. Give me the strongest possible case against my position — not strawmen, but the actual best arguments. Assume the person arguing against me is smart and well-informed. End with which counter-argument I should take most seriously.",
        why: "Explicitly asking for the best counterargument prevents Claude from generating token-friendly agreement.",
      },
      {
        title: "Literature overview",
        prompt:
          "Give me an overview of what is known about [topic] as of your knowledge cutoff. Include: the main schools of thought, the strongest evidence, the most contested questions, and key researchers or sources I should know about.",
        why: "Structured research prompt with explicit knowledge-cutoff awareness prevents Claude from presenting outdated info as current.",
      },
    ],
  },
  {
    label: "Strategy",
    color: "teal",
    bgColor: "#d0f0ea",
    prompts: [
      {
        title: "Decision framework",
        prompt:
          "I need to decide between [option A] and [option B]. Here's my context: [constraints, goals, resources]. Evaluate both options against: short-term impact, long-term impact, reversibility, resource cost, and alignment with [goal]. Recommend one and explain the key trade-off I'm accepting.",
        why: "The reversibility and trade-off framing are what separate useful strategic advice from generic pros/cons lists.",
      },
      {
        title: "First-principles breakdown",
        prompt:
          "Break [problem / challenge / question] down to first principles. What are we actually trying to achieve? What assumptions is the conventional approach making? What would a solution look like if we ignored how it's usually done?",
        why: "Forces Claude to challenge the frame of the question, not just answer it as posed.",
      },
      {
        title: "Pre-mortem",
        prompt:
          "It's [one year from now] and [project / plan] has failed completely. What went wrong? List the five most likely causes of failure — be specific to this context, not generic. Then for each: what could we do now to prevent it?",
        why: "Pre-mortem framing surfaces implementation risks that forward-looking planning systematically misses.",
      },
    ],
  },
];

export default async function BestClaudePromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/best-claude-prompts`;

  const allPrompts = promptCategories.flatMap((cat) =>
    cat.prompts.map((p) => ({
      name: p.title,
      text: p.why,
    }))
  );

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
                "@type": "Article",
                headline: "20 Best Claude Prompts: Templates for Writing, Code & Analysis",
                description:
                  "The 20 best Claude prompt templates across writing, coding, analysis, and research. Copy-paste ready with examples.",
                url: pagePath,
                inLanguage: locale,
                author: {
                  "@type": "Organization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                publisher: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
              },
              {
                "@type": "ItemList",
                name: "Best Claude Prompts",
                numberOfItems: allPrompts.length,
                itemListElement: allPrompts.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: p.name,
                  description: p.text,
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Best Claude Prompts", item: pagePath },
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
              <Link
                href="/curriculum"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden"
              >
                {t("nav.curriculum")}
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/courses/why-claude/context-is-everything"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Prompt Engineering · Track 2
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              20 Claude Prompts You Can Copy and Use Right Now
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Stop reading about it. Build something.
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-text-secondary">
              These are the prompt patterns that consistently produce high-quality
              output from Claude — across writing, coding, analysis, research, and
              strategy. Each includes the template and an explanation of why it
              works.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/prompt-engineering"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Engineering Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/courses/why-claude/context-is-everything"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Practice Free
              </Link>
            </div>
            <p className="mt-3 text-[0.85rem] text-text-secondary">
              Try every prompt in the live ChatGPT sandbox — no copy-paste needed
            </p>
          </div>
        </section>

        {/* Prompt categories */}
        {promptCategories.map((cat, catIdx) => (
          <section
            key={catIdx}
            className={`px-6 py-16 ${catIdx % 2 === 1 ? "bg-cream/40" : ""}`}
          >
            <div className="mx-auto max-w-[900px]">
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                {cat.label}
              </p>
              <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
                {cat.label} prompts
              </h2>

              <div className="mt-10 space-y-6">
                {cat.prompts.map((prompt, pIdx) => (
                  <div
                    key={pIdx}
                    className="overflow-hidden rounded-[20px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b-[2px] border-ink/20 p-[16px_24px]">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full border-[2px] border-ink text-[0.75rem] font-bold"
                        style={{ backgroundColor: cat.bgColor }}
                      >
                        {catIdx * 4 + pIdx + 1}
                      </div>
                      <div className="text-[1.05rem] font-bold text-ink">
                        {prompt.title}
                      </div>
                      <Copy className="ml-auto size-4 shrink-0 text-text-secondary" />
                    </div>

                    {/* Prompt */}
                    <div className="border-b-[2px] border-ink/20 bg-[#1c1917]">
                      <pre className="overflow-x-auto whitespace-pre-wrap p-6 font-mono text-[0.82rem] leading-[1.7] text-linen">
                        <code>{prompt.prompt}</code>
                      </pre>
                    </div>

                    {/* Why it works */}
                    <div className="p-[14px_24px]">
                      <span className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-orange">
                        Why it works:{" "}
                      </span>
                      <span className="text-[0.88rem] leading-[1.6] text-text-secondary">
                        {prompt.why}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA to prompt engineering course */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Go deeper with the Prompt Engineering track
              </h2>
              <p className="mb-6 text-[1.05rem] leading-[1.7] text-text-secondary">
                Track 2 at Learn to GPT covers chain-of-thought reasoning,
                structured output, few-shot examples, prompt evaluation, and
                optimization. Every lesson has a live ChatGPT sandbox so you
                practice the patterns immediately — not just read about them.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/prompt-engineering"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Prompt Engineering Course
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/courses/why-claude/context-is-everything"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-cream px-8 py-3 font-bold text-ink shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Practice every prompt in the live sandbox
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Free forever. No credit card. Start in 60 seconds.
            </p>
            <div className="mt-8">
              <Link
                href="/courses/why-claude/context-is-everything"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Try Learn to GPT Free
                <ArrowRight className="size-5" />
              </Link>
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
            <Link href="/prompt-engineering" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Prompt Engineering</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/claude-vs-chatgpt" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude vs ChatGPT</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
