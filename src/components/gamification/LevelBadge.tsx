import { cn } from "@/lib/utils";

function getTierStyle(level: number) {
  if (level <= 5) return { bg: "bg-walnut", text: "text-white" };
  if (level <= 10) return { bg: "bg-text-secondary", text: "text-white" };
  if (level <= 15) return { bg: "bg-gold", text: "text-ink" };
  return { bg: "bg-teal", text: "text-white" };
}

const sizeMap = {
  sm: "size-7 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
} as const;

export function LevelBadge({
  level,
  size = "md",
}: {
  level: number;
  size?: "sm" | "md" | "lg";
}) {
  const tier = getTierStyle(level);

  return (
    <div
      className={cn(
        "mono-f flex shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-bold shadow-[2px_2px_0px_#1c1917]",
        tier.bg,
        tier.text,
        sizeMap[size],
      )}
    >
      {level}
    </div>
  );
}
