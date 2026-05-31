"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

interface FunnelTrackerProps {
  /** True when XP = 0 and no lesson progress exists */
  isNewSignup: boolean;
  /** True when user has XP > 0 */
  hasXp: boolean;
  /** ISO timestamp of the user's last activity (lesson completion or exercise event) */
  lastActivityAt: string | null;
  /** Current locale */
  locale: string;
}

const FUNNEL_ENDPOINT = "/api/events/funnel";

/**
 * Client component that fires activation funnel events on the dashboard.
 *
 * Rendered once per dashboard load. Uses refs to ensure events fire exactly
 * once per mount (React.StrictMode double-mounts in dev).
 *
 * Events:
 * - funnel_signup_complete: first dashboard visit (xp=0, no progress)
 * - funnel_24hr_return: returning user with XP whose last activity was >24h ago
 */
export function FunnelTracker({
  isNewSignup,
  hasXp,
  lastActivityAt,
  locale,
}: FunnelTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (isNewSignup) {
      fireFunnelEvent("funnel_signup_complete", { locale });
      return;
    }

    if (hasXp && lastActivityAt) {
      const lastActivity = new Date(lastActivityAt).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastActivity > twentyFourHours) {
        fireFunnelEvent("funnel_24hr_return", { locale });
      }
    }
  }, [isNewSignup, hasXp, lastActivityAt, locale]);

  return null;
}

/**
 * Fire a funnel event to the server. Fire-and-forget — never throws.
 */
export function fireFunnelEvent(
  eventName: string,
  metadata: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  // Push to GA4 via dataLayer directly — avoids race condition where
  // gtag.js hasn't loaded yet (strategy="afterInteractive").
  // dataLayer is initialized synchronously by GoogleAnalytics, and
  // gtag() itself is just a thin wrapper around dataLayer.push().
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["event", eventName, metadata]);
  } catch {
    /* swallow */
  }

  try {
    void fetch(FUNNEL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, metadata }),
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}
