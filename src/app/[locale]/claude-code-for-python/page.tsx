import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, FileCode, TestTube, Database, Braces } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-for-python`;

  const title = "Using Claude Code with Python | Complete Guide (2025)";
  const description =
    "Claude Code works with Python out of the box — it reads your project structure, understands virtual environments, and can write, test, and debug Python code from your terminal.";

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
          alt: "Claude Code for Python — Learn to GPT",
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

const faqs = [
  {
    q: "Does Claude Code work with Jupyter notebooks?",
    a: "Claude Code can read and understand Jupyter notebook (.ipynb) files, analyze cell outputs, and help you debug notebook code. However, Claude Code operates from the terminal, so it works best when you extract notebook logic into Python scripts or modules. For data exploration, many developers use Claude Code to write the analysis code in .py files and then import it into notebooks for visualization.",
  },
  {
    q: "Which Python frameworks does Claude Code support?",
    a: "Claude Code works with every major Python framework: Django, FastAPI, Flask, Starlette, and Tornado for web development; pandas, NumPy, polars, and scikit-learn for data science; pytest, unittest, and hypothesis for testing; SQLAlchemy, Tortoise ORM, and Django ORM for database access; Celery and Dramatiq for task queues. It reads your project dependencies to understand which frameworks you are using and applies framework-specific patterns.",
  },
  {
    q: "How does Claude Code handle virtual environments?",
    a: "Claude Code detects your virtual environment configuration automatically. It reads pyproject.toml, requirements.txt, Pipfile, and poetry.lock to understand your project dependencies. When running tests or scripts, it respects your project setup. You can add your virtual environment activation command and test runner to your CLAUDE.md file so Claude Code uses the correct environment for every operation.",
  },
  {
    q: "Can I use Claude Code for data science work?",
    a: "Yes. Claude Code excels at writing data transformation pipelines, pandas operations, SQL queries, and statistical analysis code. It can read CSV files, understand data schemas, write cleaning and transformation logic, and generate visualizations with matplotlib or plotly. For complex data pipelines, it helps decompose multi-step transformations into readable, testable functions rather than monolithic notebook cells.",
  },
];

const pythonWorkflows = [
  {
    icon: FileCode,
    title: "Django & FastAPI development",
    body: "Scaffold new endpoints, models, serializers, and migrations. Claude Code reads your existing URL patterns and model definitions to generate code that fits your project conventions. It handles Django class-based views, FastAPI dependency injection, and Pydantic model validation.",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Database,
    title: "Data analysis with pandas",
    body: "Describe the transformation you want and Claude Code writes the pandas operations — groupby, merge, pivot, window functions, and complex aggregations. It reads your data schema and writes efficient operations that chain properly, avoiding the common pitfall of SettingWithCopyWarning.",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: TestTube,
    title: "Testing with pytest",
    body: "Claude Code writes comprehensive pytest suites: unit tests, parametrized tests, fixtures, mocks, and integration tests. It reads your implementation code and generates tests that cover edge cases, not just the happy path. It handles pytest-asyncio for async code and pytest-django for Django projects.",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Braces,
    title: "Type checking & docstrings",
    body: "Add type hints to untyped Python code, generate Google or NumPy-style docstrings, and fix mypy or pyright errors. Claude Code understands Python's type system deeply — generics, protocols, TypeVar, overloads, and ParamSpec — and applies the right type patterns for your codebase.",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
];

export default async function ClaudeCodeForPythonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-code-for-python`;

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
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.a,
                  },
                })),
              },
              {
                "@type": "Article",
                headline: "Using Claude Code with Python",
                description:
                  "Claude Code works with Python out of the box. Learn how to use it for Django, FastAPI, data science, testing, and more.",
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
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Learn to GPT",
                    item: baseUrl,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Claude Code for Python",
                    item: pagePath,
                  },
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
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange"
              >
                Log In
              </Link>
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Get Started
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
              Language Guide
            </p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Write and Debug Python 3x Faster with{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Code
              </em>
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Django, FastAPI, pandas, pytest — all from your terminal
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              Claude Code works with Python out of the box — it reads your project structure, understands virtual environments, and can write, test, and debug Python code from your terminal. Whether you are building APIs with FastAPI, analyzing data with pandas, or writing Django applications, Claude Code understands Python&apos;s ecosystem and writes idiomatic, well-typed code that follows your project&apos;s conventions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                What is Claude Code?
              </Link>
            </div>
          </div>
        </section>

        {/* Getting Started with Python Projects */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Quick Start
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Getting started with Python projects
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Navigate to your project and start Claude Code</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Open your terminal, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">cd</code> into your Python project directory, and run <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">claude</code>. That is it. Claude Code automatically detects your Python project by reading <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">pyproject.toml</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">setup.py</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">requirements.txt</code>, or <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">Pipfile</code>. It understands your project layout, your dependencies, and your package structure from the first command.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Set up your CLAUDE.md for Python</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Create a <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">CLAUDE.md</code> file in your project root with your Python-specific commands: test runner (<code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">pytest</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">python -m pytest</code>), linter (<code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">ruff check</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">flake8</code>), formatter (<code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">ruff format</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">black</code>), and type checker (<code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">mypy</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">pyright</code>). This gives Claude Code the ability to verify its own work after every change.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Tell Claude Code about your project conventions</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  If your team uses specific patterns — like Google-style docstrings, absolute imports, or a particular directory structure for tests — add those conventions to <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">CLAUDE.md</code>. Claude Code reads this file before every interaction, so it generates code that matches your project&apos;s style from the start. This eliminates the back-and-forth of correcting style choices after the fact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Python Workflows */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Workflows
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Common Python workflows
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {pythonWorkflows.map((w) => (
                <div
                  key={w.title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${w.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <w.icon className={`size-5 ${w.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {w.title}
                  </div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Python-Specific Features */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Python Features
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Python-specific capabilities
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Type hints and static analysis</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code understands Python&apos;s gradual typing system. It can add type hints to untyped codebases, fix mypy and pyright errors, and use advanced type patterns like <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">TypeVar</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">Protocol</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">ParamSpec</code>, and <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">Generic</code> when appropriate. It knows when to use <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">str | None</code> vs <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">Optional[str]</code> based on your Python version target.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Docstring generation</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code generates docstrings that match your project&apos;s style — Google, NumPy, or Sphinx format. It reads the function implementation, understands the parameters, return types, and edge cases, and writes documentation that actually describes what the function does, not generic placeholder text. It can add docstrings to an entire module in one pass.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Virtual environment awareness</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code respects your virtual environment setup whether you use <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">venv</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">poetry</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">pipenv</code>, <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">conda</code>, or <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">uv</code>. It reads your dependency files to know which packages are available and at what version, so it never suggests using a library you have not installed or writes code against an API that changed in a newer version.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Building Python APIs */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Build With It
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Building Python APIs with Claude Code
            </h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">From description to working endpoint</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Describe the endpoint you need — &quot;Create a POST /api/users endpoint that accepts name and email, validates the email format, saves to the database, and returns the created user with a 201 status&quot; — and Claude Code writes the route, the Pydantic model (or Django serializer), the database query, and the error handling. It reads your existing code to match patterns: if your other endpoints use dependency injection, the new one will too.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Complete API scaffolding</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code can scaffold an entire CRUD API from a data model description. It generates the models, routes, validation schemas, database migrations (with Alembic or Django), and test files. Each generated file follows your project structure — if your routes live in <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">app/api/v1/</code> and models in <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">app/models/</code>, Claude Code puts files where they belong. It also wires up the new routes to your existing app instance and adds proper HTTP status codes and error responses.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Testing the API end-to-end</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  After building the endpoint, ask Claude Code to write tests. It generates pytest tests that cover happy paths, validation errors, duplicate handling, authentication failures, and edge cases. For FastAPI projects, it uses <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">httpx.AsyncClient</code> with proper test fixtures. For Django, it uses <code className="rounded bg-[#f0ebe4] px-1.5 py-0.5 font-mono text-[0.85rem]">APIClient</code> with factory-based test data. It then runs the tests to verify everything passes before you commit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              FAQ
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Claude Code for Python — common questions
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]"
                >
                  <div className="mb-2 text-[1rem] font-bold text-ink">
                    {faq.q}
                  </div>
                  <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center" data-variant="B">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Master Python development with{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                Claude Code
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              Your first Python project. 20 minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses/practitioner-setup/claude-md-project-spine"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Start the GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Browse Free Lessons
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
                { href: "/claude-code-debugging", label: "Debugging Guide", desc: "Debug any language with Claude Code" },
                { href: "/claude-code-tdd", label: "Test-Driven Development", desc: "TDD workflow with Claude Code" },
                { href: "/claude-code-cheat-sheet", label: "Cheat Sheet", desc: "Quick reference for Claude Code" },
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

      {/* Footer */}
      <footer className="border-t-[4px] border-ink py-10 text-center">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="logo-serif mb-3 text-[1.4rem] text-ink">
            <span className="text-gpt-green">Learn to</span> GPT
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Home</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/claude-code" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code</Link>
            <Link href="/claude-code-tutorial" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Tutorial</Link>
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
