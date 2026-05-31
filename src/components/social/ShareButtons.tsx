"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  shareUrl: string;
  title: string;
  className?: string;
}

export function ShareButtons({ shareUrl, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function openLinkedIn() {
    const trackedUrl = `${shareUrl}${shareUrl.includes("?") ? "&" : "?"}utm_source=linkedin&utm_medium=social&utm_campaign=certificate_share`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackedUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  function openTwitter() {
    const trackedUrl = `${shareUrl}${shareUrl.includes("?") ? "&" : "?"}utm_source=twitter&utm_medium=social&utm_campaign=certificate_share`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(trackedUrl)}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* LinkedIn — primary, larger */}
      <button
        type="button"
        onClick={openLinkedIn}
        className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-[#0A66C2] px-6 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917]"
        aria-label="Share on LinkedIn"
      >
        {/* LinkedIn SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share
      </button>

      {/* X / Twitter */}
      <button
        type="button"
        onClick={openTwitter}
        className="inline-flex items-center gap-2 rounded-full border-[2px] border-ink bg-cream px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-linen"
        aria-label="Share on X"
      >
        {/* X SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Post
      </button>

      {/* Copy link */}
      <button
        type="button"
        onClick={copyLink}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border-[2px] px-4 py-2 text-sm font-bold transition-all",
          copied
            ? "border-teal bg-teal/10 text-teal"
            : "border-ink bg-cream text-ink hover:bg-linen",
        )}
        aria-label="Copy share link"
      >
        {/* Link / Check SVG */}
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
