import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Shield, Lock, FileWarning, KeyRound, Search } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-security`;

  const title = "Claude Code Security Best Practices: Complete Guide";
  const description =
    "Claude Code runs commands on your machine with your permissions. Security best practices include using permission controls, reviewing changes before committing, keeping secrets out of context, and using hooks for automated security checks.";

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
          alt: "Claude Code Security Best Practices — Learn to GPT",
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

const permissionSections = [
  {
    title: "What Claude Code can access",
    detail: "Claude Code runs in your terminal with your user permissions. It can read and write files in your project directory, execute shell commands, access environment variables visible to your shell, and make network requests. It does not have root access unless you run it with elevated privileges — which you should not do.",
  },
  {
    title: "Allowlists and deny patterns",
    detail: "You can configure which commands Claude Code is allowed to run. Allowlists define specific commands or patterns that Claude can execute without asking for confirmation. Deny patterns block specific commands entirely — for example, you might deny 'rm -rf /' or 'git push --force' to prevent destructive operations. These controls live in your settings.json and apply per-project or globally.",
  },
  {
    title: "Approval modes",
    detail: "Claude Code supports multiple approval modes. In the default mode, Claude asks for confirmation before running any shell command. You can switch to auto-approve mode for specific command patterns you trust (like 'npm test' or 'git status'). The safest approach is to start restrictive and gradually whitelist commands as you build confidence in your workflow.",
  },
];

const secretsPractices = [
  {
    title: "Never paste API keys into the conversation",
    detail: "Anything you type in the Claude Code conversation becomes part of the context. If you paste an API key, token, or password, it enters the message history and may be sent to Anthropic's API. Use environment variables instead — Claude Code can read them from your shell environment without you ever typing the value.",
  },
  {
    title: "Keep .env files out of context",
    detail: "Add .env, .env.local, and any credential files to your .gitignore. When Claude Code reads your project files, it respects .gitignore by default. But be explicit: if Claude asks to read a .env file, decline. Reference environment variable names in your CLAUDE.md so Claude knows what variables exist without seeing their values.",
  },
  {
    title: "Rotate exposed secrets immediately",
    detail: "If a secret accidentally enters the conversation, treat it as compromised. Rotate the key or token immediately, even if you think the exposure was limited. Update the credential in your secret manager, deploy the new value, and verify the old one is revoked. Do not assume the exposure was harmless.",
  },
  {
    title: "Use secret managers for production credentials",
    detail: "Store production secrets in a dedicated secret manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, or your cloud provider's equivalent). Claude Code should never need direct access to production credentials. For development, use local .env files with development-only values that have no access to production data.",
  },
];

const hookExamples = [
  {
    name: "Pre-commit security scan",
    description: "Run a static analysis security tool (like Semgrep, Bandit for Python, or npm audit for Node.js) before every commit. If the scan finds vulnerabilities, the commit is blocked until the issues are resolved. This catches common security problems — hardcoded secrets, SQL injection patterns, insecure dependencies — before they reach your repository.",
  },
  {
    name: "Dependency audit hook",
    description: "Automatically run npm audit or pip-audit after any command that modifies your dependency lockfile. Check for known vulnerabilities in new or updated packages. Flag packages published within the last 72 hours as high-risk — supply chain attacks often target recently published versions. Block the install if critical vulnerabilities are found.",
  },
  {
    name: "Secret detection hook",
    description: "Use tools like gitleaks, truffleHog, or detect-secrets as a pre-commit hook to scan staged changes for accidentally committed secrets. These tools use entropy analysis and regex patterns to catch API keys, passwords, and tokens that might otherwise slip through code review. Configure them to run automatically — do not rely on manual checks.",
  },
];

const reviewPractices = [
  {
    title: "Always review AI-generated code",
    detail: "Claude Code produces high-quality code, but it can introduce subtle issues: incorrect error handling, missing edge cases, overly permissive access controls, or logic that works in development but fails under production load. Read every change before committing. Use the /review command to get Claude's own analysis, then apply your own judgment on top.",
  },
  {
    title: "Check for injection vulnerabilities",
    detail: "AI-generated code sometimes uses string interpolation where parameterized queries are required. Watch for f-strings in SQL, unsanitized user input in HTML templates, and shell command construction from user data. These patterns create SQL injection, XSS, and command injection vulnerabilities. Parameterized queries and input sanitization are non-negotiable.",
  },
  {
    title: "Validate input handling",
    detail: "Verify that generated code validates all inputs on the server side. Claude sometimes generates client-side validation without corresponding server-side checks. Every API endpoint should validate request bodies, query parameters, and headers independently of the client. Never trust client data, even if Claude wrote the client code too.",
  },
  {
    title: "Review permissions and access controls",
    detail: "Check that new routes and API endpoints include proper authentication and authorization. Claude may generate functional endpoints that are missing auth middleware, rate limiting, or role-based access controls. Every public-facing endpoint needs per-IP rate limiting. Every authenticated endpoint needs authorization checks beyond just 'is the user logged in.'",
  },
];

const faqs = [
  {
    question: "Does Claude Code send my code to Anthropic?",
    answer: "Claude Code sends the context of your conversation — including code snippets, file contents you reference, and command outputs — to Anthropic's API for processing. Anthropic's data retention policies apply. Code is not used to train models. For sensitive codebases, review Anthropic's data processing terms and consider which files you expose in conversation versus referencing indirectly.",
  },
  {
    question: "Can I use Claude Code in air-gapped or restricted environments?",
    answer: "Claude Code requires an internet connection to communicate with Anthropic's API. It cannot run fully air-gapped. However, you can limit its network access to only Anthropic's API endpoints using firewall rules. For highly restricted environments, consider using Claude Code on a development machine that has API access but is isolated from production networks.",
  },
  {
    question: "What enterprise security controls are available?",
    answer: "Enterprise deployments can configure centralized permission policies, audit logging of all commands Claude executes, approved command allowlists, and integration with existing security toolchains. Admin-managed settings override user-level configuration. Usage logs can be forwarded to SIEM systems for monitoring and compliance.",
  },
  {
    question: "How do I protect against supply chain attacks when Claude installs dependencies?",
    answer: "Never let Claude run npm install, pip install, or equivalent without reviewing which packages and versions will be added. Pin exact versions in your dependency files — no floating ranges. Run npm audit or pip-audit after any dependency change. Set npm's min-release-age to block packages published within 7 days. Review lockfile diffs carefully — they are the ground truth of what actually changed.",
  },
];

export default async function ClaudeCodeSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-code-security`;

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
                "@type": "Article",
                headline: "Claude Code Security Best Practices: Complete Guide",
                description:
                  "Claude Code runs commands on your machine with your permissions. Learn security best practices for permissions, secrets, hooks, and code review.",
                url: pathForLocale(locale),
                inLanguage: locale,
                image: `${baseUrl}/og-default.png`,
                author: {
                  "@type": "EducationalOrganization",
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
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Code Security", item: pathForLocale(locale) },
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
                href="/courses/why-claude/meet-claude"
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
          <div className="mx-auto max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#ffecd2] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Shield className="size-4" />
              Claude Code · Security
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Use Claude Code Without Security Risk
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Run AI-assisted development without compromising security.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Claude Code runs commands on your machine with your permissions. Security best practices include using permission controls to limit what Claude can execute, reviewing all changes before committing, keeping secrets out of the conversation context, and configuring hooks for automated security checks. This guide covers each layer of defense in detail.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Claude Code Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-code-setup"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Setup Guide
              </Link>
            </div>
          </div>
        </section>

        {/* PERMISSION MODEL */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Lock className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Access Control
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Understanding Claude Code&apos;s Permission Model
            </h2>

            <div className="space-y-4">
              {permissionSections.map((section) => (
                <div key={section.title} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[4px_4px_0px_#1c1917]">
                  <h3 className="mb-2 text-[1.05rem] font-bold text-ink">{section.title}</h3>
                  <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{section.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEEPING SECRETS SAFE */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <KeyRound className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Secret Management
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Keeping Secrets Safe
            </h2>

            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <div className="space-y-4">
                {secretsPractices.map(({ title, detail }) => (
                  <div key={title} className="border-b-[2px] border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="mb-1 font-bold text-ink">{title}</div>
                    <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY HOOKS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <FileWarning className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Automation
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Security Hooks
            </h2>

            <p className="mb-8 text-center text-[1rem] leading-[1.7] text-text-secondary">
              Hooks are automated checks that run at specific points in your workflow — before commits, after dependency changes, or before pushes. They catch security issues that humans miss during manual review.
            </p>

            <div className="space-y-4">
              {hookExamples.map((hook) => (
                <div key={hook.name} className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-center gap-4 border-b-[3px] border-ink px-7 py-4">
                    <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                      <Shield className="size-4 text-orange" />
                    </div>
                    <h3 className="text-[1.05rem] font-extrabold text-ink">{hook.name}</h3>
                  </div>
                  <div className="p-7">
                    <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{hook.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CODE REVIEW PRACTICES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Search className="size-4 text-orange" />
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                Human Review
              </p>
            </div>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Code Review Practices
            </h2>

            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <div className="space-y-4">
                {reviewPractices.map(({ title, detail }) => (
                  <div key={title} className="border-b-[2px] border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="mb-1 font-bold text-ink">{title}</div>
                    <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-[3px_3px_0px_#1c1917]">
                  <h3 className="mb-2 text-[1.05rem] font-bold text-ink">{faq.question}</h3>
                  <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center" data-variant="B">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Secure your development workflow
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Your first secure setup. 20 minutes.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Guide <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="px-6 pb-[80px]">
          <div className="mx-auto max-w-[800px]">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Explore More
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/claude-code-setup", label: "Setup Guide", desc: "Install and configure Claude Code" },
                { href: "/claude-system-prompts", label: "System Prompts", desc: "Control Claude's behavior" },
                { href: "/claude-code-cheat-sheet", label: "Cheat Sheet", desc: "Quick reference for commands" },
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
          </div>
          <p className="text-[0.75rem] text-text-secondary">
            &copy; {new Date().getFullYear()} Learn to GPT. Not affiliated with OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
