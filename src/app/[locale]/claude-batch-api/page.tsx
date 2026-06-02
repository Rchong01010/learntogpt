import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Zap, Clock, DollarSign, Layers, FileSearch, ShieldCheck } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-batch-api`;

  const title = "Claude Batch API: Process Thousands of Prompts at 50% Lower Cost";
  const description =
    "The Claude Batch API lets you submit thousands of prompts at once for asynchronous processing at 50% lower cost — ideal for data labeling, content generation, document analysis, and any high-volume AI workflow.";

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
          alt: "Claude Batch API — Learn to GPT",
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

const batchSteps = [
  {
    step: "1",
    title: "Prepare your JSONL file",
    desc: "Each line in the file contains one request with a custom_id and the messages payload. The custom_id lets you match results back to your inputs when processing completes.",
    code: `{"custom_id":"task-001","params":{"model":"claude-sonnet-4-20250514","max_tokens":1024,"messages":[{"role":"user","content":"Classify this support ticket: ..."}]}}`,
  },
  {
    step: "2",
    title: "Submit the batch",
    desc: "Upload your JSONL file and create a batch via the API. You get back a batch ID that you use to check status and retrieve results.",
    code: `import anthropic

client = anthropic.Anthropic()
batch = client.messages.batches.create(
    requests=[...],  # Your list of batch requests
)
print(batch.id)  # Save this for polling`,
  },
  {
    step: "3",
    title: "Poll for completion",
    desc: "Batches process asynchronously. Check the status endpoint periodically or set up a webhook. Processing time depends on batch size and current load, but most batches complete within 24 hours.",
    code: `batch = client.messages.batches.retrieve(batch.id)
print(batch.processing_status)
# "in_progress" | "ended"`,
  },
  {
    step: "4",
    title: "Download results",
    desc: "Once complete, download the results file. Each line contains the custom_id and the model's response, making it straightforward to rejoin with your original data.",
    code: `for result in client.messages.batches.results(batch.id):
    print(result.custom_id, result.result.message.content)`,
  },
];

const useCases = [
  {
    icon: FileSearch,
    title: "Document classification",
    desc: "Sort thousands of support tickets, legal documents, or research papers into categories. Feed each document as a separate batch request with classification instructions. Typical accuracy exceeds 95% with well-crafted prompts.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: ShieldCheck,
    title: "Content moderation",
    desc: "Screen user-generated content at scale. Claude evaluates each piece of content against your moderation policy and returns a structured decision (approve, flag, reject) with reasoning. Process an entire day's content queue in one batch.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Layers,
    title: "Data extraction and labeling",
    desc: "Extract structured fields from unstructured text — names, dates, amounts, sentiment, categories. Transform messy data into clean, typed records. One batch can process an entire dataset that would take a team of analysts weeks.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Zap,
    title: "Content generation",
    desc: "Generate product descriptions, email variations, social media posts, or translations in bulk. Each request can include different product data and target audience parameters. Useful for e-commerce catalogs and marketing campaigns.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
];

const comparisonRows = [
  { feature: "Latency", realTime: "Seconds", batch: "Up to 24 hours" },
  { feature: "Cost", realTime: "Standard pricing", batch: "50% discount" },
  { feature: "Rate limits", realTime: "Per-minute limits apply", batch: "Higher effective throughput" },
  { feature: "Best for", realTime: "Interactive apps, chat, real-time UX", batch: "Offline processing, bulk analysis, data pipelines" },
  { feature: "Error handling", realTime: "Retry individual requests", batch: "Per-request status in results file" },
];

const faqItems = [
  {
    q: "What is the maximum batch size?",
    a: "Each batch can contain up to 10,000 requests. For larger workloads, split your data into multiple batches and submit them in parallel. There is no limit on how many batches you can have running simultaneously, though throughput depends on your API tier.",
  },
  {
    q: "How long does batch processing take?",
    a: "Most batches complete within 24 hours, and many finish in under an hour depending on size and current system load. Batches are designed for workloads where minutes-to-hours latency is acceptable in exchange for the 50% cost reduction.",
  },
  {
    q: "How does error handling work?",
    a: "Each request in a batch is processed independently. If one request fails (e.g., due to content filtering or token limits), the others still complete. The results file includes a status field for each request so you can identify and retry failures without reprocessing the entire batch.",
  },
  {
    q: "How is batch pricing calculated?",
    a: "Batch API pricing is 50% of the standard per-token rate for the model you use. Input tokens and output tokens are both discounted. For example, if Claude Sonnet costs $3 per million input tokens in real-time mode, it costs $1.50 per million input tokens in batch mode. This makes batch processing one of the most cost-effective ways to use frontier AI models.",
  },
];

export default async function ClaudeBatchApiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-batch-api`;

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
                name: "Claude Batch API: Process Thousands of Prompts at 50% Lower Cost",
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
                name: "Claude Batch API: Process Thousands of Prompts at 50% Lower Cost",
                description:
                  "Learn how to use the Claude Batch API for high-volume AI workflows with 50% cost savings.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Batch API", item: pagePath },
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
              <Link href="/claude-api-tutorial" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">API Reference</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Claude Batch API
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Thousands of prompts, 50% lower cost
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              The Claude Batch API lets you submit thousands of prompts at once for asynchronous processing at 50% lower cost. Instead of sending requests one at a time and waiting for each response, you package your entire workload into a single batch and retrieve results when processing completes. This is ideal for data labeling, content generation, document analysis, and any high-volume AI workflow where real-time responses aren&apos;t required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Batch API Quickstart
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* How Batch Processing Works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">How It Works</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Building a batch pipeline</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              The batch workflow is straightforward: prepare your requests in JSONL format, submit them, wait for processing, and download structured results. Each request is independent, so failures in one don&apos;t affect others.
            </p>
            <div className="mt-10 space-y-6">
              {batchSteps.map((step) => (
                <div key={step.step} className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="flex size-[32px] items-center justify-center rounded-full border-[2px] border-ink bg-orange text-[0.85rem] font-bold text-white">{step.step}</span>
                    <div className="text-[1.05rem] font-bold text-ink">{step.title}</div>
                  </div>
                  <p className="mb-3 mt-2 text-[0.9rem] leading-[1.6] text-text-secondary">{step.desc}</p>
                  <div className="overflow-x-auto rounded-[8px] border-[2px] border-ink/30 bg-linen p-3">
                    <pre className="font-mono text-[0.75rem] leading-[1.5] text-text-secondary">{step.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Batch vs. Real-Time */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Comparison</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">When to use batch vs. real-time</h2>
            <p className="mx-auto mt-4 max-w-[660px] text-center text-[0.95rem] leading-[1.7] text-text-secondary">
              The Batch API is not a replacement for real-time requests — it&apos;s a complement. Use real-time for interactive applications where users are waiting for responses. Use batch for everything else.
            </p>
            <div className="mt-10 overflow-x-auto rounded-[16px] border-[3px] border-ink bg-cream shadow-[3px_3px_0px_#1c1917]">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[2px] border-ink/20">
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Feature</th>
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Real-Time API</th>
                    <th className="p-4 text-left text-[0.85rem] font-bold text-ink">Batch API</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-ink/10 last:border-b-0">
                      <td className="p-4 text-[0.85rem] font-semibold text-ink">{row.feature}</td>
                      <td className="p-4 text-[0.85rem] text-text-secondary">{row.realTime}</td>
                      <td className="p-4 text-[0.85rem] text-text-secondary">{row.batch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
              <div className="mb-2 text-[1rem] font-bold text-ink">Rule of thumb</div>
              <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                If your workflow can tolerate latency measured in minutes or hours rather than seconds, use the Batch API. The 50% cost reduction compounds significantly at scale — a workflow that costs $1,000/month in real-time mode costs $500/month in batch mode with identical results.
              </p>
            </div>
          </div>
        </section>

        {/* Common Use Cases */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Use Cases</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Common batch processing use cases</h2>
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
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="B">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Learn to build with the Claude API
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Your first batch pipeline. 20 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Batch API Quickstart
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-tool-use"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Tool Use Guide
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
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Get started with the Claude API" },
                { href: "/claude-for-developers", label: "For Developers", desc: "Developer workflows and tools" },
                { href: "/claude-agents", label: "Claude Agents", desc: "Build autonomous AI agents" },
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
            <Link href="/claude-api-tutorial" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">API Tutorial</Link>
            <Link href="/claude-for-developers" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Developers</Link>
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
