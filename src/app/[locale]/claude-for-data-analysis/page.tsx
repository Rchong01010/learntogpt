import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BarChart3, FileSpreadsheet, Search, Table, TrendingUp, Database } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-for-data-analysis`;

  const title = "Claude for Data Analysis: CSV, Research & Structured Output";
  const description =
    "Use Claude to analyze CSV files, synthesize research, generate SQL, extract structured data, and build reports. Learn the workflows, prompts, and techniques that make it work.";

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
          alt: "Claude for Data Analysis — Learn to GPT",
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

const analysisWorkflows = [
  {
    icon: FileSpreadsheet,
    title: "CSV and spreadsheet analysis",
    desc: "Paste raw CSV data (or describe the columns) and ask Claude to analyze it. Descriptive stats, trend identification, anomaly detection, cohort comparisons — in natural language.",
    prompt: "Here's a CSV of monthly sales data for 3 products over 24 months. Identify: (1) which product has the strongest growth trend, (2) any seasonal patterns, (3) months where all 3 products underperformed, (4) the top 5 individual anomalies.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Database,
    title: "SQL generation and query writing",
    desc: "Describe your database schema and the question you want answered — Claude writes the SQL. Works for Postgres, MySQL, BigQuery, SQLite. Include your schema DDL for best results.",
    prompt: "Schema: users (id, email, created_at), orders (id, user_id, amount, status, created_at). Write a query that returns monthly revenue by cohort (month of user signup), for the past 12 months, with MoM growth rate.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Search,
    title: "Research synthesis",
    desc: "Paste multiple papers, reports, or sources. Claude synthesizes key findings, surfaces contradictions, maps the evidence, and highlights gaps — across the full 200K context window.",
    prompt: "Read these 5 research papers on [topic]. Synthesize: (1) findings that appear in 3+ studies, (2) directly contradictory findings and likely explanations, (3) methodological limitations across the literature, (4) the most important open questions.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Table,
    title: "Structured data extraction",
    desc: "Feed Claude unstructured text — PDFs, emails, web pages, news articles — and ask it to extract structured data into JSON, CSV, or a schema you define. Reliable, fast, and auditable.",
    prompt: "Extract from this job posting: {role_title, company, location, salary_range (null if not listed), required_years_experience, tech_stack (array), remote_policy}. Return as JSON. If a field is ambiguous, add an 'extraction_notes' field.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: BarChart3,
    title: "Report generation",
    desc: "Give Claude raw data and a report template (or describe the audience). It generates the narrative, pulls the key metrics, writes the executive summary, and flags what needs human judgment.",
    prompt: "Here's our Q2 marketing data. Write a board-ready executive summary: lead the headline finding, show the 3 most important metrics with context, flag 1 risk, end with 2 recommended actions. Max 350 words. No jargon.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: TrendingUp,
    title: "Exploratory data conversations",
    desc: "Use Claude as a thought partner on messy data. \"I have this dataset and I'm not sure what questions to ask.\" Claude helps you frame the analysis, choose the right approach, and interpret ambiguous results.",
    prompt: "I have 18 months of customer support ticket data: ticket_id, created_at, category, resolution_time_hours, CSAT_score (1-5), agent_id, product_area. What are the 5 most valuable analyses I could run? For each, describe what I'd learn and why it matters.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const codeExamples = [
  {
    title: "Python: CSV analysis with pandas prompt",
    language: "python",
    code: `# Prompt Claude with your data
import anthropic
import pandas as pd

df = pd.read_csv("sales_data.csv")
csv_preview = df.head(20).to_csv()
schema = df.dtypes.to_string()

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": f"""Schema:
{schema}

Sample data (first 20 rows):
{csv_preview}

Analyze: top 3 trends, any anomalies,
and the single most actionable insight."""
    }]
)
print(response.content[0].text)`,
  },
  {
    title: "Structured output: extract to JSON",
    language: "python",
    code: `# Extract structured data reliably
response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1000,
    messages=[{
        "role": "user",
        "content": """Extract from this job posting as JSON:
{
  "role_title": string,
  "company": string,
  "salary_min": number | null,
  "salary_max": number | null,
  "remote_policy": "remote"|"hybrid"|"onsite",
  "tech_stack": string[],
  "years_experience": number | null
}

Job posting:
""" + job_posting_text
    }]
)
import json
data = json.loads(response.content[0].text)`,
  },
];

const useCaseGrid = [
  { role: "Analysts", tasks: "SQL generation, cohort analysis, dashboard narrative, anomaly flagging" },
  { role: "Researchers", tasks: "Literature synthesis, methodology critique, citation extraction, gap analysis" },
  { role: "Product managers", tasks: "User feedback synthesis, NPS analysis, feature request clustering, roadmap summaries" },
  { role: "Finance teams", tasks: "Financial model commentary, variance analysis, board report drafts, forecast narratives" },
  { role: "Marketing teams", tasks: "Campaign data synthesis, attribution analysis, A/B test interpretation, content performance" },
  { role: "Operations", tasks: "Process mining from logs, SLA analysis, bottleneck identification, efficiency reporting" },
];

export default async function ClaudeForDataAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-for-data-analysis`;

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
                name: "Claude for Data Analysis: CSV, Research & Structured Output",
                description:
                  "Use Claude to analyze CSV files, synthesize research, generate SQL, and extract structured data. Workflows, prompts, and code examples.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "Course",
                name: "Data Analysis with Claude",
                description:
                  "Learn to use Claude AI for CSV analysis, SQL generation, research synthesis, structured data extraction, and report generation.",
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
                  { "@type": "ListItem", position: 2, name: "Claude for Data Analysis", item: pagePath },
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
              <Link href="/courses/essentials/document-analysis" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">For Analysts & Researchers</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Analyze Data, Write SQL, and Extract Insights Without Code
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              CSV analysis, SQL generation, research synthesis, structured output
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude&apos;s 200K context window, reliable JSON output, and strong reasoning make it the most versatile AI for data work. Paste a CSV, describe your database schema, dump a research paper — Claude analyzes, extracts, queries, and reports without you writing a line of code.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Learning Free
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

        {/* Why Claude for data */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Why Claude</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What makes Claude good at data work</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">200K context — your entire dataset fits</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  A 200,000-token context window holds roughly 150,000 words or ~500 pages of text. In data terms: a 5,000-row CSV with 10 columns, 20 research papers, an entire annual report, or a year of customer support tickets. Claude reads it all in one session — no chunking, no summaries, no information loss at the edges.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Reliable structured output — JSON schemas that hold</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude follows JSON schemas reliably — more consistently than most alternatives. For data extraction pipelines where every record needs to conform to a schema, this matters enormously. Define your output structure once; Claude applies it faithfully across thousands of documents.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Strong quantitative reasoning</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude scores well on quantitative benchmarks — MATH, GSM8K, MMLU. For data work this means: it catches calculation errors, reasons correctly about statistical concepts (correlation vs. causation, sampling bias, p-values), and flags when your framing of a question is analytically flawed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis workflows */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Workflows</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Six data analysis workflows — with prompts</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {analysisWorkflows.map((wf) => (
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

        {/* Code examples */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Code Examples</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Working with the Claude API for data tasks</h2>
            <div className="mt-10 space-y-6">
              {codeExamples.map((ex) => (
                <div key={ex.title} className="overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-center gap-2 bg-ink px-6 py-3">
                    <div className="size-3 rounded-full bg-red-400"></div>
                    <div className="size-3 rounded-full bg-yellow-400"></div>
                    <div className="size-3 rounded-full bg-green-400"></div>
                    <span className="ml-2 font-mono text-[0.75rem] text-white/70">{ex.title}</span>
                  </div>
                  <div className="bg-[#1c1917] p-6">
                    <pre className="overflow-x-auto font-mono text-[0.82rem] leading-[1.8] text-green-400">{ex.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use case grid */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">By Role</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Who uses Claude for data analysis</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCaseGrid.map((uc) => (
                <div key={uc.role} className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_22px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1rem] font-bold text-ink">{uc.role}</div>
                  <p className="text-[0.85rem] leading-[1.5] text-text-secondary">{uc.tasks}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="B">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Go from raw data to insight, faster
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Your first data lesson. 20 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start Learning Free
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
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Getting started with the Claude API" },
                { href: "/prompt-engineering", label: "Prompt Engineering", desc: "Advanced prompting for structured output" },
                { href: "/claude-for-developers", label: "For Developers", desc: "Full developer resource hub" },
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
