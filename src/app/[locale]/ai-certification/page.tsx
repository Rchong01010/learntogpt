import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Award, TrendingUp, BookOpen, Users, Target, Shield, HelpCircle } from "lucide-react";
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
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-certification`;

  const title = "Best AI Certification Programs — ChatGPT & Claude Skills";
  const description =
    "AI certifications that matter prove you can do the work, not just pass a quiz. Here is what employers actually look for, which certifications signal real skill, and how Learn to GPT's 3-level practitioner path is structured.";

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
          alt: "AI Certification — Learn to GPT",
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

const certBenefits = [
  {
    icon: TrendingUp,
    title: "Hiring signal that works",
    desc: "Certifications give hiring managers a fast proxy for skill in a market flooded with \"AI fluent\" self-descriptions. A structured certification path carries more weight than a LinkedIn badge.",
  },
  {
    icon: Target,
    title: "Structured learning path",
    desc: "Without a defined curriculum, most people learn AI tools in fragments. Certification programs force you through the hard concepts — context management, agent architecture, evaluation — that YouTube tutorials skip.",
  },
  {
    icon: Shield,
    title: "Accountability and completion",
    desc: "The certification commitment creates a forcing function. People who enroll in a defined program complete significantly more curriculum than those exploring open-ended resources.",
  },
  {
    icon: Users,
    title: "Team credibility",
    desc: "For managers proposing AI adoption internally, certified team members lend credibility to the initiative. \"Our team has completed ChatGPT practitioner certification\" is a specific, defensible claim.",
  },
  {
    icon: BookOpen,
    title: "Baseline for employers",
    desc: "Organizations deploying ChatGPT internally need to know that employees understand context limits, prompt injection risks, output validation, and when not to trust the model. Certification programs can establish this baseline.",
  },
  {
    icon: Award,
    title: "Professional differentiation",
    desc: "In 2025, most knowledge workers are \"using AI.\" Practitioners with structured certification — who can explain their workflow, audit their prompts, and debug model failures — stand apart from casual users.",
  },
];

const certLevels = [
  {
    level: "Beginner",
    label: "ChatGPT Fundamentals",
    tracks: "Track 1",
    skills: ["First prompts and conversation patterns", "Understanding ChatGPT's thinking style", "Context windows and limits", "Comparing ChatGPT to other models"],
    badge: "bg-[#d0f0ea]",
    badgeText: "text-teal",
  },
  {
    level: "Practitioner",
    label: "ChatGPT Practitioner",
    tracks: "Tracks 1–6",
    skills: ["Professional prompt engineering", "ChatGPT and custom instructions", "System prompt architecture", "API integration patterns", "Real-world workflow automation"],
    badge: "bg-[#fef3e2]",
    badgeText: "text-orange",
  },
  {
    level: "Architect",
    label: "ChatGPT Architect",
    tracks: "Tracks 1–7",
    skills: ["Multi-agent system design", "Hooks and pipeline automation", "Evaluation and benchmarking", "Enterprise deployment patterns", "Safety and alignment considerations"],
    badge: "bg-[#1c1917]",
    badgeText: "text-white",
  },
];

export default async function AiCertificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://learntogpt.com";
  const pathForLocale = (loc: string) =>
    `${baseUrl}${loc === routing.defaultLocale ? "" : `/${loc}`}/ai-certification`;

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
                "@type": "EducationalOccupationalCredential",
                name: "ChatGPT Practitioner Certification",
                description:
                  "Structured AI certification for ChatGPT covering prompting, GPT API integration, and workflow automation.",
                url: pathForLocale(locale),
                inLanguage: locale,
                credentialCategory: "Certificate",
                competencyRequired: [
                  "Prompt engineering",
                  "ChatGPT API",
                  "System prompt architecture",
                  "AI workflow automation",
                  "Multi-agent systems",
                ],
                educationalLevel: ["Beginner", "Intermediate", "Advanced"],
                recognizedBy: {
                  "@type": "EducationalOrganization",
                  name: "Learn to GPT",
                  url: baseUrl,
                },
                image: `${baseUrl}/og-default.png`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Learn to GPT", item: baseUrl },
                  { "@type": "ListItem", position: 2, name: "AI Certification", item: pathForLocale(locale) },
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
              <Link href="/curriculum" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange max-[480px]:hidden">
                Curriculum
              </Link>
              <LocaleSwitcher />
              <Link href="/sign-in" className="text-[0.85rem] font-semibold text-text-secondary transition-colors hover:text-orange">
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
          <div className="mx-auto max-w-[800px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#d0f0ea] px-[18px] py-2 font-mono text-[0.8rem] font-semibold text-ink shadow-[3px_3px_0px_#1c1917]">
              <Award className="size-4" />
              Career &amp; Professional Development
            </div>
            <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.4rem] max-[480px]:text-[1.8rem]">
              Get an AI Certification That Proves You Can Do the Work
            </h1>
            <p className="mt-4 font-serif text-[1.6rem] italic text-walnut max-md:text-[1.2rem]">
              Stop reading about it. Build something.
            </p>
            <p className="mx-auto mb-10 mt-7 max-w-[620px] text-[1.1rem] font-normal leading-[1.7] text-text-secondary">
              The AI certification market is noisy. Most badges certify that you watched videos. A small number — including Learn to GPT&apos;s path — certify that you can actually do the work. This page explains how to tell the difference, and how Learn to GPT&apos;s structured certification path is built.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 max-[480px]:flex-col max-[480px]:items-center">
              <Link
                href="/certification"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Certification Path
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917] max-[480px]:w-full max-[480px]:max-w-[320px]"
              >
                Advanced Masterclass
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT ANSWER BLOCK */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-[#d0f0ea] p-8 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <p className="text-[1.1rem] font-medium leading-[1.8] text-ink">
                The best AI certifications test practical skills, not theory. Look for hands-on assessments where you build real projects with AI tools like ChatGPT or Claude, not multiple-choice exams. Certifications that require demonstrated workflow competency carry the most weight with employers.
              </p>
            </div>
          </div>
        </section>

        {/* WHY IT MATTERS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-[18px] border-[4px] border-ink bg-cream p-10 shadow-[6px_6px_0px_#1c1917] max-[480px]:p-6">
              <h2 className="mb-4 text-[1.8rem] font-extrabold text-ink max-md:text-[1.4rem]">
                Why AI Certification Matters Now
              </h2>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                In 2024, major firms began using AI proficiency as a hiring filter — not a nice-to-have. In early 2025, a leaked video showed a Tier 1 quantitative trading firm rejecting a candidate offering a compensation package worth $385,000 for refusing to demonstrate ChatGPT in a live interview. The interviewer&apos;s reasoning: &quot;We need engineers who are already working this way.&quot;
              </p>
              <p className="mb-4 text-[1.05rem] leading-[1.7] text-text-secondary">
                That signal has reached broader hiring markets. Recruiters at enterprise technology, consulting, and financial services firms now screen for demonstrated AI workflow skills, not just self-reported familiarity. Certification programs — especially those that assess applied skill rather than passive viewing — have become the closest proxy hiring managers have.
              </p>
              <p className="text-[1.05rem] leading-[1.7] text-text-secondary">
                The question is not whether to get certified. It is which certification actually measures the skills that matter.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1160px]">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
              Why Certification Signals Value
            </p>
            <h2 className="mt-3 text-center text-[2rem] font-extrabold leading-[1.2] text-ink">
              Six reasons structured certification matters
            </h2>

            <div className="mx-auto mt-11 grid max-w-[960px] gap-6 max-md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {certBenefits.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-[18px] border-[3px] border-ink bg-cream p-[28px_24px] shadow-[3px_3px_0px_#1c1917] transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_6px_0px_#1c1917]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border-[3px] border-ink bg-[#d0f0ea] shadow-[2px_2px_0px_#1c1917]">
                      <Icon className="size-5 text-teal" />
                    </div>
                    <div className="mb-2 text-[1.05rem] font-bold text-ink">{item.title}</div>
                    <div className="text-[0.9rem] leading-[1.6] text-text-secondary">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHAT SIGNALS REAL SKILL */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              How to Evaluate an AI Certification Program
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Does it assess applied skill or passive knowledge?",
                  a: "Programs that only ask you to watch videos and answer multiple-choice questions measure retention, not capability. Look for programs that require you to write prompts, debug outputs, and build actual workflows.",
                },
                {
                  q: "Is the curriculum model-specific or generic?",
                  a: "Generic \"AI literacy\" programs teach concepts that apply everywhere and deeply nowhere. Model-specific certification — particularly for ChatGPT, which has a distinct architecture and unique capabilities — produces more immediately applicable skills.",
                },
                {
                  q: "Does it cover failure modes and limits?",
                  a: "Strong programs teach when not to use AI, how to detect hallucination, output validation patterns, and what tasks ChatGPT handles poorly. If the curriculum is purely positive, it is marketing content, not education.",
                },
                {
                  q: "Is there a clear progression from beginner to advanced?",
                  a: "Look for a structured track system that forces you through foundational concepts before advanced ones. Skipping fundamentals is how practitioners end up with surface-level skills that break on real tasks.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-[16px] border-[3px] border-ink bg-cream p-6 shadow-[3px_3px_0px_#1c1917]">
                  <div className="mb-2 text-[1.05rem] font-bold text-ink">{q}</div>
                  <p className="text-[0.95rem] leading-[1.7] text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLAUDE ACADEMY CERT PATH */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-8 text-center text-[2rem] font-extrabold text-ink">
              Learn to GPT Certification Path
            </h2>
            <div className="space-y-6">
              {certLevels.map(({ level, label, tracks, skills, badge, badgeText }) => (
                <div key={level} className="rounded-[18px] border-[4px] border-ink bg-cream p-8 shadow-[6px_6px_0px_#1c1917]">
                  <div className="mb-4 flex items-center gap-4">
                    <div className={`rounded-full border-2 border-ink ${badge} px-4 py-1.5 font-mono text-[0.8rem] font-bold ${badgeText}`}>
                      {level}
                    </div>
                    <div>
                      <div className="text-[1.2rem] font-extrabold text-ink">{label}</div>
                      <div className="font-mono text-[0.8rem] text-text-secondary">{tracks}</div>
                    </div>
                  </div>
                  <ul className="ml-4 space-y-2">
                    {skills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2 text-[0.95rem] text-text-secondary">
                        <ArrowRight className="size-3 flex-shrink-0 text-orange" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[0.9rem] text-text-secondary">
              Tracks 1 and 6 are free — no credit card required. Tracks 2–7 are included in the advanced masterclass.
            </p>
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
                { q: "What is the best AI certification?", a: "The best AI certification depends on which tools you use. For ChatGPT users, Learn to GPT offers practical certifications. For Claude AI, Claude Academy provides a 3-level path. Both test hands-on skills, not memorization." },
                { q: "Is AI certification worth it?", a: "AI certification demonstrates practical competency to employers. Hands-on certifications that test real workflows carry more weight than theoretical exams. Pair certification with a portfolio of projects you built with AI." },
                { q: "How long does AI certification take?", a: "Beginner certification can be earned in one focused weekend. Practitioner level takes 2-4 weeks of regular practice. Advanced certification requires demonstrating complex agent and API skills." },
                { q: "Do employers recognize AI certifications?", a: "Employers increasingly look for demonstrated AI skills. A hands-on certification paired with real projects is the strongest signal. The best certifications link directly to your actual coursework and builds." },
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
          <div className="mx-auto max-w-[800px]">
            <h2 className="text-[2.4rem] font-extrabold leading-[1.2] text-ink max-md:text-[1.9rem]">
              Start your{" "}
              <em className="font-serif font-normal not-italic text-orange italic">
                certification path
              </em>
            </h2>
            <p className="mt-2 font-serif text-[1.5rem] italic text-walnut">
              Free to start. Structured to finish. Provable when you&apos;re done.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/certification"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-orange px-10 py-4 text-[1.1rem] font-bold text-white shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                View Certification Path
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/masterclass"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-ink bg-cream px-10 py-4 text-[1.1rem] font-bold text-ink shadow-[6px_6px_0px_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1c1917]"
              >
                Advanced Masterclass
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
                { href: "/certification", label: "Certification Levels", desc: "Beginner to Architect path" },
                { href: "/masterclass", label: "Masterclass", desc: "Advanced track and workshops" },
                { href: "/curriculum", label: "Curriculum", desc: "All 7 tracks and courses" },
                { href: "/learn", label: "Start Free", desc: "Free tracks, no card required" },
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
