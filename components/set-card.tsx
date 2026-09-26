"use client";

import { ArrowUpRightIcon, PlusIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { accentStyles, type StudySetSummary } from "@/lib/types";
import { fadeUp, liftHover, pressTap } from "@/lib/motion";
import { ProgressRing } from "./motion";

const MotionLink = motion.create(Link);

export function SetCard({ set }: { set: StudySetSummary }) {
  const a = accentStyles[set.accent];
  return (
    <MotionLink
      href={`/sets/${set.id}`}
      variants={fadeUp}
      whileHover={liftHover}
      whileTap={pressTap}
      className="group relative flex min-h-48 flex-col overflow-hidden rounded-card border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color] hover:border-ink-300 hover:shadow-lift"
    >
      {/* Hexagon corner that grows on hover */}
      <svg viewBox="0 0 100 100" className={`pointer-events-none absolute -right-8 -top-8 size-32 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 ${a.text}`} aria-hidden>
        <path d="M50 4 90 27v46L50 96 10 73V27z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      <div className="relative flex items-start justify-between">
        <ProgressRing value={set.progress} className={a.stroke}>
          <span className="text-[11px] font-bold tabular-nums">{set.progress}%</span>
        </ProgressRing>
        <span className="grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-500 transition-all duration-300 group-hover:rotate-45 group-hover:border-honey-400 group-hover:bg-honey-400 group-hover:text-honey-ink">
          <ArrowUpRightIcon size={16} weight="bold" />
        </span>
      </div>

      <div className="relative mt-auto pt-6">
        {set.subject && <p className={`text-xs font-bold ${a.text}`}>{set.subject}</p>}
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{set.title}</h3>
        <p className="mt-1 text-sm text-ink-500">
          {set.cardCount === 0 ? "No cards" : `${set.knownCount} / ${set.cardCount} known`}
        </p>
      </div>
    </MotionLink>
  );
}

export function NewSetCard() {
  return (
    <MotionLink
      href="/new"
      variants={fadeUp}
      whileHover={liftHover}
      whileTap={pressTap}
      className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line text-ink-500 transition-colors hover:border-honey-400 hover:bg-honey-50 hover:text-honey-600"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-surface shadow-card transition-transform duration-300 group-hover:rotate-90">
        <PlusIcon size={22} weight="bold" />
      </span>
      <span className="text-sm font-semibold">New set</span>
    </MotionLink>
  );
}
