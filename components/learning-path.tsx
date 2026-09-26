"use client";

import {
  ArrowCounterClockwiseIcon,
  BookOpenTextIcon,
  CardsThreeIcon,
  CheckIcon,
  ExamIcon,
  GraduationCapIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { ease, spring } from "@/lib/motion";
import { Bee } from "./bee";

const steps = [
  { label: "Read the cards", icon: BookOpenTextIcon, mode: "" },
  { label: "Flashcards", icon: CardsThreeIcon, mode: "flashcards" },
  { label: "Quiz", icon: ExamIcon, mode: "quiz" },
  { label: "Redo misses", icon: ArrowCounterClockwiseIcon, mode: "flashcards" },
  { label: "Final quiz", icon: GraduationCapIcon, mode: "ai-quiz" },
];

const W = 300;
const ROW = 104;
const TOP = 56;
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
  const height = TOP + (steps.length - 1) * ROW + 48;

  return (
    <div className="relative mx-auto" style={{ width: W, height }}>
      <svg width={W} height={height} className="absolute inset-0" aria-hidden>
        <path d={curve(points)} fill="none" strokeWidth={12} strokeLinecap="round" className="stroke-ink-950/[0.06]" />
        <path d={curve(points)} fill="none" strokeWidth={2} strokeLinecap="round" strokeDasharray="1 10" className="stroke-ink-950/20" />
        {current > 0 && (
          <motion.path
            d={curve(points.slice(0, current + 1))}
            fill="none"
            strokeWidth={12}
            strokeLinecap="round"
            className="stroke-honey-400/40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          />
        )}
      </svg>

      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "locked";
        const StepIcon = state === "done" ? CheckIcon : state === "locked" ? LockSimpleIcon : step.icon;
        const labelRight = points[i].x < W / 2;
        const href = `/sets/${setId}${step.mode ? `/${step.mode}` : "#cards"}`;

        const node = (
          <motion.span
            whileHover={state !== "locked" ? { scale: 1.08, rotate: -4 } : undefined}
            whileTap={state !== "locked" ? { scale: 0.92 } : undefined}
            transition={spring}
            className={`relative grid size-16 place-items-center rounded-[1.4rem] border-b-4 ${
              state === "done"
                ? "border-honey-600 bg-honey-400 text-honey-ink"
                : state === "current"
                  ? "border-honey-500 bg-surface text-honey-600 ring-2 ring-honey-400"
                  : "border-line bg-raised text-ink-300"
            }`}
          >
            <StepIcon size={26} weight={state === "locked" ? "bold" : "fill"} />
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
            {/* A bee hovers over whatever step you're on */}
            {state === "current" && (
              <motion.div
                className="absolute -top-7 left-1/2 -ml-4"
                initial={{ x: -60, y: -30, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.9 }}
              >
                <Bee className="size-8" hover />
              </motion.div>
            )}
            {state === "locked" ? (
              <span aria-label={`${step.label} (locked)`}>{node}</span>
            ) : (
              <Link href={href} aria-label={step.label} className="block rounded-[1.4rem]">
                {node}
              </Link>
            )}
            <span
              className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold ${
                labelRight ? "left-full ml-3" : "right-full mr-3"
              } ${state === "current" ? "text-honey-600" : state === "done" ? "text-ink-700" : "text-ink-400"}`}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
