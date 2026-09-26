"use client";

import { BookOpen, House, Plus } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { accentStyles, studySets } from "@/lib/demo-data";
import { spring } from "@/lib/motion";
import { Logo } from "./logo";

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/library", label: "Library", icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Focus mode: hide the chrome while actually studying.
  const studying = /\/sets\/[^/]+\/(flashcards|quiz)/.test(pathname);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh">
        {!studying && <Sidebar pathname={pathname} />}
        <main className={`min-w-0 flex-1 ${studying ? "" : "pb-28 md:pb-0"}`}>{children}</main>
        {!studying && <BottomNav pathname={pathname} />}
      </div>
    </MotionConfig>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/70 px-4 py-6 backdrop-blur md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <Link
        href="/new"
        className="group mt-8 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 active:scale-[0.97]"
      >
        <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
        New study set
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                active ? "text-brand-700" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-50"
                  transition={spring}
                />
              )}
              <Icon className="relative size-[18px]" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">Recent</p>
      <div className="mt-2 flex flex-col gap-0.5">
        {studySets.slice(0, 4).map((set) => {
          const active = pathname.startsWith(`/sets/${set.id}`);
          return (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-ink-950/5 text-ink-950" : "text-ink-700 hover:bg-ink-950/[0.03]"
              }`}
            >
              <span className={`size-2 shrink-0 rounded-full ${accentStyles[set.accent].solid}`} />
              <span className="truncate">{set.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-2xl bg-canvas p-4 text-xs leading-relaxed text-ink-500">
        🐝 Made for us. Paste anything, study it your way.
      </div>
    </aside>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <nav className="mx-auto flex h-16 max-w-sm items-center justify-around rounded-2xl border border-line bg-surface/85 px-2 shadow-lift backdrop-blur-xl">
        {nav.slice(0, 1).map((item) => (
          <BottomNavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
        <Link
          href="/new"
          aria-label="New study set"
          className="-mt-8 grid size-14 place-items-center rounded-2xl bg-honey-400 text-ink-950 shadow-honey ring-4 ring-canvas transition active:scale-90"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>
        {nav.slice(1).map((item) => (
          <BottomNavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
    </div>
  );
}

function BottomNavItem({
  href,
  label,
  icon: Icon,
  active,
}: (typeof nav)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex w-20 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
        active ? "text-brand-700" : "text-ink-400"
      }`}
    >
      {active && (
        <motion.span layoutId="bottom-active" className="absolute -top-2 h-1 w-6 rounded-full bg-brand-500" transition={spring} />
      )}
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
