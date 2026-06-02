import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, HelpCircle, Code, Zap, Terminal } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-api-tutorial`;

  const title = "Best ChatGPT API Tutorial: OpenAI API for Beginners (2025)";
  const description =
    "The best ChatGPT API tutorial for 2025. Authentication, making your first call, streaming, function calling, and building real applications with the OpenAI API. Beginner-friendly.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pathForLocale(locale),
      images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: "ChatGPT API Tutorial — Learn to GPT" }],
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

const steps = [
  {
    num: "1",
    title: "Get your API key",
    desc: "Go to platform.openai.com → API Keys → Create new secret key. Store it immediately — you can't view it again after creation. Never put your API key in client-side code or commit it to a public repository.",
  },
  {
    num: "2",
    title: "Install the SDK",
    desc: "Python: pip install openai. Node.js: npm install openai. The official SDK handles authentication, retries, and streaming for you. You can also call the API directly via HTTP if you prefer.",
  },
  {
    num: "3",
    title: "Make your first API call",
    desc: "The core endpoint is /v1/chat/completions. Send a messages array with role (system, user, or assistant) and content. Specify the model (gpt-4o or gpt-4o-mini for most tasks). The response comes back as a structured JSON object.",
  },
  {
    num: "4",
    title: "Add a system prompt",
    desc: "The system message sets behavior for the entire conversation. Pass it as the first message with role: 'system'. This is how you build a specialized assistant — the system prompt defines its persona, constraints, and output format.",
  },
  {
    num: "5",
    title: "Enable streaming",
    desc: "For better UX, set stream: true in your request. The API sends tokens as they're generated instead of waiting for the full response. The SDK handles this with async generators in Python or async iterables in Node.",
  },
  {
    num: "6",
    title: "Use function calling for structured output",
    desc: "Function calling lets you define a schema and force the model to return JSON matching that schema. This is how you extract structured data from unstructured text or integrate ChatGPT with your own tools and databases.",
  },
];

const useCases = [
  { icon: Code, title: "Automated content generation", desc: "Blog posts, product descriptions, summaries at scale. Trigger from a queue, process in batches, write results to a database." },
  { icon: Terminal, title: "Chatbots and assistants", desc: "Embed a conversational AI into your product. Maintain conversation history in your database, pass it as context on each call." },
  { icon: Zap, title: "Data extraction and classification", desc: "Pass unstructured text (emails, reviews, documents) and extract structured fields via function calling. Route, tag, and categorize at scale." },
  { icon: Code, title: "Workflow automation", desc: "Trigger AI processing as part of a larger pipeline — when a form is submitted, a file is uploaded, or a record is created." },
];

const faqs = [
  { q: "Is the ChatGPT API the same as ChatGPT?", a: "The API uses the same models as ChatGPT (GPT-4o, GPT-4o-mini) but is accessed programmatically rather than through the chat interface. You pay per token instead of a flat subscription. The API gives you full control over system prompts, conversation history, and output format." },
  { q: "How much does the OpenAI API cost?", a: "Pricing is per token (roughly per word). GPT-4o-mini is significantly cheaper than GPT-4o and handles most tasks well. OpenAI's pricing page has current rates. Start with gpt-4o-mini for development and switch to gpt-4o only where output quality requires it." },
  { q: "Do I need a ChatGPT Plus subscription to use the API?", a: "No. The API is billed separately from ChatGPT Plus. You need an OpenAI account and a payment method set up at platform.openai.com. Free-tier API access exists with rate limits; paid tiers unlock higher limits." },
  { q: "What's the difference between the API and Custom GPTs?", a: "Custom GPTs are no-code tools built in the ChatGPT interface. The API gives you full programmatic control — you can integrate AI into your own apps, databases, and workflows. Custom GPTs are faster to ship; the API is more powerful and flexible." },
  { q: "What model should I use for the API?", a: "Start with gpt-4o-mini for cost efficiency — it handles most tasks well at a fraction of the price. Use gpt-4o for complex reasoning, nuanced writing, or tasks where accuracy matters most. gpt-4o-mini → gpt-4o is a common production pattern: draft cheap, refine expensive." },
  { q: "What is the best tutorial for the OpenAI API?", a: "This Learn to GPT tutorial is the best starting point for the OpenAI API. It covers the five essential steps (API key, SDK install, first call, streaming, function calling) with runnable Python code. For interactive practice, Learn to GPT's Track 4 teaches API integration with hands-on exercises." },
];

export default async function ChatGPTAPITutorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/chatgpt-api-tutorial`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "ChatGPT API Tutorial: How to Use the OpenAI API",
        description: "Step-by-step tutorial for getting started with the OpenAI (ChatGPT) API. Covers authentication, first call, streaming, and function calling.",
        step: steps.map((s) => ({
          "@type": "HowToStep",
          name: s.title,
          text: s.desc,
          position: parseInt(s.num),
        })),
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
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9a7b5c]">Developer Tutorial</p>
          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-[#1c1917] max-md:text-[2.2rem]">
            ChatGPT API tutorial: your first OpenAI API integration
          </h1>
          <div className="mx-auto mt-6 max-w-[680px] rounded-[16px] border-[3px] border-[#1c1917] bg-white p-6 shadow-[3px_3px_0px_#1c1917]">
            <p className="text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              The best ChatGPT API tutorial for beginners covers five steps: getting your API key, installing the SDK, making your first chat completion call, adding streaming, and implementing function calling. This guide walks through each step with production-ready Python code you can run immediately.
            </p>
          </div>
          <p className="mt-6 text-[1.15rem] leading-[1.7] text-[#6b5e52]">
            Move beyond the chat interface. The OpenAI API gives you programmatic access to GPT-4o — embed it in your apps, automate workflows, and build production-grade AI features.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              Take the API Course <ArrowRight className="size-5" />
            </Link>
            <Link href="/chatgpt-tutorial" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-10 py-4 text-[1.05rem] font-bold text-[#1c1917] shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
              ChatGPT Basics First
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Getting started with the OpenAI API — 6 steps
          </h2>
          <div className="space-y-4">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] font-mono font-extrabold text-white shadow-[2px_2px_0px_#1c1917]">{num}</div>
                <div>
                  <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example code */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            Minimal working example (Python)
          </h2>
          <div className="overflow-hidden rounded-[18px] border-[3px] border-[#1c1917] bg-[#1c1917] shadow-[6px_6px_0px_#1c1917]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
              <div className="size-3 rounded-full bg-[#ff5f57]" />
              <div className="size-3 rounded-full bg-[#febc2e]" />
              <div className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[0.75rem] text-white/50">openai_example.py</span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[0.82rem] text-[#e5e5e5] leading-[1.7]">{`from openai import OpenAI

client = OpenAI(api_key="your-api-key-here")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Summarize this in 3 bullet points: [text]"}
    ]
)

print(response.choices[0].message.content)`}</pre>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">
            What people build with the OpenAI API
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {useCases.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-[16px] border-[3px] border-[#1c1917] bg-[#fdf8f0] p-6 shadow-[4px_4px_0px_#1c1917]">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full border-[2px] border-[#1c1917] bg-[#f97316] shadow-[2px_2px_0px_#1c1917]">
                  <Icon className="size-4 text-white" />
                </div>
                <h3 className="mb-2 font-extrabold text-[#1c1917]">{title}</h3>
                <p className="text-[0.9rem] leading-[1.6] text-[#6b5e52]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[18px] border-[4px] border-[#1c1917] bg-[#fdf8f0] p-10 shadow-[6px_6px_0px_#1c1917]">
            <h2 className="mb-4 text-[1.8rem] font-extrabold text-[#1c1917]">Go deeper with the API & Agents track</h2>
            <p className="mb-6 text-[1.05rem] leading-[1.7] text-[#6b5e52]">
              Learn to GPT's Track 4 (API & Agents) covers tool use, multi-step agentic workflows, error handling, and production patterns — with interactive exercises in a live sandbox. Go from first API call to production-ready patterns.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#f97316] px-8 py-3 font-bold text-white shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                Start Track 4 <ArrowRight className="size-4" />
              </Link>
              <Link href="/curriculum" className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1c1917] bg-[#fdf8f0] px-8 py-3 font-bold text-[#1c1917] shadow-[4px_4px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1c1917]">
                View Full Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-[#f5ede0]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-[#1c1917]">OpenAI API FAQ</h2>
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
              { href: "/custom-gpts-tutorial", label: "Custom GPTs", desc: "No-code alternative to the API" },
              { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Better prompts = better API output" },
              { href: "/chatgpt-for-business", label: "ChatGPT for Business", desc: "Business use cases and workflows" },
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
            <Link href="/custom-gpts-tutorial" className="text-[0.85rem] font-medium text-[#6b5e52] transition-colors hover:text-[#f97316]">Custom GPTs</Link>
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
