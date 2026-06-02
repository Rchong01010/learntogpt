import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, Copy } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-prompts`;

  const title = "Best ChatGPT Prompts for Work (Copy-Paste Templates)";
  const description =
    "The best ChatGPT prompts for writing, coding, analysis, research, and business. Copy-paste templates with explanations. Updated for GPT-4o.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT Prompts — Learn to GPT" }],
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

const promptCategories = [
  {
    category: "Writing & Editing",
    prompts: [
      { label: "Rewrite for clarity", prompt: "Rewrite the following paragraph for clarity. Use shorter sentences. Remove jargon. Keep the meaning exactly. [paste text]" },
      { label: "Draft professional email", prompt: "Write a professional email to [recipient] asking [specific request]. Tone: direct and respectful. Length: under 150 words." },
      { label: "Summarize document", prompt: "Summarize the following in 5 bullet points. Lead each point with the key takeaway. [paste document]" },
    ],
  },
  {
    category: "Analysis & Research",
    prompts: [
      { label: "Pros and cons", prompt: "Give me a balanced pros and cons analysis of [decision or topic]. 5 points per side. Be specific, not generic." },
      { label: "Explain like I'm new", prompt: "Explain [concept] as if I have a business background but no technical knowledge. Use an analogy if it helps." },
      { label: "Critique my work", prompt: "Review the following [document/plan/strategy] and give me 3 specific improvements. Be direct. [paste content]" },
    ],
  },
  {
    category: "Brainstorming",
    prompts: [
      { label: "Generate ideas", prompt: "Give me 15 ideas for [goal]. Vary the approach — include unconventional options. Be specific, not generic. Skip filler." },
      { label: "Devil's advocate", prompt: "You are a skeptical critic. What are the 5 strongest arguments against [my idea or plan]? Be genuinely critical." },
      { label: "First principles", prompt: "Break down [problem] to first principles. What are we actually trying to accomplish? What assumptions are we making?" },
    ],
  },
  {
    category: "Coding & Data",
    prompts: [
      { label: "Debug this code", prompt: "Here is my [language] code. It produces [describe the bug]. Identify the issue and suggest a fix. [paste code]" },
      { label: "Explain code", prompt: "Explain what this code does, line by line. Assume I understand the language but not the logic. [paste code]" },
      { label: "Write a formula", prompt: "Write an Excel formula that [describe what you want the formula to do]. The data is in [describe columns/rows]." },
    ],
  },
  {
    category: "Productivity & Workflow",
    prompts: [
      { label: "Meeting agenda", prompt: "Create a structured agenda for a [length] meeting about [topic]. Include time blocks and questions for each section." },
      { label: "Action item list", prompt: "Turn the following meeting notes into a clean action item list. Include: owner, action, deadline. [paste notes]" },
      { label: "Weekly plan", prompt: "I have these tasks this week: [list]. Help me prioritize them using the Eisenhower matrix. Flag anything I should delegate or drop." },
    ],
  },
];

const anatomy = [
  { part: "Role", example: "'You are a senior product manager with 10 years of B2B SaaS experience.'" },
  { part: "Context", example: "'I'm preparing a quarterly review for executives who care about revenue and churn.'" },
  { part: "Task", example: "'Summarize the following data into 3 key findings with supporting metrics.'" },
  { part: "Format", example: "'Format as bullet points. Keep each point to one sentence. Use bold for the key metric.'" },
  { part: "Constraint", example: "'Avoid jargon. Assume the reader doesn't know our product.'" },
];

const faqs = [
  { q: "What makes a ChatGPT prompt effective?", a: "Specificity and context. Give ChatGPT a role, your purpose, your audience, and the format you want. The more specific the input, the more useful the output. Generic prompts produce generic responses." },
  { q: "How do I write better prompts?", a: "Use the RCTFC framework: Role, Context, Task, Format, Constraint. Not every prompt needs all five elements, but adding even one — like specifying a format — dramatically improves output quality." },
  { q: "What are the best ChatGPT prompts for work?", a: "The best prompts are specific to your actual work. Take a task you do regularly, write a prompt template with placeholders, and refine it until the output is consistently good. Copy-paste templates are a starting point, not a final answer." },
  { q: "Can I save prompts in ChatGPT?", a: "ChatGPT doesn't have a native prompt library, but you can add frequently used prompts to Custom Instructions (your profile settings) or keep a personal prompt document you paste from. Custom GPTs can also have instructions pre-loaded." },
  { q: "Where can I find the best ChatGPT prompt templates?", a: "This page has the best ChatGPT prompt templates organized by category — writing, coding, analysis, brainstorming, and research. Each template uses the RCTFC framework and can be customized for your specific use case. Learn to GPT also teaches you to build your own templates through interactive exercises." },
];

export default async function ChatGPTPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-prompts`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Best ChatGPT Prompts for Work",
        description: "Copy-paste ChatGPT prompt templates for writing, analysis, coding, brainstorming, and productivity.",
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Copy-Paste Templates</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            Best ChatGPT prompts for real work
          </h1>
          <div className="mx-auto mt-6 max-w-[680px] rounded-[16px] border-[3px] border-[#1c1917] bg-white p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The best ChatGPT prompts share three traits: they assign a role, provide specific context, and request a clear format. These copy-paste prompt templates from Learn to GPT cover writing, coding, analysis, brainstorming, and research — each built on the RCTFC framework (Role, Context, Task, Format, Constraint) for consistently high-quality output.
            </p>
          </div>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Templates for writing, analysis, coding, brainstorming, and productivity. Customize with your details and paste directly into ChatGPT. Updated for GPT-4o.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/prompt-engineering" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Learn Prompt Engineering <ArrowRight className="size-5" />
            </Link>
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Practice Free
            </Link>
          </div>
        </div>
      </section>

      {/* Prompt anatomy */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-4 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            The anatomy of an effective prompt
          </h2>
          <p className="mb-8 text-center text-[1rem] text-[#6b5e52]">Good prompts include some combination of these five elements:</p>
          <div className="overflow-hidden rounded-[18px] border-[3px] border-[#1c1917] bg-[#fdf8f0] shadow-[4px_4px_0px_#1c1917]">
            {anatomy.map(({ part, example }, i) => (
              <div key={part} className={`flex gap-4 px-6 py-4 ${i < anatomy.length - 1 ? "border-b-[2px] border-[#1c1917]/20" : ""}`}>
                <span className="w-24 shrink-0 rounded-full border-[2px] border-[#1c1917] bg-[#f97316] px-3 py-1 text-center font-mono text-[0.72rem] font-bold text-white h-fit">{part}</span>
                <p className="text-[0.9rem] italic text-[#6b5e52]">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt library */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Prompt templates by category
          </h2>
          <div className="space-y-10">
            {promptCategories.map(({ category, prompts }) => (
              <div key={category}>
                <h3 className="mb-4 text-[1.2rem] font-extrabold text-[#1c1917]">{category}</h3>
                <div className="space-y-4">
                  {prompts.map(({ label, prompt }) => (
                    <div key={label} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-5 shadow-[3px_3px_0px_#1c1917]">
                      <div className="mb-3 flex items-center gap-2">
                        <Copy className="size-4 text-[#f97316]" />
                        <span className="font-bold text-[#1c1917]">{label}</span>
                      </div>
                      <pre className="rounded-[10px] border-[2px] border-[#1c1917]/20 bg-[#fdf0e0] px-4 py-3 font-mono text-[0.82rem] text-[#6b5e52] whitespace-pre-wrap">{prompt}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice CTA */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Go from templates to prompt fluency</h2>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Copy-paste templates get you started. But the real skill is learning to write prompts from scratch for any situation. Learn to GPT's prompt engineering track teaches the systematic approach — with interactive exercises, not just reading.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/prompt-engineering" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Prompt Engineering Course <ArrowRight className="size-4" />
              </Link>
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">Prompt FAQs</h2>
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
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Related Guides</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/chatgpt-tips", label: "ChatGPT Tips", desc: "Advanced techniques for daily use" },
              { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Systematic approach to better prompts" },
              { href: "/chatgpt-for-business", label: "ChatGPT for Business", desc: "Prompts and use cases for teams" },
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
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Curriculum</Link>
            <Link href="/prompt-engineering" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Prompt Engineering</Link>
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
