"use client";

import { cn } from "@/lib/utils";
import { TRACK_INFO, type Track } from "@/types";
import { CheckCircle, BookOpen, Briefcase, Terminal, Bot, Award, Sparkles, Layers, Target, Rocket, Hammer } from "lucide-react";
import { Link } from "@/i18n/routing";

export interface CourseProgress {
  id: string;
  title: string;
  slug: string;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export interface TrackProgress {
  track: Track;
  courses: CourseProgress[];
}

const trackColorMap: Record<Track, { border: string; bg: string; fill: string; text: string; dot: string }> = {
  why_claude: { border: "border-game-blue", bg: "bg-game-blue/10", fill: "#4a8fca", text: "text-game-blue", dot: "bg-game-blue" },
  three_levels: { border: "border-teal", bg: "bg-teal/10", fill: "#2d7d6f", text: "text-teal", dot: "bg-teal" },
  essentials: { border: "border-game-purple", bg: "bg-game-purple/10", fill: "#7c5cbf", text: "text-game-purple", dot: "bg-game-purple" },
  level_up: { border: "border-orange", bg: "bg-orange/10", fill: "#e07a3a", text: "text-orange", dot: "bg-orange" },
  build_something: { border: "border-gold", bg: "bg-gold/10", fill: "#d4a373", text: "text-gold", dot: "bg-gold" },
  practitioner_setup: { border: "border-orange", bg: "bg-orange/10", fill: "#e07a3a", text: "text-orange", dot: "bg-orange" },
  advanced_workflows: { border: "border-cyan-600", bg: "bg-cyan-600/10", fill: "#0891b2", text: "text-cyan-600", dot: "bg-cyan-600" },
};

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  BookOpen,
  Briefcase,
  Terminal,
  Bot,
  Award,
  Sparkles,
  Layers,
  Target,
  Rocket,
  Hammer,
};

function CourseNode({ course, track }: { course: CourseProgress; track: Track }) {
  const colors = trackColorMap[track];
  const isCompleted = course.lessonsCompleted === course.lessonsTotal && course.lessonsTotal > 0;
  const progress = course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "relative block rounded-[14px] border-[3px] p-3 transition-all hover:shadow-[3px_3px_0px_#1c1917] hover:-translate-x-px hover:-translate-y-px",
        isCompleted
          ? cn("border-ink bg-cream shadow-[3px_3px_0px_#1c1917]")
          : "border-ink bg-cream",
      )}
    >
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <CheckCircle className={cn("size-4", colors.text)} />
        ) : (
          <div className={cn("size-2.5 rounded-full", colors.dot)} />
        )}
        <span className="text-sm font-semibold text-ink">
          {course.title}
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-text-secondary">{course.lessonsCompleted}/{course.lessonsTotal} lessons</span>
          <span className="mono-f font-semibold text-ink">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border-[2px] border-ink bg-linen">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.fill,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

export function SkillTree({ tracks }: { tracks: TrackProgress[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {tracks.map((tp) => {
        const info = TRACK_INFO[tp.track];
        const colors = trackColorMap[tp.track];
        const Icon = iconMap[info.icon] ?? BookOpen;

        return (
          <div key={tp.track} className="space-y-3">
            {/* Track header */}
            <div className="flex items-center gap-2">
              <div className={cn("flex size-7 items-center justify-center rounded-[8px] border-[2px] border-ink", colors.bg)}>
                <Icon className={cn("size-4", colors.text)} />
              </div>
              <h3 className="text-sm font-bold text-ink">{info.name}</h3>
            </div>

            {/* Course nodes connected by lines */}
            <div className="relative space-y-2.5 pl-4">
              {/* Vertical connector line */}
              <div className="absolute left-[1.05rem] top-0 h-full w-[2px] bg-ink/15" />

              {tp.courses.map((course) => (
                <div key={course.id} className="relative">
                  {/* Horizontal connector dot */}
                  <div className={cn("absolute -left-2 top-4 size-2 rounded-full border-[2px] border-ink", colors.dot)} />
                  <CourseNode course={course} track={tp.track} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
