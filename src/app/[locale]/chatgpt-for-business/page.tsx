import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, TrendingUp, Users, Shield, Zap } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-for-business`;

  const title = "Best Ways to Use ChatGPT for Business: Use Cases & ROI";
  const description =
    "The best ways to use ChatGPT in your business. Department use cases, productivity gains, security considerations, team training, and enterprise rollout. Practical, not theoretical.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT for Business — Learn to GPT" }],
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

const departments = [
  {
    icon: TrendingUp,
    dept: "Sales",
    uses: [
      "Prospect research synthesis — paste LinkedIn profiles and company pages, get a structured brief",
      "Email personalization at scale — templates that reference specific prospect context",
      "Call prep summaries — key talking points from CRM notes",
      "Objection response drafts for common pushbacks",
    ],
  },
  {
    icon: Users,
    dept: "Marketing",
    uses: [
      "First-draft content for blog posts, social copy, and landing pages",
      "A/B test variant generation — headline and CTA alternatives",
      "Competitor analysis synthesis from scraped content",
      "Localization first passes before human translation review",
    ],
  },
  {
    icon: Shield,
    dept: "Operations",
    uses: [
      "SOP drafting — paste process notes, get structured documentation",
      "Meeting summary and action item extraction from transcripts",
      "Data classification and categorization from unstructured lists",
      "Report drafting from raw metrics and spreadsheet exports",
    ],
  },
  {
    icon: Zap,
    dept: "HR & Recruiting",
    uses: [
      "Job description writing and standardization",
      "Interview question generation tailored to role and level",
      "Onboarding document drafting from existing process notes",
      "Policy document summarization for employee handbook QA",
    ],
  },
];

const considerations = [
  { title: "Data privacy", desc: "ChatGPT's free and Plus tiers don't use your data for training if you opt out (Settings → Data Controls). For highly sensitive data, use ChatGPT Enterprise or the OpenAI API with a data processing agreement." },
  { title: "Output verification", desc: "ChatGPT produces confident-sounding text that can be wrong. Build a review step into any workflow where accuracy matters — especially for customer-facing content, legal language, or financial data." },
  { title: "Consistency at scale", desc: "Custom GPTs and API integrations produce more consistent output than chat-based workflows at scale. For repeatable business processes, invest in a Custom GPT with a well-tuned system prompt." },
  { title: "Team training", desc: "The gap between how ChatGPT works for a trained user vs. an untrained one is significant. Without structured training, most employees will use it for basic tasks and underestimate its value." },
];

const faqs = [
  { q: "What is ChatGPT Enterprise?", a: "ChatGPT Enterprise is OpenAI's business subscription with no usage limits, enterprise-grade data security (no training on your data), SSO, admin controls, and priority access to new features. It's designed for teams of 10+ users." },
  { q: "Is ChatGPT safe to use for confidential business data?", a: "With the standard free/Plus tiers, treat ChatGPT like any SaaS tool with third-party data processing. Don't paste truly sensitive data (customer PII, proprietary trade secrets, M&A details) without a data processing agreement. ChatGPT Enterprise or the API with DPA terms addresses this." },
  { q: "How do I roll out ChatGPT to my team?", a: "The most effective rollouts start with a specific use case where value is measurable — not open-ended 'use AI.' Identify a pain point, train a small group on ChatGPT for that task, measure the time saved or quality improvement, then scale from there with structured training." },
  { q: "Does ChatGPT integrate with our existing tools?", a: "ChatGPT doesn't integrate directly with most business tools out of the box. Custom GPTs can connect to APIs via Actions. For deeper integrations, the OpenAI API lets you embed ChatGPT functionality into your existing software." },
  { q: "How do we train employees to use ChatGPT effectively?", a: "The fastest path is structured, role-specific training with hands-on practice — not generic AI overviews. Learn to GPT offers team training options built around ChatGPT workflows relevant to your department's actual work." },
  { q: "What is the best way to use ChatGPT for business?", a: "The best way to use ChatGPT for business is to start with one high-frequency task per department — email drafts for sales, code review for engineering, report summarization for finance — and build a reliable prompt template. One well-designed workflow that saves 30 minutes daily produces more ROI than broad 'AI exploration.'" },
  { q: "What is the ROI of ChatGPT for business?", a: "Teams report significant time savings on text-heavy tasks: draft writing, research synthesis, data analysis, and code generation. The ROI depends on how systematically the tool is integrated into workflows. Ad-hoc usage produces minimal returns; structured integration with trained teams produces measurable productivity gains." },
];

export default async function ChatGPTForBusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-for-business`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "ChatGPT for Business: Use Cases, ROI, and Team Setup",
        description: "Practical guide to using ChatGPT in business across sales, marketing, operations, and HR. Includes enterprise considerations and team training.",
        url: pathForLocale(locale),
        publisher: { "@type": "Organization", name: "Learn to GPT", url: "https://learntogpt.com" },
        inLanguage: locale,
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Business Guide</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            ChatGPT for business: use cases, team rollout, and what actually works
          </h1>
          <div className="mx-auto mt-6 max-w-[680px] rounded-[16px] border-[3px] border-[#1c1917] bg-white p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The best way to use ChatGPT for business is to start with specific, high-frequency tasks per department rather than open-ended exploration. This guide covers department-level use cases for sales, marketing, engineering, and operations, with rollout strategies that produce measurable productivity gains.
            </p>
          </div>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Not a generic AI overview. A practical breakdown of where ChatGPT produces real productivity gains by department, how to roll it out to a team, and what to watch out for.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/for-teams" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Team Training Options <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-prompts" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Business Prompt Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Department-by-department use cases
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {departments.map(({ icon: Icon, dept, uses }) => (
              <div key={dept} className="rounded-[18px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-7 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] shadow-[2px_2px_0px_#1c1917]">
                    <Icon className="size-4 text-white" />
                  </div>
                  <h3 className="text-[1.1rem] font-extrabold text-[#1c1917]">{dept}</h3>
                </div>
                <ul className="space-y-2">
                  {uses.map((use, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.88rem] text-[#6b5e52]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#f97316]" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Considerations */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Business considerations before you roll out
          </h2>
          <div className="space-y-4">
            {considerations.map(({ title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[3px_3px_0px_#1c1917]">
                <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team training CTA */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Train your team, not just yourself</h2>
            <p className="mb-4 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The gap between a trained ChatGPT user and an untrained one is measurable. A team that knows how to direct AI effectively compounds the productivity gains across every project.
            </p>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Learn to GPT's team plans give your whole organization access to structured ChatGPT training — with tracking, completion reporting, and customizable onboarding paths.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/for-teams" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                View Team Plans <ArrowRight className="size-4" />
              </Link>
              <Link href="/curriculum" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Browse Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">Business FAQ</h2>
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

      {/* Related */}
      <section className="px-6 pb-[80px]">
        <div className="mx-auto max-w-[800px]">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Related</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/for-teams", label: "For Teams", desc: "Team plans and enterprise training" },
              { href: "/chatgpt-prompts", label: "Prompt Templates", desc: "Copy-paste prompts for business tasks" },
              { href: "/chatgpt-api-tutorial", label: "ChatGPT API", desc: "Automate business workflows at scale" },
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

      <footer className="border-t-[4px] border-[#1c1917] py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-[#1c1917]"><span className="text-[#22c55e]">Learn to</span> GPT</div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Home</Link>
            <Link href="/for-teams" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">For Teams</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Privacy</Link>
            <a href="https://claude-academy.com" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Claude Academy for Claude AI</a>
          </div>
          <p className="text-[0.75rem] text-[#6b5e52]">© {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}
