/**
 * Schema.org Course structured data for SEO / AEO.
 * Renders a <script type="application/ld+json"> block.
 */

interface CourseJsonLdProps {
  name: string;
  description: string;
  educationalLevel: string;
  language: string;
  lessonCount: number;
  isFree: boolean;
  url: string;
}

export function CourseJsonLd({
  name,
  description,
  educationalLevel,
  language,
  lessonCount,
  isFree,
  url,
}: CourseJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Learn to GPT',
      url: 'https://learntogpt.com',
    },
    educationalLevel,
    inLanguage: language,
    numberOfLessons: lessonCount,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT2H',
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
