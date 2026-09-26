"use client";

import { BooksIcon, GearSixIcon, HouseIcon, PlusIcon, SignOutIcon, TrophyIcon, UserIcon, type Icon } from "@phosphor-icons/react";
import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { accentStyles, type Accent, type AvatarInfo } from "@/lib/types";
import { spring } from "@/lib/motion";
import { Avatar } from "./avatar";
import { Logo } from "./logo";
import { Presence } from "./presence";
import { buttonClass, iconButtonClass, pressable } from "./ui";

type RecentSet = { id: string; title: string; accent: Accent };

const nav: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/library", label: "Library", icon: BooksIcon },
  { href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children, me, recent }: { children: ReactNode; me: AvatarInfo; recent: RecentSet[] }) {
  const pathname = usePathname();
  // Focus mode: hide the chrome while actually studying.
  const studying = /\/sets\/[^/]+\/(flashcards|quiz)/.test(pathname);

  return (
    <MotionConfig reducedMotion="user">
      <Presence />
      <div className="flex min-h-dvh">
        {!studying && <Sidebar pathname={pathname} me={me} recent={recent} />}
        <div className="min-w-0 flex-1">
          {!studying && <TopBar />}
          <main className={studying ? "" : "pb-28 md:pb-0"}>{children}</main>
        </div>
        {!studying && <BottomNav pathname={pathname} me={me} />}
      </div>
    </MotionConfig>
  );
}

function Sidebar({ pathname, me, recent }: { pathname: string; me: AvatarInfo; recent: RecentSet[] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 backdrop-blur-xl md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <Link href="/new" className={buttonClass("primary", "group mt-8 w-full")}>
        <PlusIcon size={18} weight="bold" className="transition-transform duration-300 group-hover:rotate-90" />
        New set
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map(({ href, label, icon: NavIcon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold ${pressable} ${
                active ? "text-honey-600" : "text-ink-500 hover:bg-ink-950/5 hover:text-ink-950"
              }`}
            >
              {active && <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-2xl bg-honey-50" transition={spring} />}
              <NavIcon size={20} weight={active ? "fill" : "duotone"} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      {recent.length > 0 && (
        <>
          <p className="mt-8 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Recent</p>
          <div className="mt-2 flex min-h-0 flex-col gap-0.5 overflow-y-auto">
            {recent.map((set) => {
              const active = pathname.startsWith(`/sets/${set.id}`);
              return (
                <Link
                  key={set.id}
                  href={`/sets/${set.id}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${pressable} ${
                    active ? "bg-ink-950/5 text-ink-950" : "text-ink-700 hover:bg-ink-950/[0.03] hover:text-ink-950"
                  }`}
                >
                  <span className={`size-2.5 shrink-0 rotate-45 rounded-[3px] ${accentStyles[set.accent].solid}`} />
                  <span className="truncate">{set.title}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-auto flex items-center gap-1 rounded-2xl border border-line bg-raised p-1.5">
        <Link href={`/u/${me.username}`} className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 hover:bg-ink-950/5 ${pressable}`}>
          <Avatar user={me} size="sm" />
          <span className="truncate text-sm font-semibold">{me.username}</span>
        </Link>
        <Link href="/settings" aria-label="Settings" title="Settings" className={`${iconButtonClass} ${pathname === "/settings" ? "bg-honey-50 text-honey-600" : ""}`}>
          <GearSixIcon size={20} weight="duotone" className="transition-transform duration-500 hover:rotate-90" />
        </Link>
        <form action={signOut}>
          <button aria-label="Sign out" title="Sign out" className={iconButtonClass}>
            <SignOutIcon size={20} weight="duotone" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
      <Logo />
      <Link href="/settings" aria-label="Settings" className={iconButtonClass}>
        <GearSixIcon size={22} weight="duotone" />
      </Link>
    </header>
  );
}

function BottomNav({ pathname, me }: { pathname: string; me: AvatarInfo }) {
  const profileHref = `/u/${me.username}`;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <nav className="mx-auto grid h-16 max-w-md grid-cols-5 items-center rounded-3xl border border-line bg-surface/85 px-1 shadow-lift backdrop-blur-xl">
        <BottomNavItem href="/" label="Home" icon={HouseIcon} active={isActive(pathname, "/")} />
        <BottomNavItem href="/library" label="Library" icon={BooksIcon} active={isActive(pathname, "/library")} />
        <Link
          href="/new"
          aria-label="New set"
          className={`-mt-8 grid size-14 place-items-center justify-self-center rounded-2xl bg-honey-400 text-honey-ink shadow-honey ring-4 ring-canvas ${pressable}`}
        >
          <PlusIcon size={24} weight="bold" />
        </Link>
        <BottomNavItem href="/leaderboard" label="Board" icon={TrophyIcon} active={isActive(pathname, "/leaderboard")} />
        <BottomNavItem href={profileHref} label="Me" icon={UserIcon} active={pathname === profileHref} />
      </nav>
    </div>
  );
}

function BottomNavItem({ href, label, icon: NavIcon, active }: { href: string; label: string; icon: Icon; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${pressable} ${
        active ? "text-honey-600" : "text-ink-400"
      }`}
    >
      {active && <motion.span layoutId="bottom-active" className="absolute -top-2 h-1 w-6 rounded-full bg-honey-400" transition={spring} />}
      <NavIcon size={22} weight={active ? "fill" : "duotone"} />
      {label}
    </Link>
  );
}
