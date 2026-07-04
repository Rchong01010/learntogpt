import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Copy, HelpCircle } from "lucide-react";
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

  const title = "20 Best Claude Prompts (That Also Work on ChatGPT & Gemini)";
  const description =
    "20 copy-paste prompt templates for writing, code, analysis, and research. Built to run well on Claude, ChatGPT, and Gemini alike — because good prompt structure is model-agnostic. From Learn to GPT.";

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
          "Below are three samples of how I write: [paste samples]. Study the rhythm, word choice, and tone, then redraft the text that follows so it reads like I wrote it. No em dashes, no clichés, and no wrap-up paragraph.\n\nText to redraft: [paste draft]",
        why: "Stops any model from defaulting to generic AI prose. The examples anchor the output to your actual style — this works identically on Claude, ChatGPT, and Gemini.",
      },
      {
        title: "Long-form outline",
        prompt:
          "I need an outline for a [article/report/essay] on [topic], aimed at [audience]. Give me a working headline, five to seven sections, the single point each section should land, and for each one a note on the evidence or example to back it up.",
        why: "A structured output request makes the model organize before it writes — saves real revision time no matter which assistant you paste it into.",
      },
      {
        title: "Email with a clear ask",
        prompt:
          "Draft a [professional/friendly/direct] email to [recipient] that asks them to [action]. Background: [one or two sentences]. Keep it under 150 words and close with one concrete next step, not a vague open question.",
        why: "The word limit and CTA constraint cut the vague, padded emails every model tends to produce when left unconstrained.",
      },
      {
        title: "Content repurpose",
        prompt:
          "Here's a [blog post / transcript / report]: [paste content]. Turn it into three things while keeping the original tone: a LinkedIn post under 200 words, three one-line takeaways for social, and a short summary paragraph I can drop into an email.",
        why: "One source, three formats. Saves about an hour of reformatting per piece, on whichever model you already have open.",
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
          "Do a production-grade review of this [language] code. Check for: security holes (injection, auth, exposed data), slow paths, missing error handling, and type problems. For each issue, point to the line and say exactly how to fix it.\n\n[paste code]",
        why: "Explicit criteria prevent vague 'looks good' reviews. Any capable model surfaces real issues once you tell it exactly what to look for.",
      },
      {
        title: "Bug hunt with reproduction",
        prompt:
          "There's a bug in my [framework/language] code. Actual behavior: [symptom]. Expected behavior: [what should happen]. Relevant code: [paste code]. Reason through the likely cause step by step before you propose the fix.",
        why: "Expected-vs-actual framing forces systematic diagnosis instead of guessing — a technique that pays off on every model.",
      },
      {
        title: "Function with tests",
        prompt:
          "Write a [language] function that [what it should do]. Requirements: [list them]. Ship it with input validation, error handling, doc comments, and a [Jest/Pytest/etc] test suite covering the normal path, the edge cases, and the failure cases.",
        why: "Asking for tests alongside the function pushes the model toward testable code, not just code that runs. True across ChatGPT, Claude, and Gemini.",
      },
      {
        title: "Refactor for readability",
        prompt:
          "Refactor this code for readability without changing what it does. Pull repeated logic into named functions, swap magic numbers for named constants, rename unclear variables, and add a comment only where the reason isn't obvious from the code.\n\n[paste code]",
        why: "The 'without changing behavior' constraint is critical — it stops the model from helpfully 'improving' your logic while it tidies the code.",
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
          "Summarize this [document type] in three tiers: a one-line takeaway, five key points each with its supporting evidence, and the decisions or actions it demands from the reader. Skip filler openers like 'This document explores.'\n\n[paste document]",
        why: "A three-layer summary forces the model to separate signal from noise and surface the actionable part instead of paraphrasing everything.",
      },
      {
        title: "Competitive analysis",
        prompt:
          "Put [Company A] and [Company B] side by side in a table across pricing, target customer, standout features, positioning, known weak spots, and recent moves. Then call it: which one wins for [my use case], and why.",
        why: "A table plus a required winner forces the model to make a judgment call rather than hedging with 'both have pros and cons.'",
      },
      {
        title: "Data interpretation",
        prompt:
          "Here's a dataset: [paste or describe it]. Give me the single most important trend or anomaly, the missing data that would change how I read it, and which decisions this data can and cannot justify. Be concrete.",
        why: "Asking for what the data doesn't support is the critical question — prevents overconfident conclusions.",
      },
      {
        title: "Risk analysis",
        prompt:
          "Map the risks of [decision / project / plan] in a table: each risk, its probability (High/Med/Low), its impact (High/Med/Low), and the trigger that would set it off. For every High-impact one, give me a single concrete mitigation.",
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
          "Explain [topic] to me as [a smart 12-year-old / a non-technical business person / an expert in a nearby field]. Lean on analogies, define any jargon you use, and finish with the three things people at my level most often get wrong about it.",
        why: "The misunderstanding section is the most valuable part — it surfaces the non-obvious gaps in most explanations.",
      },
      {
        title: "Research synthesis",
        prompt:
          "I'm researching [topic]. My sources: [paste excerpts or notes]. Pull together where they agree, where they clash and why, the questions none of them answer, and what the strongest current consensus appears to be.",
        why: "Synthesis across sources is where these tools earn their keep — the value is in the connections, not in summarizing each source alone.",
      },
      {
        title: "Devil's advocate",
        prompt:
          "My position is [position]. Argue the other side as well as a smart, well-informed opponent would — real arguments, no strawmen. Then tell me which of those counterpoints I should lose the most sleep over.",
        why: "Explicitly asking for the strongest counterargument stops the model from sliding into agreeable, flattering agreement — a failure mode all of them share.",
      },
      {
        title: "Literature overview",
        prompt:
          "As of your knowledge cutoff, walk me through what's known about [topic]: the main schools of thought, the strongest evidence behind each, the questions still in dispute, and the researchers or sources worth knowing. Flag anything likely to be out of date.",
        why: "Naming the knowledge cutoff keeps any model from presenting stale training data as current — especially useful when the model can't browse.",
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
          "I'm choosing between [option A] and [option B]. My context: [constraints, goals, resources]. Score both on short-term impact, long-term impact, how reversible they are, resource cost, and fit with [goal]. Pick one and name the trade-off I'm accepting by choosing it.",
        why: "The reversibility and trade-off framing are what separate useful strategic advice from generic pros/cons lists.",
      },
      {
        title: "First-principles breakdown",
        prompt:
          "Take [problem / challenge / question] down to first principles. What's the real goal here? Which assumptions does the standard approach quietly rely on? And what would a fix look like if we ignored how it's normally done?",
        why: "Forces the model to challenge the frame of the question instead of answering it exactly as posed.",
      },
      {
        title: "Pre-mortem",
        prompt:
          "Fast-forward to [one year from now]: [project / plan] has failed outright. Working backward, list the five most probable reasons it collapsed — specific to my situation, not boilerplate — and for each, the move I could make today to head it off.",
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
                headline: "20 Best Claude Prompts That Also Work on ChatGPT and Gemini",
                description:
                  "20 model-agnostic prompt templates for writing, coding, analysis, and research. Copy-paste ready, and portable across Claude, ChatGPT, and Gemini.",
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
                href="/courses/why-chatgpt/context-is-everything"
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
              Prompt Engineering
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              20 Prompts You Can Copy Into Claude, ChatGPT, or Gemini
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Good structure beats the right brand.
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-text-secondary">
              These prompt patterns produce high-quality output on any frontier model — Claude, ChatGPT, or Gemini — across writing, coding, analysis, research, and strategy. People search for &quot;Claude prompts,&quot; but what actually makes them work is structure, and structure travels between models. Each includes the template and why it works.
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
                href="/courses/why-chatgpt/context-is-everything"
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

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                The best prompts follow one pattern regardless of which model you use: define a role, specify the output format, set constraints, and include one or two examples. Claude, ChatGPT, and Gemini all reward this structure. Which is why a prompt tuned for one usually works on the others with little or no change — the skill is portable, not brand-locked.
              </p>
            </div>
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
                Learn to GPT&apos;s prompt engineering track covers chain-of-thought
                reasoning, structured output, few-shot examples, and how to
                evaluate a prompt. Everything is taught model-agnostically, so the
                patterns transfer whether you end up on ChatGPT, Claude, or Gemini.
                Every lesson has a live sandbox so you practice, not just read.
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
                  href="/courses/why-chatgpt/context-is-everything"
                  className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-cream px-8 py-3 font-bold text-ink shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]"
                >
                  Start Free
                </Link>
              </div>
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
                { q: "What makes a prompt effective on any model?", a: "Specificity (clear role, audience, output format), structure (examples and constraints), and context (relevant background). The pattern of role + format + constraints + examples produces the best results on Claude, ChatGPT, and Gemini alike." },
                { q: "Can I use the same prompt on Claude, ChatGPT, and Gemini?", a: "Usually, yes. A well-structured prompt is portable because all three respond to the same signals. You'll occasionally tweak wording for a model's quirks, but the bones carry over — which is exactly why we teach prompting model-agnostically." },
                { q: "How do I write a good system prompt?", a: "Start with a role, specify the output format, add constraints (word count, tone, what to avoid), and include one or two examples of ideal output. This structure works whether the field is called a system prompt, custom instructions, or a gem." },
                { q: "What are the most common prompt mistakes?", a: "Being too vague (no role, format, or constraints), giving no context (no model can infer your industry or goals), and asking for everything at once. Breaking a complex task into steps beats one giant prompt every time." },
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
                href="/courses/why-chatgpt/context-is-everything"
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
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
