"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { spring } from "@/lib/motion";
import { Bee } from "./bee";
import { AnimatedNumber, ProgressRing } from "./motion";
import { buttonClass } from "./ui";

type Action = { label: string; icon?: React.ReactNode; primary?: boolean } & ({ onClick: () => void } | { href: string });

// Honey hexagons that burst out behind the score.
function Burst() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-20" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 95 + (i % 3) * 24;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 10 10"
            className={`absolute -ml-1.5 -mt-1.5 size-3 ${i % 3 ? "fill-honey-400" : "fill-honey-300"}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: [0, 1, 0], scale: [0, 1.2, 0.6], rotate: 120 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
          >
            <path d="M5 0 9.33 2.5v5L5 10 .67 7.5v-5z" />
          </motion.svg>
        );
      })}
    </div>
  );
}

export function Results({ correct, total, saving, actions }: { correct: number; total: number; saving: boolean; actions: Action[] }) {
  const pct = total ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-line bg-surface p-8 text-center shadow-lift"
    >
      {pct >= 70 && <Burst />}
      {/* On a perfect round a bee zips across the card */}
      {pct === 100 && (
        <motion.div
          className="pointer-events-none absolute left-0 top-6"
          initial={{ x: -60, y: 40 }}
          animate={{ x: 460, y: [40, 0, 30, -10] }}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.6 }}
        >
          <Bee className="size-8" />
        </motion.div>
      )}
      <div className="flex justify-center">
        <ProgressRing value={pct} size={120} stroke={11} className={pct >= 70 ? "stroke-honey-400" : "stroke-rose-500"}>
          <span className="font-display text-3xl font-semibold tabular-nums">
            <AnimatedNumber value={pct} suffix="%" />
          </span>
        </ProgressRing>
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">
        {correct} / {total} correct
      </h2>
      <p className="mt-1 h-5 text-sm text-ink-500">{saving ? "Saving…" : "Progress saved"}</p>
      <div className="mt-7 flex flex-col gap-2">
        {actions.map((a) =>
          "href" in a ? (
            <Link key={a.label} href={a.href} className={buttonClass(a.primary ? "primary" : "outline")}>
              {a.icon}
              {a.label}
            </Link>
          ) : (
            <button key={a.label} onClick={a.onClick} className={buttonClass(a.primary ? "primary" : "outline")}>
              {a.icon}
              {a.label}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
