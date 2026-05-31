"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Channel = "tiktok" | "instagram" | "youtube" | "twitter" | "substack";

export default function AffiliateApplyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [primaryChannel, setPrimaryChannel] = useState<Channel>("tiktok");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [substackHandle, setSubstackHandle] = useState("");
  const [reachEstimate, setReachEstimate] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    coupon_code: string;
    share_url: string;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const turnstileRef = useRef<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Please accept the affiliate terms to continue.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    const payload = {
      name,
      email,
      payout_email: payoutEmail,
      primary_channel: primaryChannel,
      tiktok_handle: tiktokHandle || undefined,
      instagram_handle: instagramHandle || undefined,
      youtube_handle: youtubeHandle || undefined,
      twitter_handle: twitterHandle || undefined,
      substack_handle: substackHandle || undefined,
      reach_estimate: parseInt(reachEstimate, 10),
      preferred_language: preferredLanguage,
      terms_accepted: termsAccepted,
      website, // honeypot
      turnstile_token: captchaToken,
    };

    try {
      const res = await fetch("/api/affiliates/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setCaptchaToken(null);
        turnstileRef.current?.reset();
        setLoading(false);
        return;
      }

      setSuccess({ coupon_code: data.coupon_code, share_url: data.share_url });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#e07a3a]">You&apos;re in!</CardTitle>
            <CardDescription>
              Check your email for your asset pack and payout setup. Here&apos;s what matters
              right now:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-[#f7f3ec] border-2 border-[#e07a3a] rounded-lg p-6 text-center">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">
                Your coupon code
              </p>
              <p className="text-3xl font-mono font-bold text-[#e07a3a] tracking-wider">
                {success.coupon_code}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Share this link with your audience:</p>
              <div className="bg-stone-100 rounded-lg p-3 text-sm break-all font-mono">
                {success.share_url}
              </div>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p>
                <strong>Your audience gets:</strong> 20% off their first month.
              </p>
              <p>
                <strong>You earn:</strong> 30% of every payment they make, for as long as they
                stay subscribed.
              </p>
              <p>
                <strong>Payouts:</strong> Monthly, via PayPal to {payoutEmail}.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/affiliates/assets" className="w-full">
              <Button className="w-full">Get your asset pack →</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#1f1b14] mb-3">
            Earn 30% recurring for life
          </h1>
          <p className="text-lg text-stone-600">
            Teach your audience to use ChatGPT. Earn 30% of every subscription they create, for
            as long as they stay subscribed.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Affiliate application</CardTitle>
            <CardDescription>
              Minimum 5,000 followers on your primary channel. Approval is instant — you&apos;ll
              get your coupon code as soon as you submit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot — hidden from humans, bots fill it */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
                <Label htmlFor="website">Website (leave blank)</Label>
                <Input
                  id="website"
                  name="website"
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {/* Name + email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Creator"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              {/* Primary channel */}
              <div>
                <Label htmlFor="primary_channel">Primary channel</Label>
                <select
                  id="primary_channel"
                  required
                  value={primaryChannel}
                  onChange={(e) => setPrimaryChannel(e.target.value as Channel)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="substack">Substack</option>
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  This is where we count your 5,000+ follower minimum.
                </p>
              </div>

              {/* Handles */}
              <div className="space-y-3">
                <Label>Your handles (fill in all that apply)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    placeholder="TikTok @handle"
                    required={primaryChannel === "tiktok"}
                  />
                  <Input
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="Instagram @handle"
                    required={primaryChannel === "instagram"}
                  />
                  <Input
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value)}
                    placeholder="YouTube @handle"
                    required={primaryChannel === "youtube"}
                  />
                  <Input
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="Twitter/X @handle"
                    required={primaryChannel === "twitter"}
                  />
                  <Input
                    value={substackHandle}
                    onChange={(e) => setSubstackHandle(e.target.value)}
                    placeholder="Substack @handle"
                    required={primaryChannel === "substack"}
                  />
                </div>
              </div>

              {/* Reach + language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reach">Followers on your primary channel</Label>
                  <Input
                    id="reach"
                    type="number"
                    required
                    min={5000}
                    step={1}
                    value={reachEstimate}
                    onChange={(e) => setReachEstimate(e.target.value)}
                    placeholder="50000"
                  />
                  <p className="text-xs text-stone-500 mt-1">Minimum 5,000.</p>
                </div>
                <div>
                  <Label htmlFor="language">Primary content language</Label>
                  <select
                    id="language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Payout */}
              <div>
                <Label htmlFor="payout_email">PayPal email for monthly payouts</Label>
                <Input
                  id="payout_email"
                  type="email"
                  required
                  value={payoutEmail}
                  onChange={(e) => setPayoutEmail(e.target.value)}
                  placeholder="paypal@example.com"
                />
                <p className="text-xs text-stone-500 mt-1">
                  We send your 30% commission monthly via PayPal. Stripe Connect coming soon.
                </p>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <span className="text-stone-600">
                  I agree to the{" "}
                  <Link href="/affiliates/terms" className="text-[#e07a3a] underline">
                    affiliate terms
                  </Link>
                  : 30% of every paid month of subscribers I refer, paid monthly via PayPal. No
                  exclusivity. Learn to GPT may terminate the relationship if I violate the
                  terms or misrepresent the product.
                </span>
              </label>

              {/* Turnstile */}
              {TURNSTILE_SITE_KEY && (
                <div>
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: "light" }}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Get my affiliate link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-stone-500">
          Questions?{" "}
          <a href="mailto:reid@getateam.ai" className="text-[#e07a3a] underline">
            reid@getateam.ai
          </a>
        </div>
      </div>
    </div>
  );
}
