import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Code, FileText, Scale, Maximize2, Target } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-context-window`;

  const title = "Claude Context Window Explained: 200K Tokens and How to Use Them";
  const description =
    "Claude's context window is the amount of text it can process in a single conversation — up to 200K tokens (about 150,000 words). This is one of the largest context windows available, letting Claude analyze entire codebases, books, or document collections in one pass.";

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
          alt: "Claude Context Window — Learn to GPT",
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

const comparisonModels = [
  { model: "Claude Opus / Sonnet", context: "200K tokens", words: "~150,000 words", notes: "Largest standard context window. Reads entire codebases and book-length documents." },
  { model: "GPT-4o", context: "128K tokens", words: "~96,000 words", notes: "Large context but roughly 60% of Claude's capacity." },
  { model: "Gemini 1.5 Pro", context: "1M tokens", words: "~750,000 words", notes: "Largest available context, but retrieval accuracy can degrade at extreme lengths." },
  { model: "GPT-4 Turbo", context: "128K tokens", words: "~96,000 words", notes: "Same as GPT-4o. Adequate for most single-document analysis." },
  { model: "Llama 3.1 405B", context: "128K tokens", words: "~96,000 words", notes: "Open-source alternative with strong performance." },
];

const useCases = [
  {
    icon: Code,
    title: "Codebase analysis",
    desc: "Load an entire repository into a single conversation. Claude can read thousands of lines of code, understand the architecture, find bugs across files, suggest refactors that account for dependencies, and generate documentation that reflects the actual implementation — not just the file it can see.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: BookOpen,
    title: "Long document analysis",
    desc: "Upload contracts, research papers, financial reports, or even entire books. Ask Claude to summarize, extract specific information, identify inconsistencies, or answer questions that require synthesizing information from different sections. No chunking or splitting required.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: FileText,
    title: "Multi-document comparison",
    desc: "Load multiple documents simultaneously — competing proposals, different drafts of a contract, research papers on the same topic, or quarterly reports across years. Claude can compare, contrast, and identify differences that would take hours to find manually.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Scale,
    title: "Extended conversations",
    desc: "In a long working session, your conversation history stays in context. Claude remembers what you discussed 50 messages ago. This means you can iteratively refine work — editing a document, discussing strategy, debugging code — without Claude losing track of earlier decisions.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
];

const bestPractices = [
  {
    title: "Front-load the most important content",
    body: "Put your key documents and instructions at the beginning of the conversation. While Claude can access the full context window, attention is strongest at the beginning and end of the context. Structure your prompt so critical information appears first.",
  },
  {
    title: "Use structured formatting for large inputs",
    body: "When loading multiple documents, clearly label each one with headers, XML tags, or delimiters. \"Document 1: Q3 Financial Report\" is much easier for Claude to reference than an unlabeled wall of text. Structure helps Claude cite and cross-reference accurately.",
  },
  {
    title: "Know when to chunk instead",
    body: "Just because you can fit everything in one context doesn't always mean you should. If you need to process 500 documents with the same prompt, batch processing (one document per request) is more reliable and cost-effective than cramming them all into one conversation. Use the full context for tasks that require cross-document reasoning.",
  },
  {
    title: "Monitor your token usage",
    body: "Every token in the context window costs money on the API. A full 200K-token conversation costs significantly more per message than a 5K-token one, because the model processes the entire context with every response. For cost-sensitive applications, only include what the model actually needs to see.",
  },
];

const faqItems = [
  {
    q: "Does a bigger context window always mean better results?",
    a: "Not necessarily. A larger context window means Claude can see more information, but the quality of results depends on how you structure that information. A well-organized 10K-token prompt often outperforms a messy 100K-token dump. The context window is a capacity limit, not a quality dial — think of it as a desk: a bigger desk helps when you genuinely need to spread out many documents, but a tidy small desk beats a cluttered large one.",
  },
  {
    q: "How do I count tokens?",
    a: "One token is roughly 3/4 of a word in English. A 1,000-word document is approximately 1,333 tokens. Code tends to tokenize less efficiently than prose — expect roughly 1 token per 3 characters for code. Anthropic provides a tokenizer tool in their documentation, and most API client libraries include a token counting utility.",
  },
  {
    q: "What is the difference between context window and memory?",
    a: "The context window is everything Claude can see in a single conversation — your messages, its responses, and any documents you've shared. It resets when you start a new conversation. Memory (via Claude Projects or the API's system prompt) is persistent information that carries across conversations. Think of context as short-term working memory and projects/system prompts as long-term reference material.",
  },
  {
    q: "How does context window size affect cost?",
    a: "On the API, you pay per token — both input and output. A conversation that fills the full 200K context window costs more per response because Claude processes the entire context each time it generates a reply. This is why context management matters: only include information the model needs for the current task. On claude.ai (consumer product), context costs are covered by your subscription.",
  },
];

export default async function ClaudeContextWindowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-context-window`;

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
                name: "Claude Context Window Explained: 200K Tokens and How to Use Them",
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
                name: "Claude Context Window Explained: 200K Tokens and How to Use Them",
                description:
                  "Learn how Claude's 200K token context window works, how it compares to competitors, and best practices for using it effectively.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Context Window", item: pagePath },
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
              <Link href="/courses/essentials/meet-claude" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Core Concepts</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Load Entire Codebases and Books into One Claude Conversation
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              200K tokens — about 150,000 words in one conversation
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude&apos;s context window is the amount of text it can process in a single conversation — up to 200K tokens, which is approximately 150,000 words or 500 pages of text. This is one of the largest context windows available in any AI model, and it fundamentally changes how you can work with AI. Instead of feeding Claude small snippets and hoping it understands the bigger picture, you can give it the entire picture.
            </p>
            <p className="mx-auto mb-10 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              A context window is not just a feature spec — it determines what kinds of tasks are possible. A 4K-token window can handle a short conversation. A 200K-token window can analyze an entire codebase, read a full book, or compare dozens of documents simultaneously. Here&apos;s what you need to know.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/essentials/meet-claude"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Foundations Track (Free)
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

        {/* What Is a Context Window? */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Fundamentals</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What is a context window?</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Tokens: the unit of measurement</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  AI models don&apos;t read words — they read tokens. A token is a chunk of text, typically 3-4 characters in English. &quot;Hello&quot; is one token. &quot;Anthropic&quot; is two tokens (&quot;Anthrop&quot; + &quot;ic&quot;). Code tokenizes differently from prose — a line of Python might be 10-20 tokens depending on variable names and syntax. When we say Claude has a 200K-token context window, that means it can process roughly 150,000 English words at once.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Why context window size matters</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  The context window determines what Claude can &quot;see&quot; when generating a response. Everything inside the window — your messages, Claude&apos;s responses, uploaded documents, system prompts — is visible. Everything outside is invisible. A larger window means Claude can reason across more information simultaneously, which enables tasks that are simply impossible with smaller contexts: analyzing entire legal contracts, reviewing full codebases, or maintaining coherent long conversations.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Input tokens vs. output tokens</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  The context window includes both what you send (input tokens) and what Claude generates (output tokens). If you send 190K tokens of documents, Claude only has 10K tokens left for its response. This is why it&apos;s important to leave room for the response you expect. For most tasks, keeping input under 150K tokens gives Claude plenty of room to generate detailed responses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Comparison</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Claude&apos;s context window vs. competitors</h2>
            <div className="mt-10 overflow-x-auto rounded-[16px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[2px] border-ink/20">
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Model</th>
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Context</th>
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Approx. Words</th>
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink max-md:hidden">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonModels.map((row) => (
                    <tr key={row.model} className="border-b border-ink/10 last:border-b-0">
                      <td className="p-4 text-[0.85rem] font-semibold text-ink">{row.model}</td>
                      <td className="p-4 text-[0.85rem] text-text-secondary">{row.context}</td>
                      <td className="p-4 text-[0.85rem] text-text-secondary">{row.words}</td>
                      <td className="p-4 text-[0.85rem] text-text-secondary max-md:hidden">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-[0.8rem] text-text-secondary">
              Context sizes as of May 2025. Gemini offers a larger raw token count, but Claude&apos;s 200K window is the sweet spot where context size, retrieval accuracy, and cost intersect for most professional use cases.
            </p>
          </div>
        </section>

        {/* How to Use the Full Context Window */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Applications</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">How to use the full context window</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {useCases.map((uc) => (
                <div key={uc.title} className="rounded-[24px] border-[4px] border-ink bg-cream p-[28px_24px] shadow-[4px_4px_0px_#1c1917]">
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${uc.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <uc.icon className={`size-5 ${uc.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1.1rem] font-bold text-ink">{uc.title}</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Best Practices</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Context window best practices</h2>
            <div className="mt-10 space-y-4">
              {bestPractices.map((bp) => (
                <div key={bp.title} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{bp.title}</div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{bp.body}</p>
                </div>
              ))}
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
              Learn to use Claude effectively
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Stop reading about it. Build something.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/essentials/meet-claude"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Foundations Track
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
                { href: "/claude-memory", label: "Claude Memory", desc: "Persistent context across chats" },
                { href: "/claude-projects", label: "Claude Projects", desc: "Organize work with project knowledge" },
                { href: "/claude-extended-thinking", label: "Extended Thinking", desc: "Claude's chain-of-thought reasoning" },
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
