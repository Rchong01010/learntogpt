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

  const title = "Claude vs ChatGPT for Data Analysis: Which Tool for Which Job";
  const description =
    "ChatGPT runs Python on your files; Claude reasons across huge pasted documents and returns clean structured output. A task-by-task guide to splitting data work between them, with prompts.";

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
          alt: "Claude for Data Analysis | Learn to GPT",
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
    title: "Spreadsheets: run the numbers in ChatGPT",
    desc: "For real computation (sums, pivots, regressions) upload the file to ChatGPT's data analysis mode, which writes and executes Python. Language models doing mental math over pasted CSVs make mistakes; executed code doesn't. Use Claude when the question is interpretive rather than arithmetic.",
    prompt: "Upload sales.csv, then: run a month-over-month growth calculation per product line in Python, show the code, and chart the three fastest-growing lines. Flag any month where the data looks incomplete before analyzing it.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Database,
    title: "SQL generation: a genuine tie",
    desc: "Describe your tables and the question; any frontier model writes solid Postgres, MySQL, or BigQuery. Paste your actual schema DDL and sample rows to cut hallucinated column names. Whichever tool you use, read the query before running it against production.",
    prompt: "Given these CREATE TABLE statements and three sample rows per table, write one query answering: which signup cohorts have the highest 90-day repeat-purchase rate? Explain each join in a comment.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: Search,
    title: "Research synthesis: Claude's home turf",
    desc: "This is the task that justifies the second tab. Drop several papers or reports into one Claude conversation and interrogate the whole pile at once. Its long context holds more source material in view than most alternatives, which changes what questions you can ask.",
    prompt: "You have the full text of several studies on this topic. Build a claims matrix: each row a finding, columns for which studies support it, dispute it, or don't address it. Then tell me where the literature genuinely disagrees and why.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Table,
    title: "Structured extraction: Claude's other strength",
    desc: "Turning messy text (emails, postings, transcripts) into JSON or CSV rows against a schema you define. Claude has a reputation for holding a schema faithfully across many documents; GPT models do this well too with structured-output mode. Spot-check either.",
    prompt: "Convert each of these vendor emails into one JSON record: {vendor, product, quoted_price or null, delivery_weeks or null, open_questions[]}. Where the email is ambiguous, put your uncertainty in open_questions rather than guessing.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: BarChart3,
    title: "Report narratives: pick by writing taste",
    desc: "Turning finished numbers into an executive summary is a writing job, not a math job. Many people prefer Claude's prose defaults here, but this is preference, not capability. Give whichever model you use the audience, the length cap, and one example of a past report you liked.",
    prompt: "Using these final Q2 figures (already verified), draft the two-paragraph summary for a board pack: headline result first, one risk named plainly, no adjectives doing the work numbers should do. Match the attached example's tone.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: TrendingUp,
    title: "Framing the analysis: use either as a thought partner",
    desc: "Before any tool touches the data, talk through what's worth asking. Describe the columns and the business question, and let the model propose analyses, confounds, and cheap first checks. This works equally well in Claude, ChatGPT, or Gemini.",
    prompt: "I have 18 months of support tickets with timestamps, categories, resolution times, and satisfaction scores. Before I compute anything: what confounds should worry me, what would a skeptic check first, and what result would actually change a staffing decision?",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const codeExamples = [
  {
    title: "Python: send a data preview, not the whole file",
    language: "python",
    code: `# Same pattern works with the OpenAI SDK;
# swap the client and model name.
import anthropic
import pandas as pd

df = pd.read_csv("sales_data.csv")
preview = df.head(20).to_csv()
dtypes = df.dtypes.to_string()

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": f"""Column types:
{dtypes}

First 20 rows:
{preview}

Suggest the three analyses most worth
running on this, and what each would
tell us. Do not compute anything yet."""
    }]
)
print(response.content[0].text)`,
  },
  {
    title: "Structured extraction against a fixed schema",
    language: "python",
    code: `# Keep the schema in the prompt verbatim
# so every record comes back uniform.
response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1000,
    messages=[{
        "role": "user",
        "content": """Return this posting as JSON:
{
  "role_title": string,
  "company": string,
  "salary_min": number | null,
  "salary_max": number | null,
  "remote_policy": "remote"|"hybrid"|"onsite",
  "tech_stack": string[],
  "years_experience": number | null
}
Use null, never guess missing fields.

Posting:
""" + job_posting_text
    }]
)
import json
data = json.loads(response.content[0].text)`,
  },
];

const useCaseGrid = [
  { role: "Analysts", tasks: "SQL drafting in either tool; ChatGPT for computed checks; Claude for the writeup" },
  { role: "Researchers", tasks: "Claude for multi-paper synthesis and contradiction-hunting across long sources" },
  { role: "Product managers", tasks: "Claude to digest months of user feedback in one pass; either tool for roadmap notes" },
  { role: "Finance teams", tasks: "ChatGPT's Python execution for variance math; Claude for board narrative drafts" },
  { role: "Marketing teams", tasks: "ChatGPT for campaign number-crunching; Claude to interpret test results in context" },
  { role: "Operations", tasks: "Either tool to mine long log extracts; verify anything quantitative with executed code" },
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
                name: "Claude vs ChatGPT for Data Analysis: Which Tool for Which Job",
                description:
                  "A task-by-task split of data work between Claude and ChatGPT: computation, SQL, research synthesis, structured extraction, and report narratives.",
                url: pagePath,
                inLanguage: locale,
              },
              {
                "@type": "Course",
                name: "Data Analysis with AI Models",
                description:
                  "Learn when to use Claude, ChatGPT, or Gemini for CSV analysis, SQL generation, research synthesis, structured extraction, and reporting.",
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
              Data work splits cleanly between Claude and ChatGPT
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              One executes code, the other reads everything at once
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              ChatGPT&apos;s data analysis mode actually runs Python on your uploaded files, which makes it the safer choice for anything arithmetic. Claude&apos;s edge is the other half of the job: reading a huge pile of documents or feedback in one conversation, extracting it into clean structure, and writing the narrative on top. This page maps which task goes to which tool.
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
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">The Split</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Three rules for dividing the work</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">If it needs computing, use executed code</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  A language model predicting the sum of a column is guessing, however confidently. ChatGPT&apos;s data analysis mode sidesteps this by writing Python and running it on your actual file. Claude&apos;s analysis tool can run JavaScript in-browser for similar checks. Either way: for numbers that matter, insist on executed code you can read, not model arithmetic.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">If it needs reading, use the biggest context</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Synthesis quality drops when a tool has to chunk your sources and summarize the summaries. Claude&apos;s context window is large enough to hold a stack of papers, a long annual report, or months of support tickets in one conversation, which is why document-heavy analysts tend to keep it open next to ChatGPT rather than instead of it.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">If it needs judgment, any of them can push back</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Correlation versus causation, sampling bias, a question framed so the answer flatters the asker: the frontier models are all capable of catching these when you ask them to play skeptic. That prompt (&quot;what would a hostile reviewer say about this analysis?&quot;) transfers across Claude, ChatGPT, and Gemini unchanged.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis workflows */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Workflows</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">Six data tasks, routed to the right tool</h2>
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
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">The same split, from the API side</h2>
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
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">How different roles split the two tools</h2>
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
