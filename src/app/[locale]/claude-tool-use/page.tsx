import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Wrench, Code2, Cpu, Layers, Zap, Terminal, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-tool-use`;

  const title = "Best Claude Tool Use Guide — Function Calling & MCP";
  const description =
    "Master Claude tool use and function calling. Learn how to give Claude access to APIs, databases, and external systems — with real code examples and production patterns.";

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
          alt: "Claude Tool Use — Learn to GPT",
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

const steps = [
  {
    number: "01",
    title: "Define the tool",
    description: "You describe a function — its name, what it does, and what parameters it accepts — as a JSON schema. Claude reads this definition and understands when to call it.",
    code: `{
  "name": "get_weather",
  "description": "Get current weather for a city",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "units": { "type": "string", "enum": ["celsius","fahrenheit"] }
    },
    "required": ["city"]
  }
}`,
  },
  {
    number: "02",
    title: "Claude decides when to call it",
    description: "Based on the user's message and the tool description, Claude determines whether to call the tool, which parameters to pass, and — critically — whether a tool call is even necessary.",
    code: `# User: "What's the weather in Tokyo right now?"
# Claude decides: tool call needed

tool_use = {
  "type": "tool_use",
  "name": "get_weather",
  "input": { "city": "Tokyo", "units": "celsius" }
}`,
  },
  {
    number: "03",
    title: "You execute and return results",
    description: "Your application runs the actual function — calls the API, queries the database, whatever it is — and returns the result to Claude as a tool_result message.",
    code: `# Your app runs the real function
result = weather_api.get("Tokyo")

# Return result to Claude
tool_result = {
  "type": "tool_result",
  "tool_use_id": tool_use["id"],
  "content": json.dumps(result)
}`,
  },
  {
    number: "04",
    title: "Claude synthesizes the response",
    description: "Claude reads the tool result and formulates a natural language response for the user. It can make multiple tool calls in sequence, chain outputs, and handle errors gracefully.",
    code: `# Claude responds with real data
"Tokyo is currently 22°C with partly cloudy
skies. Humidity is at 65%. Good conditions
for outdoor activities today."`,
  },
];

const patterns = [
  {
    icon: Wrench,
    title: "Single tool, direct lookup",
    desc: "The simplest pattern. One tool, one call, one response. Ideal for weather lookups, database queries, or API fetches where you need a single piece of data to answer a question.",
  },
  {
    icon: Layers,
    title: "Parallel tool calls",
    desc: "Claude can call multiple tools in a single turn — simultaneously if they are independent. Fetch user data, check inventory, and query pricing all in one round trip before composing the answer.",
  },
  {
    icon: Zap,
    title: "Chained / sequential tool calls",
    desc: "The output of one tool feeds into the next. Claude searches for a product, reads the result, then calls a second tool to check stock at the nearest warehouse — no manual orchestration required.",
  },
  {
    icon: Cpu,
    title: "Agentic loops",
    desc: "In agentic mode, Claude continues calling tools until it has everything needed to complete a task. It handles intermediate failures, adjusts its strategy, and reports back only when done.",
  },
  {
    icon: Code2,
    title: "Forced tool use",
    desc: "You can set tool_choice to force Claude to call a specific tool regardless of context. Useful for structured data extraction — guaranteed JSON output every time, no free-text fallback.",
  },
  {
    icon: Terminal,
    title: "Computer use tools",
    desc: "Claude's computer use capability exposes a special set of tools: screenshot, click, type, scroll. Claude can operate desktop applications and browsers autonomously using this pattern.",
  },
];

export default async function ClaudeToolUsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/claude-tool-use`;

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
                name: "How to Use Claude Tool Use and Function Calling",
                description:
                  "Step-by-step guide to implementing Claude tool use — define tools, let Claude decide when to call them, execute functions, and return results.",
                url: pathForLocale(locale),
                inLanguage: locale,
                image: `${baseUrl}/og-default.png`,
                step: steps.map((s, i) => ({
                  "@type": "HowToStep",
                  position: i + 1,
                  name: s.title,
                  text: s.description,
                })),
                tool: [
                  { "@type": "HowToTool", name: "Anthropic Python SDK" },
                  { "@type": "HowToTool", name: "Claude API" },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "Claude Tool Use Guide", item: pathForLocale(locale) },
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
                href="/courses/why-chatgpt/meet-chatgpt"
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
              <Wrench className="size-4" />
              Claude API · Tool Use
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Connect Claude to Any API or Database with Tool Use
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Give Claude access to your APIs, databases, and systems.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[660px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              Tool use (also called function calling) is how you connect Claude to the real world. Instead of answering from training data, Claude can query live APIs, read databases, trigger workflows, and interact with external services — all while deciding autonomously when a tool is needed and what to pass it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col">
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Start Building with Tools <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/claude-for-developers"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                ChatGPT for Developers
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                Claude tool use (function calling) lets Claude interact with external APIs, databases, and services during a conversation. You define tools as JSON schemas, and Claude decides when to call them based on the user's request. This is the foundation of building AI agents that take real actions.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[860px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              How It Works
            </p>
            <h2 className="mt-3 mb-10 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              The tool use loop, step by step
            </h2>

            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="rounded-[18px] border-[3px] border-ink bg-cream shadow-[4px_4px_0px_#1c1917]">
                  <div className="flex items-center gap-4 border-b-[3px] border-ink px-7 py-4">
                    <span className="font-mono text-[1.4rem] font-extrabold text-orange">{step.number}</span>
                    <h3 className="text-[1.1rem] font-extrabold text-ink">{step.title}</h3>
                  </div>
                  <div className="p-7">
                    <p className="mb-4 text-[1rem] leading-[1.7] text-text-secondary">{step.description}</p>
                    <div className="overflow-hidden rounded-[12px] border-[3px] border-ink">
                      <div className="flex items-center gap-2 bg-[#1c1917] px-4 py-3">
                        <div className="size-2.5 rounded-full bg-[#c94040]" />
                        <div className="size-2.5 rounded-full bg-gold" />
                        <div className="size-2.5 rounded-full bg-teal" />
                      </div>
                      <pre className="sandbox-lined p-5 font-mono text-[0.82rem] leading-[1.7] text-ink overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PATTERNS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Design Patterns
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              6 tool use patterns for production
            </h2>
            <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-2 lg:grid-cols-3">
              {patterns.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#ffecd2] shadow-[2px_2px_0px_#1c1917]">
                    <Icon className="size-5 text-orange" />
                  </div>
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">{title}</div>
                  <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEST PRACTICES */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-6 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Production best practices
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Write descriptions like documentation", body: "Claude decides whether to call a tool based entirely on its description. Write it as if documenting a function for another developer — be specific about what it returns, when to use it, and what the parameters mean." },
                  { title: "Return structured data, not prose", body: "Tool results should be machine-readable (JSON) rather than natural language. Claude is better at synthesizing structured data into a coherent response than parsing free-text tool outputs." },
                  { title: "Handle tool errors explicitly", body: "Return errors as tool_result with is_error: true. Claude will read the error message and decide whether to retry with different parameters, try another tool, or explain the issue to the user." },
                  { title: "Limit tool count per request", body: "More tools means more tokens in the context window and more opportunity for Claude to choose incorrectly. Pass only the tools relevant to the current task. Use dynamic tool selection at the application layer." },
                  { title: "Validate and sanitize tool inputs", body: "Even though Claude generates tool inputs, treat them as untrusted data at the execution layer. Validate parameter types, check bounds, and never execute raw SQL from a tool_use input without sanitization." },
                ].map(({ title, body }) => (
                  <div key={title} className="border-b-[2px] border-ink/10 pb-4 last:border-0 last:pb-0">
                    <div className="mb-1 font-bold text-ink">{title}</div>
                    <p className="text-[0.92rem] leading-[1.6] text-text-secondary">{body}</p>
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
              {[
                { q: "What is Claude tool use?", a: "Claude tool use (function calling) lets Claude interact with external APIs, databases, and services during a conversation. You define tools as JSON schemas and Claude decides when to call them based on the user's request." },
                { q: "Is Claude tool use the same as MCP?", a: "Tool use and MCP are related but different. Tool use is the API-level capability for function calling. MCP (Model Context Protocol) is a standardized protocol for connecting Claude to external data sources and tools via a server interface." },
                { q: "What can I build with Claude tool use?", a: "You can build AI agents that search databases, call APIs, process files, send emails, manage calendars, and take any programmable action. Tool use is the foundation of agentic Claude workflows." },
                { q: "How many tools can Claude use at once?", a: "Claude can handle dozens of tool definitions in a single request. It selects the appropriate tool based on the user's intent and can chain multiple tool calls sequentially to complete multi-step tasks." },
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

        {/* FINAL CTA */}
        <section className="px-6 pb-[100px] pt-16 text-center">
          <div className="mx-auto max-w-[700px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Build your first tool-using agent
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              The API tutorial walks you through the full loop.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/claude-api-tutorial"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Claude API Tutorial <ArrowRight className="size-5" />
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
                { href: "/claude-api-tutorial", label: "API Tutorial", desc: "Authentication, streaming, first call" },
                { href: "/claude-agents", label: "Claude Agents", desc: "Multi-agent architecture patterns" },
                { href: "/claude-for-developers", label: "For Developers", desc: "Full developer resource hub" },
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
