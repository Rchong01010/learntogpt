import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, PenLine, Search, Share2, Mail, TrendingUp, BarChart3 } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-marketing`;

  const title = "Claude in the Marketing Stack: What It Does Better Than ChatGPT";
  const description =
    "Most marketing teams already run on ChatGPT. Here's the honest split: where Claude earns a place (long-form drafts, brand voice, competitor teardowns) and where ChatGPT or Gemini keep the job.";

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
          alt: "Claude for Marketing Teams | Learn to GPT",
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

const useCases = [
  {
    icon: PenLine,
    title: "Long-form content: Claude's strongest case",
    desc: "Blog posts, landing pages, and thought-leadership pieces that have to sound like a person wrote them. Fed a style guide and a few approved examples, Claude's drafts tend to need fewer de-AI-ing passes than ChatGPT's. Test on your own brand before deciding.",
  },
  {
    icon: Search,
    title: "SEO research: split the job",
    desc: "Keyword clustering and intent classification work on any frontier model. Anything needing live SERP data (what currently ranks, People Also Ask) favors a search-connected tool like Gemini or ChatGPT with browsing. Claude shines at the writing stage after research is done.",
  },
  {
    icon: Share2,
    title: "Social: ChatGPT keeps most of this",
    desc: "Cutting one source piece into LinkedIn, X, and Instagram variants is a job all three do fine, and ChatGPT adds native image generation for the visual half of the post. If your social workflow already lives there, there's no reason to move it.",
  },
  {
    icon: Mail,
    title: "Email: variants from either, judgment from you",
    desc: "Subject lines, nurture copy, re-engagement sequences. Generate variants in whichever tool is open; the deciding factor is your send data, not the model. Claude's longer memory of the thread helps when a sequence has to stay coherent across seven emails.",
  },
  {
    icon: TrendingUp,
    title: "Competitor teardowns: Claude's context wins",
    desc: "Paste five competitor landing pages, a pricing page, and their last quarter of blog titles into one conversation and ask for the positioning map. Claude's long context holds all of it at once, which beats feeding a smaller window page by page.",
  },
  {
    icon: BarChart3,
    title: "Campaign metrics: compute first, narrate second",
    desc: "For actual number-crunching, ChatGPT's data analysis mode runs real Python on your export. Then hand the verified figures to whichever model writes your reporting voice best. Don't let any chat model do arithmetic you'll repeat to a CMO.",
  },
];

const prompts = [
  {
    label: "Brand-voice draft (works in Claude or ChatGPT)",
    code: `Attached: our voice guide and two approved posts.
Draft a post targeting "[keyword]" for [audience].

Before writing, list three ways our approved posts
differ from generic AI copy on this topic.
Then write the draft obeying those three rules.
Flag any sentence you're least sure sounds like us.`,
  },
  {
    label: "Competitor positioning map (lean: Claude)",
    code: `Below are the landing pages of our top 4
competitors, pasted in full.

Build a table: each row a competitor, columns for
core claim, target buyer, proof offered, and the
objection they ignore. Then name the one position
none of them occupies and argue whether it's
vacant or poisoned.`,
  },
  {
    label: "Subject line batch (any model, judge by sends)",
    code: `Write 10 subject lines for [campaign].
Constraints: under 45 characters, no clickbait
words our guide bans, at least 3 that state the
benefit plainly with zero cleverness.

Label each by mechanism (curiosity, benefit,
urgency, proof) so we can A/B by category
instead of by line.`,
  },
];

export default async function ClaudeForMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-marketing`;

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
                name: "Claude in the Marketing Stack: What It Does Better Than ChatGPT",
                description:
                  "An honest split of marketing work across Claude, ChatGPT, and Gemini: long-form drafts, SEO research, social, email, competitor teardowns, and campaign analysis.",
                url: pathForLocale(locale),
                inLanguage: locale,
                about: [
                  { "@type": "Thing", name: "Content Marketing" },
                  { "@type": "Thing", name: "SEO" },
                  { "@type": "Thing", name: "Email Marketing" },
                  { "@type": "Thing", name: "Social Media Marketing" },
                ],
                author: { "@type": "Organization", name: "Learn to GPT", url: baseUrl },
                isPartOf: { "@type": "WebSite", name: "Learn to GPT", url: baseUrl },
                image: `${baseUrl}/og-default.png`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude for Marketing", item: pathForLocale(locale) },
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
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
                Log In
              </Link>
              <Link
                href="/courses/essentials/make-claude-sound-like-you"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="px-6 pb-16 pt-[100px] text-center">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <PenLine className="size-4" />
              Content · SEO · Social · Email
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Your marketing team runs on ChatGPT. Where does Claude fit?
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Assign channels to models the way you assign them to people
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Marketing was the first department to adopt ChatGPT, and for social, images, and quick variants it&apos;s still the right desk. Claude earns its seat on the long-form side: drafts that must hold a brand voice for two thousand words, and competitor research where you paste everything at once. This guide splits the stack honestly instead of pretending one tool does it all.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/claude-for-business"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Team Training
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Prompt Templates
              </Link>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Marketing Use Cases
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Six channels, and which model gets each one
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">{item.title}</div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BRAND VOICE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-6 text-center text-[2rem] font-extrabold text-ink">
              Brand voice survives the tool, or it doesn&apos;t survive at all
            </h2>
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                When a team uses two or three AI tools, the failure mode isn&apos;t the models. It&apos;s that each writer prompts differently and the output reads like five different companies. The fix is the same regardless of vendor:
              </p>
              <ul className="ml-6 space-y-3 text-[1.05rem] leading-[1.7] text-text-secondary">
                <li><strong className="text-ink">Put your voice assets in persistent context.</strong> Claude Projects, ChatGPT Projects, or Gemini Gems: each can hold your voice guide, a few approved examples, and your banned-words list so every writer starts from the same baseline.</li>
                <li><strong className="text-ink">Make the instructions measurable.</strong> &quot;Second person, sentences under 20 words, no exclamation points, CTAs name the action&quot; can be checked. &quot;Sound human&quot; can&apos;t. Vague voice instructions are why AI copy converges on the same beige.</li>
                <li><strong className="text-ink">Version a shared prompt library per content type.</strong> One tested prompt each for outlines, posts, and subject lines, stored where the team works. When someone improves a prompt, everyone inherits the improvement.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PROMPT TEMPLATES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Starter Prompt Templates
            </h2>
            <div className="space-y-6">
              {prompts.map(({ label, code }) => (
                <div key={label} className="overflow-hidden rounded-[18px] border-[4px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
                  <div className="flex items-center gap-2 bg-[#1c1917] px-5 py-[12px]">
                    <div className="size-3 rounded-full bg-[#c94040]" />
                    <div className="size-3 rounded-full bg-gold" />
                    <div className="size-3 rounded-full bg-teal" />
                    <span className="ml-auto font-mono text-[0.75rem] text-white/60">{label}</span>
                  </div>
                  <div className="p-6">
                    <pre className="overflow-x-auto font-mono text-[0.82rem] leading-[1.8] text-ink whitespace-pre-wrap">
                      {code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[0.9rem] text-text-secondary">
              See 20 more tested templates in{" "}
              <Link href="/best-claude-prompts" className="font-semibold text-orange hover:underline">
                Best Claude Prompts
              </Link>
              .
            </p>
          </div>
        </section>

        {/* SEO WORKFLOW */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              An SEO content workflow across two models
            </h2>
            <div className="space-y-4">
              {[
                { step: "01", title: "Cluster keywords (either model)", body: "Dump your flat keyword export into whichever tool is open and ask for topic clusters with a primary and secondary term per group. This is pattern-sorting; every frontier model handles it." },
                { step: "02", title: "Check the live SERP (search-connected tool)", body: "What actually ranks, the People Also Ask boxes, the format Google rewards: this needs current data. Use ChatGPT with browsing or Gemini here, not a model answering from training memory." },
                { step: "03", title: "Outline against what you found (Claude)", body: "Paste the ranking pages' structures plus your cluster and let Claude propose the heading tree, internal links, and an FAQ block. Long context means it can see every competitor page at once while it outlines." },
                { step: "04", title: "Draft, human pass, polish pass", body: "First draft from your voice-guide-loaded model, a human edit for accuracy and real examples, then one more model pass for flow. The human in the middle is the step teams skip and regret." },
                { step: "05", title: "Meta variants, then let data pick", body: "Ask for a handful of title and description variants per page, ship one, and watch click-through in Search Console. The model generates options; the SERP is the judge." },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-6 rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="flex-shrink-0 font-mono text-[2rem] font-bold text-orange">{step}</div>
                  <div>
                    <div className="mb-2 text-[1.1rem] font-bold text-ink">{title}</div>
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Train your marketing team on{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Learn to GPT offers team training with real marketing workflows.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-for-business"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Team Training
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/best-claude-prompts"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Prompt Templates
              </Link>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-for-business", label: "Claude for Business", desc: "ROI and team enablement" },
                { href: "/best-claude-prompts", label: "Best Prompts", desc: "20 copy-paste templates" },
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Master prompt techniques" },
                { href: "/ai-automation", label: "AI Automation", desc: "Automate marketing workflows" },
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
