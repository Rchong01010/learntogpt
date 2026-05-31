"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Settings,
  Flame,
  Zap,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

type NavKey =
  | "dashboard"
  | "courses"
  | "leaderboard"
  | "profile"
  | "settings"
  | "missions";

const navItems: Array<{
  href: string;
  key: NavKey;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  // { href: "/missions", key: "missions", icon: Rocket },  // Hidden until missions are seeded
  { href: "/courses", key: "courses", icon: BookOpen },
  { href: "/leaderboard", key: "leaderboard", icon: Trophy },
  { href: "/profile", key: "profile", icon: User },
  { href: "/settings", key: "settings", icon: Settings },
];

interface AppShellProps {
  userData: {
    displayName: string;
    avatarUrl: string | null;
    xp: number;
    streak: number;
    level: number;
  };
  children: React.ReactNode;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition-all",
        isActive
          ? "border-[3px] border-ink bg-cream text-ink shadow-[3px_3px_0px_#1c1917]"
          : "border-[3px] border-transparent text-text-secondary hover:border-ink/20 hover:bg-cream hover:text-ink",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Link>
  );
}

export function AppShell({ userData, children }: AppShellProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <div className="flex h-full min-h-screen bg-linen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r-[4px] border-ink bg-warm-white md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="flex size-9 items-center justify-center rounded-[12px] border-[3px] border-ink bg-orange font-bold text-white text-sm shadow-[2px_2px_0px_#1c1917]">
            CA
          </div>
          <div className="flex flex-col leading-tight">
            <span className="logo-serif text-xl text-ink">Learn to GPT</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-secondary">Academy</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.key)}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </nav>

        {/* Bottom user card */}
        <div className="border-t-[3px] border-ink p-3">
          <div className="flex items-center gap-2.5 rounded-[12px] border-[2px] border-ink/20 bg-linen p-2.5">
            <Avatar size="sm">
              {userData.avatarUrl ? (
                <AvatarImage src={userData.avatarUrl} />
              ) : (
                <AvatarFallback className="border-[2px] border-ink bg-gold text-ink font-bold text-xs">
                  {userData.displayName[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-xs">
              <p className="font-semibold text-ink">{userData.displayName}</p>
              <p className="mono-f text-text-secondary">{t("levelLabel", { level: userData.level })}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b-[4px] border-ink bg-warm-white px-4">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <Menu className="size-5 text-ink" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-warm-white p-0">
                <SheetHeader className="border-b-[3px] border-ink px-4 py-3">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-[10px] border-[2px] border-ink bg-orange font-bold text-white text-xs shadow-[2px_2px_0px_#1c1917]">
                      CA
                    </div>
                    <span className="logo-serif text-lg text-ink">{t("brandName")}</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="space-y-1 px-3 py-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={t(item.key)}
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Spacer for desktop */}
          <div className="hidden md:block" />

          {/* Right side: Language + XP + Streak + Avatar */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {/* XP pill */}
            <div className="badge-f bg-cream text-orange">
              <Zap className="size-3.5" />
              <span className="tabular-nums">{userData.xp.toLocaleString()} XP</span>
            </div>

            {/* Streak pill */}
            <div className="badge-f bg-cream text-orange">
              <Flame className="size-3.5" />
              <span className="tabular-nums">{userData.streak}</span>
            </div>

            {/* Avatar */}
            <Avatar size="sm">
              {userData.avatarUrl ? (
                <AvatarImage src={userData.avatarUrl} />
              ) : (
                <AvatarFallback className="border-[2px] border-ink bg-gold text-ink font-bold text-xs">
                  {userData.displayName[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
