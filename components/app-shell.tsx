"use client";

import { BooksIcon, HouseIcon, PlusIcon, SignOutIcon, type Icon } from "@phosphor-icons/react";
import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { accentStyles, type Accent } from "@/lib/types";
import { spring } from "@/lib/motion";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type RecentSet = { id: string; title: string; accent: Accent };

const nav: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/library", label: "Library", icon: BooksIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({
  children,
  userName,
  recent,
}: {
  children: ReactNode;
  userName: string;
  recent: RecentSet[];
}) {
  const pathname = usePathname();
  // Focus mode: hide the chrome while actually studying.
  const studying = /\/sets\/[^/]+\/(flashcards|quiz)/.test(pathname);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh">
        {!studying && <Sidebar pathname={pathname} userName={userName} recent={recent} />}
        <div className="min-w-0 flex-1">
          {!studying && <TopBar />}
          <main className={studying ? "" : "pb-28 md:pb-0"}>{children}</main>
        </div>
        {!studying && <BottomNav pathname={pathname} />}
      </div>
    </MotionConfig>
  );
}

function Sidebar({ pathname, userName, recent }: { pathname: string; userName: string; recent: RecentSet[] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 backdrop-blur-xl md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <Link href="/new" className="group mt-8 flex h-11 items-center justify-center gap-2 rounded-2xl bg-honey-400 text-sm font-semibold text-honey-ink shadow-honey transition hover:bg-honey-300 active:scale-[0.97]">
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
              className={`relative flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors ${
                active ? "text-honey-600" : "text-ink-500 hover:text-ink-950"
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
          <div className="mt-2 flex flex-col gap-0.5">
            {recent.map((set) => {
              const active = pathname.startsWith(`/sets/${set.id}`);
              return (
                <Link
                  key={set.id}
                  href={`/sets/${set.id}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
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

      <div className="mt-auto flex items-center gap-2 rounded-2xl border border-line bg-raised p-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-honey-400 font-display text-base font-semibold uppercase text-honey-ink">
          {userName[0]}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{userName}</span>
        <ThemeToggle />
        <form action={signOut}>
          <button aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-xl text-ink-500 transition hover:bg-ink-950/5 hover:text-ink-950 active:scale-90">
            <SignOutIcon size={20} weight="duotone" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between px-4 pt-4 md:hidden">
      <Logo />
      <div className="flex items-center">
        <ThemeToggle />
        <form action={signOut}>
          <button aria-label="Sign out" className="grid size-10 place-items-center rounded-xl text-ink-500 active:scale-90">
            <SignOutIcon size={20} weight="duotone" />
          </button>
        </form>
      </div>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <nav className="mx-auto flex h-16 max-w-sm items-center justify-around rounded-3xl border border-line bg-surface/85 px-2 shadow-lift backdrop-blur-xl">
        <BottomNavItem {...nav[0]} active={isActive(pathname, nav[0].href)} />
        <Link
          href="/new"
          aria-label="New set"
          className="-mt-8 grid size-14 place-items-center rounded-2xl bg-honey-400 text-honey-ink shadow-honey ring-4 ring-canvas transition active:scale-90"
        >
          <PlusIcon size={24} weight="bold" />
        </Link>
        <BottomNavItem {...nav[1]} active={isActive(pathname, nav[1].href)} />
      </nav>
    </div>
  );
}

function BottomNavItem({ href, label, icon: NavIcon, active }: (typeof nav)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex w-20 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors ${
        active ? "text-honey-600" : "text-ink-400"
      }`}
    >
      {active && <motion.span layoutId="bottom-active" className="absolute -top-2 h-1 w-6 rounded-full bg-honey-400" transition={spring} />}
      <NavIcon size={22} weight={active ? "fill" : "duotone"} />
      {label}
    </Link>
  );
}
