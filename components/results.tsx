"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { spring } from "@/lib/motion";
import { AnimatedNumber, ProgressRing } from "./motion";
import { buttonClass } from "./ui";

type Action = { label: string; primary?: boolean } & ({ onClick: () => void } | { href: string });

function headline(pct: number) {
  if (pct === 100) return "Perfect round! 🐝";
  if (pct >= 75) return "Nice, almost there.";
  if (pct >= 40) return "Getting there.";
  return "Good start — run it back.";
}

// Little honey hexagons that burst out behind the score.
function Burst() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-16" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 90 + (i % 3) * 22;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 10 10"
            className={`absolute size-3 ${i % 2 ? "fill-honey-400" : "fill-brand-400"}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.6],
              rotate: 180,
            }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
          >
            <path d="M5 0 9.33 2.5v5L5 10 .67 7.5v-5z" />
          </motion.svg>
        );
      })}
    </div>
  );
}

export function Results({
  correct,
  total,
  actions,
}: {
  correct: number;
  total: number;
  actions: Action[];
}) {
  const pct = total ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="relative mx-auto w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lift"
    >
      {pct >= 75 && <Burst />}
      <div className="flex justify-center">
        <ProgressRing value={pct} size={112} stroke={10} className={pct >= 75 ? "stroke-mint-500" : "stroke-honey-400"}>
          <span className="font-display text-2xl font-bold tabular-nums">
            <AnimatedNumber value={pct} suffix="%" />
          </span>
        </ProgressRing>
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">{headline(pct)}</h2>
      <p className="mt-1 text-sm text-ink-500">
        You got {correct} of {total} right.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        {actions.map((a) =>
          "href" in a ? (
            <Link key={a.label} href={a.href} className={buttonClass(a.primary ? "primary" : "outline")}>
              {a.label}
            </Link>
          ) : (
            <button key={a.label} onClick={a.onClick} className={buttonClass(a.primary ? "primary" : "outline")}>
              {a.label}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
