import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectShellClient } from './ProjectShellClient';

// ---------------------------------------------------------------------------
// Project shell proof-of-concept for Track 5.
//
// This is a parallel route to /courses/[slug] that renders the new project
// shell UX (see docs/track5-project-shell.md). It is intentionally not wired
// to Supabase yet: step completion and submission writes are stubbed with
// TODOs in the client. Seed data is loaded from content/seed at request time
// because the content_type column is additive and Track 5 courses have not
// been flipped to 'project' in the DB yet.
//
// Next.js 16: params is a Promise and must be awaited.
// ---------------------------------------------------------------------------

interface ProjectStep {
  slug: string;
  title: string;
  estimated_minutes: number;
  body: string;
  done_when: string;
  code: { language: string; value: string } | null;
  video_url?: string;
}

export interface ProjectSeed {
  slug: string;
  track: string;
  content_type: 'project';
  title: string;
  tagline: string;
  outcome: string;
  difficulty: string;
  estimated_minutes: number;
  xp_reward: number;
  submission_prompt: string;
  submission_url_required: boolean;
  steps: ProjectStep[];
}

// Seed files that the MVP route can render. Keyed by URL slug. Additional
// projects can be registered here as they are ported from track5-build-something.json.
const PROJECT_SEEDS: Record<string, string> = {
  'build-a-website': 'project1-build-a-website.json',
  'build-your-first-agent': 'project2-build-your-first-agent.json',
  'automate-your-workflow': 'project3-automate-your-workflow.json',
  'build-a-content-system': 'project4-build-a-content-system.json',
};

async function loadProjectSeed(slug: string): Promise<ProjectSeed | null> {
  const filename = PROJECT_SEEDS[slug];
  if (!filename) return null;

  const filePath = path.join(process.cwd(), 'content', 'seed', filename);
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as ProjectSeed;
  } catch {
    return null;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seed = await loadProjectSeed(slug);

  if (!seed) {
    notFound();
  }

  return <ProjectShellClient project={seed} />;
}
