"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { ease, fadeUp, stagger } from "@/lib/motion";

// Wrap a group of <Item>s to have them fade up one after another.
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

// Counts up from 0 when it scrolls into view.
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.1, ease });
      return () => controls.stop();
    }
  }, [inView, value, count]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

export function ProgressRing({
  value,
  size = 48,
  stroke = 5,
  className = "stroke-brand-500",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-ink-950/[0.07]" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={className}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, className = "bg-brand-500" }: { value: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-950/[0.07]">
      <motion.div
        className={`h-full rounded-full ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease }}
      />
    </div>
  );
}
