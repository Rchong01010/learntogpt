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

  const title = "Claude for Marketing Teams: Content, SEO, Social Media & Email";
  const description =
    "How marketing teams use Claude for content creation, SEO research, social media writing, email campaigns, and competitive analysis. Real techniques, prompt templates, and team workflows.";

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
          alt: "Claude for Marketing Teams — Learn to GPT",
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
    title: "Content Creation",
    desc: "Draft blog posts, landing pages, product descriptions, and thought leadership articles. Claude maintains brand voice when you provide a style guide and examples in the system prompt.",
  },
  {
    icon: Search,
    title: "SEO Research & Writing",
    desc: "Analyze search intent, cluster keywords, write meta descriptions, and build topical authority content. Claude understands semantic SEO — not just keyword stuffing.",
  },
  {
    icon: Share2,
    title: "Social Media",
    desc: "Adapt long-form content for LinkedIn, X, Instagram, and TikTok. Each platform gets the right format, length, and hook style. Batch-generate a week of posts from one source piece.",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    desc: "Write subject lines, body copy, and CTAs for nurture sequences, product launches, and re-engagement campaigns. A/B test copy variants with Claude before sending.",
  },
  {
    icon: TrendingUp,
    title: "Competitive Analysis",
    desc: "Paste competitor landing pages or messaging. Claude extracts positioning, unique claims, and gaps your brand can fill. Faster than any manual SWOT.",
  },
  {
    icon: BarChart3,
    title: "Performance Analysis",
    desc: "Feed Claude your campaign metrics and ask for insights. Claude identifies which segments, channels, or messages drove results — turning data dumps into actionable narratives.",
  },
];

const prompts = [
  {
    label: "Blog Post Outline",
    code: `You are a content strategist for [Brand].
Write a 1,500-word blog post outline targeting
the keyword "[keyword]".

Include: H1, 5 H2 sections with 3 bullet points each,
internal link suggestions, and a CTA paragraph.
Tone: expert but approachable. No jargon.`,
  },
  {
    label: "Social Adaptation",
    code: `Take this blog post excerpt and rewrite it
for three platforms:

1. LinkedIn: 150-word professional post, no hashtags
2. X/Twitter: 280-char hook + 3 follow-up tweets
3. Instagram caption: conversational, 3 hashtags max

[Paste blog excerpt here]`,
  },
  {
    label: "Email Subject Lines",
    code: `Generate 10 subject line variants for this email:
- Topic: [product launch / offer / announcement]
- Audience: [segment description]
- Goal: [open rate / click / reply]

Include: curiosity, benefit, urgency, and social
proof variants. Flag which is most likely to
perform for a B2B audience.`,
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
                name: "Claude for Marketing Teams: Content, SEO, Social Media & Email",
                description:
                  "How marketing teams use Claude for content creation, SEO research, social media writing, email campaigns, and competitive analysis.",
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
              Produce More Content at Higher Quality with Claude
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Stop reading about it. Build something.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              The fastest-growing marketing teams treat Claude as a senior writer, strategist, and analyst — not a spell-checker. This guide covers how to integrate Claude into every stage of your marketing stack, from ideation to performance review.
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
              Where Claude fits in your marketing stack
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
              Keeping Brand Voice Consistent
            </h2>
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                The biggest failure mode for marketing teams using AI is inconsistent voice. Every writer gets a slightly different Claude, and the content feels disjointed. Here is the fix:
              </p>
              <ul className="ml-6 space-y-3 text-[1.05rem] leading-[1.7] text-text-secondary">
                <li><strong className="text-ink">Create a Claude Project for your marketing team.</strong> Upload your brand voice guide, three to five approved content examples, and a list of words you never use. Every writer in the Project inherits this context.</li>
                <li><strong className="text-ink">Write a precise system prompt.</strong> Specify tone adjectives, sentence length targets, heading style, CTA language, and audience assumptions. &quot;Conversational and direct, second-person, max 20 words per sentence, no exclamation points&quot; is actionable. &quot;Sound human&quot; is not.</li>
                <li><strong className="text-ink">Build a prompt library for recurring content types.</strong> Blog outlines, LinkedIn posts, email subject lines — each type gets its own tested prompt that lives in your team&apos;s shared doc.</li>
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
              The Claude SEO Content Workflow
            </h2>
            <div className="space-y-4">
              {[
                { step: "01", title: "Keyword clustering", body: "Give Claude a flat list of 50-100 keywords and ask it to group them into topic clusters. Output: a structured content map with primary and secondary terms per cluster." },
                { step: "02", title: "Search intent analysis", body: "For each target keyword, Claude identifies intent (informational, navigational, commercial, transactional) and recommends content format accordingly." },
                { step: "03", title: "Outline generation", body: "Claude builds H1/H2/H3 structures that match top-ranking SERP formats for the keyword, with internal link suggestions and FAQ section for featured snippet targeting." },
                { step: "04", title: "Draft and edit loop", body: "First draft from Claude, human edit pass for accuracy and examples, Claude second pass for consistency and flow. Faster and better than writing from scratch." },
                { step: "05", title: "Meta tag generation", body: "Claude generates 3-5 meta title and description variants per page. A/B test in Search Console. Use the winner, iterate quarterly." },
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
