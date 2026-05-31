import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Plug, Database, Globe, FolderOpen, GitBranch, Zap, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-mcp-servers`;

  const title = "Claude MCP Servers: What They Are and How to Set Them Up";
  const description =
    "Model Context Protocol (MCP) lets Claude connect to any tool — databases, APIs, file systems, GitHub. Learn what MCP servers are, how to install them, and which ones to start with.";

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
          alt: "Claude MCP Servers — Learn to GPT",
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

const mcpServers = [
  {
    icon: FolderOpen,
    name: "Filesystem",
    desc: "Read and write files on your local machine. Claude can browse directories, read config files, and write code to disk.",
    install: "npx @modelcontextprotocol/server-filesystem /path/to/dir",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Database,
    name: "PostgreSQL",
    desc: "Connect Claude to a Postgres database. It can run queries, inspect schemas, and build reports — all in natural language.",
    install: "npx @modelcontextprotocol/server-postgres postgresql://localhost/db",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
  {
    icon: GitBranch,
    name: "GitHub",
    desc: "Read repos, open PRs, create issues, and review code. Claude becomes an active participant in your GitHub workflow.",
    install: "GITHUB_TOKEN=... npx @modelcontextprotocol/server-github",
    color: "bg-[#e8e4ff]",
    textColor: "text-[#6b5aed]",
  },
  {
    icon: Globe,
    name: "Brave Search",
    desc: "Give Claude real-time web search via the Brave API. Claude can research topics, find documentation, and verify facts.",
    install: "BRAVE_API_KEY=... npx @modelcontextprotocol/server-brave-search",
    color: "bg-[#ffd6e0]",
    textColor: "text-[#c2185b]",
  },
  {
    icon: Database,
    name: "SQLite",
    desc: "Connect Claude to a local SQLite database. Analyze data, write queries, and generate reports without writing any SQL yourself.",
    install: "npx @modelcontextprotocol/server-sqlite ./data.db",
    color: "bg-[#d0f0ea]",
    textColor: "text-teal",
  },
  {
    icon: Plug,
    name: "Slack",
    desc: "Read channels, search messages, and post updates. Claude can monitor Slack for relevant threads and draft responses.",
    install: "SLACK_BOT_TOKEN=... npx @modelcontextprotocol/server-slack",
    color: "bg-[#ffecd2]",
    textColor: "text-orange",
  },
];

const steps = [
  {
    step: "1",
    title: "Choose an MCP server",
    body: "Browse the official MCP server list at modelcontextprotocol.io or on GitHub. Most common servers cover: filesystem, databases (Postgres, SQLite), GitHub, Slack, web search, and memory.",
  },
  {
    step: "2",
    title: "Add it to your Claude config",
    body: "MCP servers are configured in ~/.claude/claude_desktop_config.json (for Claude Desktop) or directly in Claude Code via the --mcp-config flag. Each server entry specifies the command to run and any required environment variables.",
  },
  {
    step: "3",
    title: "Set environment variables",
    body: "Most MCP servers need API keys or connection strings: GITHUB_TOKEN, DATABASE_URL, BRAVE_API_KEY, etc. Keep these in your shell environment or a .env file — never hardcode them.",
  },
  {
    step: "4",
    title: "Restart Claude and test",
    body: "After editing the config, restart Claude Desktop or start a new Claude Code session. Claude will automatically discover the new tools and you can ask it to use them — no additional commands required.",
  },
];

export default async function ClaudeMcpServersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("for-teams");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pagePath = `${baseUrl}${locale === routing.defaultLocale ? "" : `/${locale}`}/claude-mcp-servers`;

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
                "@type": "HowTo",
                name: "How to Set Up Claude MCP Servers",
                description:
                  "Step-by-step guide to installing and configuring Model Context Protocol servers with Claude Code and Claude Desktop.",
                url: pagePath,
                step: steps.map((s, i) => ({
                  "@type": "HowToStep",
                  position: i + 1,
                  name: s.title,
                  text: s.body,
                })),
              },
              {
                "@type": "Article",
                headline: "Claude MCP Servers: What They Are and How to Set Them Up",
                description:
                  "Model Context Protocol (MCP) lets Claude connect to databases, APIs, file systems, and GitHub. A complete setup guide.",
                url: pagePath,
                inLanguage: locale,
                author: { "@type": "Organization", name: "Learn to GPT", url: baseUrl },
                publisher: { "@type": "EducationalOrganization", name: "Learn to GPT", url: baseUrl },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude MCP Servers", item: pagePath },
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
              <Link href="/courses/practitioner-setup/skills-and-mcps" className="inline-flex items-center rounded-full border-[3px] border-ink bg-orange px-[22px] py-[10px] text-[0.85rem] font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]">
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Tutorial</p>
            <h1 className="mt-3 text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Connect Claude to Any Tool with MCP Servers
            </h1>
            <p className="mt-3 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Connect Claude to any tool — databases, APIs, GitHub, and more
            </p>
            <p className="mx-auto mb-10 mt-6 max-w-[660px] text-[1.05rem] leading-[1.7] text-text-secondary">
              The Model Context Protocol (MCP) is an open standard that lets Claude connect to external tools and data sources. Instead of copy-pasting data into a chat window, Claude reads directly from your database, file system, or APIs — in real time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude Code Course
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                For Developers
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                MCP (Model Context Protocol) servers are local processes that connect Claude to external tools and data sources using a standardized protocol. Instead of copy-pasting data into a chat, MCP lets Claude directly read files, query databases, search the web, and interact with APIs like GitHub and Slack. You configure MCP servers in a JSON file, and Claude discovers and uses them automatically.
              </p>
            </div>
          </div>
        </section>

        {/* What is MCP */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">The Concept</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">What is Model Context Protocol?</h2>
            <div className="mt-10 space-y-6">
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">MCP is a USB-C for AI tools</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  MCP defines a standard way for AI models to talk to external systems — file systems, databases, APIs, and services. Like USB-C standardizing hardware connections, MCP standardizes how Claude (and other AI models) connect to tools. You write a server once; any MCP-compatible model can use it.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">How it works: client → server → tool</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  Claude Code (or Claude Desktop) acts as the MCP client. MCP servers run as local processes alongside Claude. When Claude needs to read a file or query a database, it sends a structured request to the appropriate MCP server, which executes the operation and returns the result. Claude sees it as a tool call — like calling a function — but it&apos;s talking to a real, live system.
                </p>
              </div>
              <div className="rounded-[16px] border-[3px] border-ink bg-cream p-[24px_28px] shadow-[3px_3px_0px_#1c1917]">
                <div className="mb-2 text-[1.05rem] font-bold text-ink">Why this matters for agents</div>
                <p className="text-[0.9rem] leading-[1.6] text-text-secondary">
                  MCP turns Claude from a conversational assistant into an agent that acts on real systems. With the right MCP servers, Claude can read your Postgres database, write to your file system, push commits to GitHub, search the web, and post to Slack — all within a single autonomous session. No copy-paste. No manual handoffs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Setup steps */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Step by Step</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">How to set up an MCP server</h2>
            <div className="mt-10 space-y-4">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-4 rounded-[16px] border-[3px] border-ink bg-cream p-[20px_24px] shadow-[3px_3px_0px_#1c1917]">
                  <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-orange font-mono text-[1rem] font-bold text-white shadow-[2px_2px_0px_#1c1917]">
                    {s.step}
                  </div>
                  <div>
                    <div className="mb-1 text-[1rem] font-bold text-ink">{s.title}</div>
                    <p className="text-[0.9rem] leading-[1.6] text-text-secondary">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Config example */}
            <div className="mt-10 overflow-hidden rounded-[18px] border-[4px] border-ink shadow-[4px_4px_0px_#1c1917]">
              <div className="flex items-center gap-2 bg-ink px-6 py-3">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[0.75rem] text-white/60">~/.claude/claude_desktop_config.json</span>
              </div>
              <div className="bg-[#1c1917] p-6 font-mono text-[0.82rem] leading-[1.8] text-green-400">
                <div className="text-white/70">{"{"}</div>
                <div className="ml-4 text-white/70">{'"mcpServers": {'}</div>
                <div className="ml-8 text-white/70">{'"filesystem": {'}</div>
                <div className="ml-12"><span className="text-orange">&quot;command&quot;</span><span className="text-white/70">: </span><span className="text-green-400">&quot;npx&quot;</span><span className="text-white/70">,</span></div>
                <div className="ml-12"><span className="text-orange">&quot;args&quot;</span><span className="text-white/70">: [</span><span className="text-green-400">&quot;@modelcontextprotocol/server-filesystem&quot;</span><span className="text-white/70">, </span><span className="text-green-400">&quot;/home/user/projects&quot;</span><span className="text-white/70">]</span></div>
                <div className="ml-8 text-white/70">{"}"}<span className="text-white/40">,</span></div>
                <div className="ml-8 text-white/70">{'"github": {'}</div>
                <div className="ml-12"><span className="text-orange">&quot;command&quot;</span><span className="text-white/70">: </span><span className="text-green-400">&quot;npx&quot;</span><span className="text-white/70">,</span></div>
                <div className="ml-12"><span className="text-orange">&quot;args&quot;</span><span className="text-white/70">: [</span><span className="text-green-400">&quot;@modelcontextprotocol/server-github&quot;</span><span className="text-white/70">],</span></div>
                <div className="ml-12"><span className="text-orange">&quot;env&quot;</span><span className="text-white/70">: {"{ "}</span><span className="text-green-400">&quot;GITHUB_TOKEN&quot;</span><span className="text-white/70">: </span><span className="text-green-400">&quot;ghp_...&quot;</span><span className="text-white/70"> {"}"}</span></div>
                <div className="ml-8 text-white/70">{"}"}</div>
                <div className="ml-4 text-white/70">{"}"}</div>
                <div className="text-white/70">{"}"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular servers */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Popular Servers</p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">The MCP servers to start with</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mcpServers.map((server) => (
                <div key={server.name} className="rounded-[18px] border-[3px] border-ink bg-cream p-[24px_22px] shadow-[3px_3px_0px_#1c1917]">
                  <div className={`mb-4 flex size-[48px] items-center justify-center rounded-full border-[3px] border-ink ${server.color} shadow-[2px_2px_0px_#1c1917]`}>
                    <server.icon className={`size-5 ${server.textColor}`} />
                  </div>
                  <div className="mb-2 text-[1rem] font-bold text-ink">{server.name}</div>
                  <p className="mb-3 text-[0.88rem] leading-[1.6] text-text-secondary">{server.desc}</p>
                  <div className="overflow-x-auto rounded-[8px] bg-[#1c1917] p-3">
                    <code className="font-mono text-[0.72rem] text-green-400">{server.install}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BUILDING CUSTOM MCP SERVERS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Building Your Own MCP Server
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                If the pre-built MCP servers do not cover your use case, you can build your own. An MCP server is a program that exposes tools via the MCP protocol. You define what each tool does, what parameters it accepts, and what it returns. Claude discovers these tools automatically and calls them when relevant.
              </p>
              <div className="space-y-4">
                <div className="rounded-[12px] border-[2px] border-ink/20 bg-linen p-5">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">TypeScript SDK</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    The official @modelcontextprotocol/sdk package provides TypeScript bindings for building MCP servers. Define tools as functions with typed parameters and Claude handles the rest.
                  </p>
                </div>
                <div className="rounded-[12px] border-[2px] border-ink/20 bg-linen p-5">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">Python SDK</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    For Python projects, the mcp package provides the same server-building capabilities. Define tools with decorators, and the SDK handles protocol serialization and transport.
                  </p>
                </div>
                <div className="rounded-[12px] border-[2px] border-ink/20 bg-linen p-5">
                  <div className="mb-1 text-[0.95rem] font-bold text-ink">When to build custom</div>
                  <p className="text-[0.88rem] leading-[1.6] text-text-secondary">
                    Build a custom MCP server when you need Claude to interact with an internal API, a proprietary database, or a workflow tool that does not have a pre-built server. Common examples: CRM lookups, internal documentation search, deployment pipelines, and monitoring dashboards.
                  </p>
                </div>
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
              {[
                {
                  q: "Is MCP only for Claude?",
                  a: "MCP is an open standard. While Anthropic created it and Claude has first-class support, any AI model can implement MCP client support. The protocol is designed to be model-agnostic.",
                },
                {
                  q: "Do MCP servers run in the cloud?",
                  a: "MCP servers typically run locally on your machine, alongside Claude Code or Claude Desktop. They communicate via stdio or HTTP. This means your data stays on your machine, and Claude accesses it through the local MCP server process.",
                },
                {
                  q: "How many MCP servers can I run at once?",
                  a: "There is no hard limit. You can configure as many MCP servers as you need in your config file. Claude discovers all available tools at startup and calls the right one based on context. Common setups include 3-5 servers covering filesystem, database, and one or two external services.",
                },
                {
                  q: "Do I need to know how to code to use MCP?",
                  a: "Using pre-built MCP servers requires only basic terminal skills. Install via npx, add to your config file, and restart Claude. Building custom MCP servers requires programming knowledge in TypeScript or Python.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-teal" />
                    <h3 className="text-[1rem] font-bold text-ink">{item.q}</h3>
                  </div>
                  <p className="ml-8 text-[0.9rem] leading-[1.6] text-text-secondary">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-[80px] pt-8 text-center">
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.8rem]">
              Learn MCP hands-on
            </h2>
            <p className="mt-2 font-serif text-[1.3rem] italic text-walnut">
              The Claude Code track covers MCP setup, tool use, and agentic patterns.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/claude-code"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                GPT Code Track
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                For Developers
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
                { href: "/claude-code", label: "Claude Code", desc: "Agentic terminal for developers" },
                { href: "/claude-for-developers", label: "For Developers", desc: "API, CLI, and agent workflows" },
                { href: "/claude-code-vs-cursor", label: "Claude Code vs Cursor", desc: "Which dev tool is right for you" },
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
            <Link href="/claude-code" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Claude Code</Link>
            <Link href="/claude-for-developers" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">For Developers</Link>
            <Link href="/curriculum" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Curriculum</Link>
            <Link href="/terms" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Terms</Link>
            <Link href="/privacy" className="text-[0.85rem] font-medium text-text-secondary transition-colors hover:text-orange">Privacy</Link>
          </div>
          <p className="text-[0.75rem] text-text-secondary">Learn to GPT</p>
        </div>
      </footer>
    </div>
  );
}
