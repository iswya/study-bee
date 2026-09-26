"use client";

import { ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { accentStyles, type StudySet } from "@/lib/demo-data";
import { fadeUp, liftHover, pressTap } from "@/lib/motion";
import { ProgressRing } from "./motion";

const MotionLink = motion.create(Link);

export function SetCard({ set }: { set: StudySet }) {
  const a = accentStyles[set.accent];
  return (
    <MotionLink
      href={`/sets/${set.id}`}
      variants={fadeUp}
      whileHover={liftHover}
      whileTap={pressTap}
      className="group relative flex min-h-48 flex-col overflow-hidden rounded-card border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <span
        className={`pointer-events-none absolute -right-10 -top-10 size-36 rounded-full ${a.soft} transition-transform duration-500 group-hover:scale-125`}
      />
      <div className="relative flex items-start justify-between">
        <ProgressRing value={set.progress} className={a.stroke}>
          <span className="text-[11px] font-semibold tabular-nums">{set.progress}%</span>
        </ProgressRing>
        <span className="grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-500 transition-all duration-300 group-hover:rotate-45 group-hover:border-ink-950 group-hover:bg-ink-950 group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="relative mt-auto pt-6">
        <p className={`flex items-center gap-1.5 text-xs font-semibold ${a.text}`}>
          {set.subject}
          {set.aiGenerated && <Sparkles className="size-3" aria-label="Made with AI" />}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug tracking-tight">{set.title}</h3>
        <p className="mt-1 text-sm text-ink-500">
          {set.cards.length === 0 ? "No cards yet" : `${set.cards.length} cards`}
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
      className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-ink-300/70 text-ink-500 transition-colors hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-surface shadow-card transition-transform duration-300 group-hover:rotate-90">
        <Plus className="size-5" />
      </span>
      <span className="text-sm font-semibold">New study set</span>
    </MotionLink>
  );
}
