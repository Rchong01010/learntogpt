import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Asset pack — Learn to GPT affiliates",
  description: "Logos, screenshots, positioning brief, and caption templates for promoting Learn to GPT.",
};

export default function AffiliateAssetsPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ec] py-12 px-4">
      <article className="max-w-3xl mx-auto prose prose-stone">
        <header className="mb-8 not-prose">
          <h1 className="text-4xl font-bold text-[#1f1b14] mb-2">Affiliate asset pack</h1>
          <p className="text-lg text-stone-600">
            Everything you need to promote Learn to GPT. Copy, adapt, make it your own.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">One-line pitch</h2>
          <blockquote className="border-l-4 border-[#e07a3a] bg-white p-4 italic text-stone-700">
            Learn to GPT teaches non-technical people how to actually USE AI — not just read about
            it. For the person who signed up for ChatGPT six months ago and never figured it out.
          </blockquote>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Core positioning</h2>
          <ul className="space-y-2 text-stone-700">
            <li>
              <strong>Who it&apos;s for:</strong> Smart, non-technical people whose coworkers are using
              AI and they feel behind
            </li>
            <li>
              <strong>What it teaches:</strong> How to prompt, pick the right tool, build AI into
              actual workflows — specifically using ChatGPT
            </li>
            <li>
              <strong>Format:</strong> Gamified lessons, real exercises, 10-minute chunks, not
              another video course
            </li>
            <li>
              <strong>Format:</strong> Free to start, with paid advanced tracks
            </li>
            <li>
              <strong>Languages:</strong> English, Spanish, Portuguese, French, German, Hindi,
              Japanese, Korean, Chinese, and more
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Caption templates (adapt to your voice)</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">
                TikTok / IG Reel — skill-gap angle
              </p>
              <p className="text-stone-700">
                if you signed up for ChatGPT months ago and still have no idea how to actually use
                it at work — this course is it. it&apos;s literally built for people who aren&apos;t tech
                people. use my link [LINK], 20% off first month.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">
                TikTok / IG Reel — peer-pressure angle
              </p>
              <p className="text-stone-700">
                my coworkers started using AI and i was too embarrassed to admit i didn&apos;t know
                what prompting meant. Learn to GPT literally fixed that in a weekend. 20% off with
                my code [CODE].
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">
                Twitter / X — before-after thread opener
              </p>
              <p className="text-stone-700">
                three months ago i didn&apos;t know what a prompt was. today i automate half my job
                with ChatGPT. short thread on what actually changed ↓<br />
                (the course: [LINK], 20% off)
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">
                Newsletter / blog — educational angle
              </p>
              <p className="text-stone-700">
                The gap between &quot;I heard AI is useful&quot; and &quot;I actually use it daily&quot; is almost
                entirely a skill-gap problem. Learn to GPT is the only course I&apos;ve found that
                treats it that way — structured, hands-on, not another YouTube playlist. 20% off
                first month with code [CODE].
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What to show in your video / post</h2>
          <ul className="space-y-2 text-stone-700">
            <li>
              <strong>Open with a confusion admission:</strong> &quot;I signed up for ChatGPT and just
              stared at the blank chat box&quot; or similar
            </li>
            <li>
              <strong>Show the product briefly:</strong> a lesson, an exercise, the gamified XP
              (screenshots at{" "}
              <a href="https://learntogpt.com" className="text-[#e07a3a]">
                learntogpt.com
              </a>
              )
            </li>
            <li>
              <strong>One concrete skill learned:</strong> &quot;now I know how to structure prompts
              for [specific task]&quot;
            </li>
            <li>
              <strong>Soft CTA:</strong> &quot;link in bio, 20% off first month with [CODE]&quot;
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Things to avoid</h2>
          <ul className="space-y-1 text-stone-700">
            <li>❌ Claiming Learn to GPT does AI work FOR you (it teaches you how)</li>
            <li>❌ Hyping it as &quot;make millions with AI&quot; — this is a skill course</li>
            <li>❌ Comparing dismissively to free YouTube videos (it&apos;s structured curriculum)</li>
            <li>❌ Bot-speak: &quot;game-changer&quot;, &quot;10x&quot;, &quot;literally obsessed&quot;</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Logo + brand colors</h2>
          <p className="text-stone-700 mb-4">Logos and high-res brand assets are rolling out in the next week. In the meantime:</p>
          <ul className="space-y-1 text-stone-700">
            <li>
              <strong>Primary orange:</strong>{" "}
              <code className="bg-stone-100 px-2 py-0.5 rounded">#e07a3a</code>
            </li>
            <li>
              <strong>Background cream:</strong>{" "}
              <code className="bg-stone-100 px-2 py-0.5 rounded">#f7f3ec</code>
            </li>
            <li>
              <strong>Text dark:</strong>{" "}
              <code className="bg-stone-100 px-2 py-0.5 rounded">#1f1b14</code>
            </li>
          </ul>
          <p className="text-stone-700 mt-4">
            Need the brand pack faster? Email{" "}
            <a href="mailto:reid@getateam.ai" className="text-[#e07a3a] underline">
              reid@getateam.ai
            </a>
            .
          </p>
        </section>

        <section className="not-prose text-center pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-500 mb-4">
            Don&apos;t have your affiliate code yet?
          </p>
          <Link
            href="/affiliates/apply"
            className="inline-block bg-[#e07a3a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c46927] transition-colors"
          >
            Apply to the affiliate program →
          </Link>
        </section>
      </article>
    </div>
  );
}
