// ── Social Proof Ghost Numbers ────────────────────────────────────────────────
// Deterministic pseudo-random numbers that feel alive. Same seed + same
// 5-minute window = same output. Numbers are small and plausible for a site
// with ~1,200 monthly users.

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Simple string hash (djb2). Deterministic, fast, no crypto needed. */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Current 5-minute window key (e.g. "2026-05-29T14:35"). */
function windowKey(): string {
  const now = new Date();
  const mins = Math.floor(now.getMinutes() / 5) * 5;
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Current day key for daily-stable values. */
function dayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Deterministic ghost count. Same seed within the same time window returns
 * the same number. Range is inclusive [min, max].
 */
function ghostCount(seed: string, min: number, max: number, timeKey?: string): number {
  const key = `${seed}:${timeKey ?? windowKey()}`;
  const h = hashStr(key);
  return min + (h % (max - min + 1));
}

// Days since a fixed launch date. Used as a slow growth multiplier.
const LAUNCH_DATE = new Date("2025-06-01");
function daysSinceLaunch(): number {
  return Math.max(0, Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86_400_000));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Number of people who "completed this lesson today". Stable per day per slug.
 * Base range 3-15, with a slow growth multiplier (~+1 per month).
 */
export function getLessonCompletionsToday(lessonSlug: string): number {
  const growth = Math.floor(daysSinceLaunch() / 30);
  const base = ghostCount(`lesson:${lessonSlug}`, 3, 15, dayKey());
  return base + growth;
}

/**
 * Active learners "right now". Follows a realistic daily curve:
 * peaks at 10am-2pm UTC and 6pm-10pm UTC, troughs at 2am-6am UTC.
 */
export function getActiveLearners(): number {
  const hour = new Date().getUTCHours();

  // Activity multiplier by hour bucket
  let multiplier: number;
  if (hour >= 2 && hour < 6) {
    multiplier = 0.3; // dead of night
  } else if (hour >= 6 && hour < 10) {
    multiplier = 0.6; // morning ramp
  } else if (hour >= 10 && hour < 14) {
    multiplier = 1.0; // peak 1
  } else if (hour >= 14 && hour < 18) {
    multiplier = 0.7; // afternoon dip
  } else if (hour >= 18 && hour < 22) {
    multiplier = 1.0; // peak 2
  } else {
    multiplier = 0.5; // late night
  }

  const base = ghostCount("active-learners", 8, 25);
  return Math.max(3, Math.round(base * multiplier));
}

// ── Activity Feed ────────────────────────────────────────────────────────────

export interface ActivityFeedItem {
  id: string;
  text: string;
  timeAgo: string;
  icon: string;
}

/** @deprecated Use ActivityFeedItem instead */
export type ActivityItem = ActivityFeedItem;

// Countries weighted roughly by actual traffic distribution
const COUNTRIES = [
  "the US", "the US", "the US", "the US",   // ~30%
  "India", "India", "India",                  // ~20%
  "Germany", "Germany",                       // ~12%
  "Singapore",                                // ~6%
  "Japan", "Japan",                           // ~8%
  "Brazil",                                   // ~5%
  "the UK", "the UK",                         // ~8%
  "France",                                   // ~4%
  "the Netherlands",                          // ~3%
  "China",                                    // ~4%
];

// Template functions that produce natural-sounding activity text
type TemplateEntry = { icon: string; templates: string[] };

const ACTIVITY_TEMPLATES: TemplateEntry[] = [
  {
    icon: "✅",
    templates: [
      "A learner in {country} completed Track 1",
      "Someone from {country} just finished Context Window Mastery",
      "A learner in {country} completed Getting Started with ChatGPT",
      "Someone from {country} finished Advanced Prompting",
      "A learner in {country} completed System Prompts 101",
    ],
  },
  {
    icon: "🏆",
    templates: [
      "Someone from {country} just earned the Prompt Master badge",
      "A learner in {country} earned the Speed Learner badge",
      "Someone from {country} just earned the Week Warrior badge",
      "A learner in {country} unlocked the First Lesson badge",
    ],
  },
  {
    icon: "🚀",
    templates: [
      "Someone from {country} just started the GPT Tutorial",
      "A learner in {country} began the MCP Servers Guide",
      "Someone from {country} started Extended Thinking",
      "A new learner from {country} joined the Academy",
    ],
  },
  {
    icon: "🔥",
    templates: [
      "{count} exercises completed in the last hour",
      "Someone from {country} hit a 7-day streak",
      "A learner in {country} reached a 14-day streak",
      "{count} lessons completed across {lcountry} countries today",
    ],
  },
];

const TIME_AGOS = ["2 min ago", "5 min ago", "8 min ago", "12 min ago", "15 min ago", "22 min ago", "31 min ago", "45 min ago"];

/**
 * Hourly time key for activity feed — items rotate every hour but stay
 * stable within the hour so they don't flicker mid-session.
 */
function hourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}`;
}

/**
 * Generate plausible recent activity items. Deterministic per hour + index,
 * so items don't change mid-session but rotate hourly.
 */
export function getRecentActivity(count: number): ActivityFeedItem[] {
  const hk = hourKey();
  const items: ActivityFeedItem[] = [];

  for (let i = 0; i < count; i++) {
    const seed = `${hk}:${i}`;
    const templateGroupIdx = ghostCount(`activity-group-${i}`, 0, ACTIVITY_TEMPLATES.length - 1, hk);
    const group = ACTIVITY_TEMPLATES[templateGroupIdx];
    const templateIdx = ghostCount(`activity-tpl-${i}`, 0, group.templates.length - 1, hk);
    const countryIdx = ghostCount(`activity-country-${i}`, 0, COUNTRIES.length - 1, hk);
    const timeIdx = ghostCount(`activity-time-${i}`, 0, TIME_AGOS.length - 1, hk);

    const template = group.templates[templateIdx];
    const exerciseCount = ghostCount(`activity-count-${i}`, 8, 23, hk);
    const countryCount = ghostCount(`activity-ccnt-${i}`, 4, 12, hk);

    const text = template
      .replace("{country}", COUNTRIES[countryIdx])
      .replace("{count}", String(exerciseCount))
      .replace("{lcountry}", String(countryCount));

    items.push({
      id: `activity-${seed}`,
      text,
      timeAgo: TIME_AGOS[Math.min(timeIdx + i, TIME_AGOS.length - 1)],
      icon: group.icon,
    });
  }

  return items;
}
