/**
 * Schema.org LearningResource structured data for lesson pages.
 * Renders a <script type="application/ld+json"> block.
 */

interface LessonJsonLdProps {
  name: string;
  description: string;
  educationalLevel: string;
  language: string;
  isFree: boolean;
  url: string;
  courseName: string;
  courseUrl: string;
}

export function LessonJsonLd({
  name,
  description,
  educationalLevel,
  language,
  isFree,
  url,
  courseName,
  courseUrl,
}: LessonJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description,
    learningResourceType: 'lesson',
    educationalLevel,
    inLanguage: language,
    isPartOf: {
      '@type': 'Course',
      name: courseName,
      url: courseUrl,
    },
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Learn to GPT',
      url: 'https://learntogpt.com',
    },
    isAccessibleForFree: isFree,
    url,
  };

  return (
    // nosemgrep: react-dangerouslysetinnerhtml
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
