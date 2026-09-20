/**
 * Safely serialize a schema object for embedding inside a
 * <script type="application/ld+json"> tag via dangerouslySetInnerHTML.
 *
 * JSON.stringify does NOT escape `<`, `>`, or `&`, so a string containing
 * `</script>` (or `<script>`) would break out of the script element. Course
 * and FAQ content now flows in from the coursegen flywheel — which generates
 * text from external Anthropic pages — so schema field values are effectively
 * untrusted input. Escaping the HTML-significant characters keeps the payload
 * inert: `<\/script>` inside a JSON string parses back to `</script>` for the
 * JSON-LD consumer while never closing the surrounding <script> tag.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
