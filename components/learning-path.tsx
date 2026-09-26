"use client";

import { BookOpen, Check, GraduationCap, Layers, ListChecks, Lock, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { ease, spring } from "@/lib/motion";

const steps = [
  { label: "Skim the cards", icon: BookOpen, mode: "" },
  { label: "Flashcards", icon: Layers, mode: "flashcards" },
  { label: "Quick quiz", icon: ListChecks, mode: "quiz" },
  { label: "Redo the misses", icon: RotateCcw, mode: "flashcards" },
  { label: "Final test", icon: GraduationCap, mode: "quiz" },
];

const W = 320;
const ROW = 104;
const TOP = 48;
const xs = [0.3, 0.68, 0.32, 0.7, 0.36].map((f) => f * W);
const points = steps.map((_, i) => ({ x: xs[i], y: TOP + i * ROW }));

// Smooth S-curves between each node.
function curve(pts: { x: number; y: number }[]) {
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const mid = (prev.y + p.y) / 2;
      return `C ${prev.x} ${mid}, ${p.x} ${mid}, ${p.x} ${p.y}`;
    })
    .join(" ");
}

export function LearningPath({ setId, progress }: { setId: string; progress: number }) {
  const current = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));
  const height = TOP * 2 + (steps.length - 1) * ROW;

  return (
    <div className="relative mx-auto" style={{ width: W, height }}>
      <svg width={W} height={height} className="absolute inset-0" aria-hidden>
        <path d={curve(points)} fill="none" strokeWidth={14} strokeLinecap="round" className="stroke-ink-950/[0.06]" />
        {current > 0 && (
          <motion.path
            d={curve(points.slice(0, current + 1))}
            fill="none"
            strokeWidth={14}
            strokeLinecap="round"
            className="stroke-brand-200"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          />
        )}
      </svg>

      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "locked";
        const Icon = state === "done" ? Check : state === "locked" ? Lock : step.icon;
        const labelRight = points[i].x < W / 2;
        const href = `/sets/${setId}${step.mode ? `/${step.mode}` : ""}`;

        const node = (
          <motion.span
            whileHover={state !== "locked" ? { scale: 1.08 } : undefined}
            whileTap={state !== "locked" ? { scale: 0.94 } : undefined}
            transition={spring}
            className={`relative grid size-16 place-items-center rounded-2xl border-b-4 ${
              state === "done"
                ? "border-brand-800 bg-brand-600 text-white"
                : state === "current"
                  ? "border-honey-600 bg-honey-400 text-ink-950"
                  : "border-line bg-surface text-ink-300"
            }`}
          >
            {state === "current" && (
              <motion.span
                className="absolute inset-0 rounded-2xl ring-4 ring-honey-300"
                animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <Icon className="size-6" strokeWidth={2.2} />
          </motion.span>
        );

        return (
          <motion.div
            key={step.label}
            className="absolute size-16"
            style={{ left: points[i].x - 32, top: points[i].y - 32 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.15 + i * 0.08 }}
          >
            {state === "locked" ? (
              <span aria-label={`${step.label} (locked)`}>{node}</span>
            ) : (
              <Link href={href} aria-label={step.label} className="block rounded-2xl">
                {node}
              </Link>
            )}
            {/* Label sits on whichever side has room */}
            <span
              className={`absolute top-1/2 flex -translate-y-1/2 flex-col whitespace-nowrap ${
                labelRight ? "left-full ml-3 items-start" : "right-full mr-3 items-end"
              }`}
            >
              {state === "current" && (
                <span className="mb-1 rounded-md bg-honey-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-honey-700">
                  Up next
                </span>
              )}
              <span
                className={`text-sm font-semibold ${
                  state === "current" ? "text-ink-950" : state === "done" ? "text-ink-700" : "text-ink-400"
                }`}
              >
                {step.label}
              </span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
