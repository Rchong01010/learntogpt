interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  faqs: FaqItem[];
}

/**
 * Renders FAQ structured data as a JSON-LD script tag.
 * Use on any page with FAQ content to improve search engine and AI engine discoverability.
 *
 * @see https://schema.org/FAQPage
 */
export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  if (faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Safe: JSON.stringify output from our own schema object, not user input.
  // nosemgrep: react-dangerouslysetinnerhtml
  const jsonLd: string = JSON.stringify(schema);

  return (
    <script
      type="application/ld+json"
      // Safe: jsonLd is JSON.stringify output from our own schema object, not user input.
      // nosemgrep: react-dangerouslysetinnerhtml
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
