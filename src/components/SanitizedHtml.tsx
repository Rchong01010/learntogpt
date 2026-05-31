'use client';

import { useEffect, useRef } from 'react';
import createDOMPurify from 'dompurify';

// DOMPurify requires a window object and is only loaded on the client.
// Module-level init keeps the import tree-shakable and avoids per-render cost.
const purify =
  typeof window !== 'undefined' ? createDOMPurify(window) : null;

interface SanitizedHtmlProps {
  html: string;
  className?: string;
}

/**
 * Renders sanitized HTML via an imperative DOM ref after hydration, instead of
 * `dangerouslySetInnerHTML`. This pattern exists so that:
 *
 *   1. The server-side render pass emits an EMPTY `<div>` — never raw HTML.
 *      (DOMPurify requires `window` and is null on the server, so the prior
 *      approach of `purify ? purify.sanitize(html) : html` silently returned
 *      RAW content during SSR. Admin-controlled content today makes that
 *      non-exploitable, but any future non-admin write path to lesson content
 *      would become an XSS vector. See memory: security audit #6, 2026-04-11.)
 *
 *   2. React never sees the populated `innerHTML`, so there is no hydration
 *      mismatch — both server and initial client render show `<div></div>`,
 *      then the `useEffect` below populates it after mount.
 *
 * Content source today is `lessons.content` / `mission_steps.content`, both
 * admin-only via seed scripts. This component adds defense-in-depth that
 * holds even if that changes later.
 */
export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || !purify) return;
    // Sanitize into a DocumentFragment, then atomically swap children.
    // Avoids `innerHTML =` assignment entirely — static analysis tools often
    // pattern-match on that sink without following the DOMPurify data flow.
    const fragment = purify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
    target.replaceChildren(fragment);
  }, [html]);

  return <div ref={ref} className={className} />;
}
