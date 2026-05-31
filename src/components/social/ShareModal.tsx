"use client";

import { useState, useEffect, useCallback } from "react";
import { ShareButtons } from "./ShareButtons";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareType: string;
  referenceId: string;
  title: string;
  description?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  shareType,
  referenceId,
  title,
  description,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareUrl = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/share/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_type: shareType,
          reference_id: referenceId,
          title,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate share link");
      }

      const data: { id: string; share_url: string } = await res.json();
      setShareUrl(data.share_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [shareType, referenceId, title, description]);

  // Generate share URL when modal opens
  useEffect(() => {
    if (isOpen && !shareUrl && !loading) {
      generateShareUrl();
    }
  }, [isOpen, shareUrl, loading, generateShareUrl]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShareUrl(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share your achievement"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-[3px] border-ink bg-cream shadow-[6px_6px_0px_#1c1917]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-text-secondary transition-colors hover:text-ink"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="space-y-6 p-8 text-center">
          {/* Celebration header */}
          <div className="space-y-2">
            <div className="text-4xl">&#127881;</div>
            <h2 className="text-xl font-extrabold text-ink">
              Congratulations!
            </h2>
          </div>

          {/* Achievement title */}
          <div className="space-y-1">
            <p className="text-lg font-bold text-ink">{title}</p>
            {description && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>

          <div className="h-px w-full bg-ink/10" />

          {/* Share buttons or loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-orange" />
              <span className="text-sm font-semibold text-text-secondary">
                Generating share link...
              </span>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={generateShareUrl}
                className="text-sm font-bold text-orange underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {shareUrl && !loading && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-secondary">
                Share your achievement
              </p>
              <ShareButtons
                shareUrl={shareUrl}
                title={title}
                className="justify-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
