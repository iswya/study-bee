"use client";

import { CaretRightIcon, EyeSlashIcon, FireIcon, TimerIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Bee } from "@/components/bee";
import { cardClass, pressable } from "@/components/ui";
import type { LeaderboardRow } from "@/lib/types";
import { ease, spring } from "@/lib/motion";

const podium = [
  { place: 2, height: "h-20 sm:h-24", medal: "from-zinc-200 to-zinc-400", delay: 0.15 },
  { place: 1, height: "h-28 sm:h-32", medal: "from-honey-300 to-honey-500", delay: 0 },
  { place: 3, height: "h-14 sm:h-16", medal: "from-orange-300 to-orange-600", delay: 0.3 },
];

export function LeaderboardView({ rows, period, hidden }: { rows: LeaderboardRow[]; period: "week" | "all"; hidden: boolean }) {
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl bg-ink-950/5 p-1">
          {(
            [
              ["week", "This week"],
              ["all", "All time"],
            ] as const
          ).map(([id, label]) => (
            <Link
              key={id}
              href={id === "week" ? "/leaderboard" : "/leaderboard?period=all"}
              scroll={false}
              className={`relative h-10 rounded-xl px-4 text-sm font-semibold leading-10 transition-colors ${period === id ? "text-honey-ink" : "text-ink-500 hover:text-ink-950"}`}
            >
              {period === id && <motion.span layoutId="board-tab" className="absolute inset-0 rounded-xl bg-honey-400" transition={spring} />}
              <span className="relative">{label}</span>
            </Link>
          ))}
        </div>
        <p className="text-xs font-medium text-ink-500">Ranked by cards reviewed</p>
      </div>

      {hidden && (
        <Link href="/settings#privacy" className={`mt-4 flex items-center gap-3 rounded-2xl border border-line bg-raised p-3 text-sm hover:border-honey-400/60 ${pressable}`}>
          <EyeSlashIcon size={20} weight="duotone" className="shrink-0 text-ink-500" />
          <span className="flex-1 text-ink-700">You&apos;re hidden — only you can see yourself here.</span>
          <span className="font-semibold text-honey-600">Settings</span>
        </Link>
      )}

      {/* Podium */}
      {top.length > 0 && (
        <div className="mt-8 grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podium.map(({ place, height, medal, delay }) => {
            const row = top[place - 1];
            if (!row) return <div key={place} />;
            return (
              <motion.div
                key={`${period}-${row.username}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay }}
                className="flex min-w-0 flex-col items-center"
              >
                <Link href={`/u/${row.username}`} className={`group flex min-w-0 max-w-full flex-col items-center ${pressable}`}>
                  <div className="relative">
                    {place === 1 && (
                      <motion.div className="absolute -top-7 left-1/2 -ml-4" animate={{ y: [0, -4, 0], rotate: [-6, 6, -6] }} transition={{ duration: 2.2, repeat: Infinity }}>
                        <Bee className="size-8" />
                      </motion.div>
                    )}
                    <Avatar user={row} size={place === 1 ? "lg" : "md"} online={row.online} className={`transition-transform group-hover:-translate-y-1 ${place === 1 ? "" : "sm:scale-125"}`} />
                    <span className={`absolute -left-2 -top-2 grid size-7 place-items-center rounded-lg bg-linear-to-br font-display text-sm font-bold text-honey-ink shadow-card ring-2 ring-canvas ${medal}`}>
                      {place}
                    </span>
                  </div>
                  <span className={`mt-4 max-w-full truncate text-sm font-semibold ${row.is_me ? "text-honey-600" : ""}`}>{row.username}</span>
                  <span className="text-xs text-ink-500">
                    <span className="font-display text-base font-semibold text-ink-950">{row.cards_reviewed}</span> cards
                  </span>
                </Link>
                <motion.div
                  className={`relative mt-3 w-full overflow-hidden rounded-t-2xl bg-linear-to-b ${place === 1 ? "from-honey-400/45" : "from-honey-400/25"} to-transparent ${height}`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, ease, delay: delay + 0.1 }}
                  style={{ transformOrigin: "bottom" }}
                >
                  <span className="honeycomb absolute inset-0" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Everyone else */}
      {rest.length > 0 && (
        <ol className={`${cardClass} mt-2 divide-y divide-line overflow-hidden`}>
          {rest.map((row, i) => (
            <motion.li key={`${period}-${row.username}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease, delay: 0.3 + Math.min(i, 12) * 0.03 }}>
              <Link
                href={`/u/${row.username}`}
                className={`group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-honey-50/60 sm:gap-4 sm:px-4 ${row.is_me ? "bg-honey-50" : ""}`}
              >
                <span className="w-6 text-center font-display text-sm font-semibold tabular-nums text-ink-400">{i + 4}</span>
                <Avatar user={row} size="sm" online={row.online} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{row.username}</span>
                    {row.is_me && <span className="rounded-md bg-honey-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-honey-ink">You</span>}
                  </span>
                  <span className="mt-0.5 flex items-center gap-3 text-xs text-ink-500">
                    {row.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-honey-600">
                        <FireIcon size={12} weight="fill" /> {row.streak}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <TimerIcon size={12} weight="duotone" /> {row.minutes}m
                    </span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-lg font-semibold tabular-nums leading-none">{row.cards_reviewed}</span>
                  <span className="text-[11px] text-ink-500">cards</span>
                </span>
                <CaretRightIcon size={16} weight="bold" className="hidden text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-honey-600 sm:block" />
              </Link>
            </motion.li>
          ))}
        </ol>
      )}

      {rows.length === 0 && (
        <div className="mt-16 text-center">
          <Bee className="mx-auto size-16" hover />
          <p className="mt-4 text-sm text-ink-500">Nobody here yet. Invite some friends!</p>
        </div>
      )}
    </>
  );
}
