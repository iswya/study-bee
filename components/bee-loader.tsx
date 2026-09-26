"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Bee } from "./bee";

const steps = ["Reading your files…", "Finding the key ideas…", "Writing cards…", "Almost done…"];

// Three bees circling a honeycomb cell while AI works.
export function BeeLoader() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <motion.path
            d="M50 22 74 36v28L50 78 26 64V36z"
            fill="var(--color-honey-400)"
            fillOpacity="0.15"
            stroke="var(--color-honey-400)"
            strokeWidth="3"
            strokeLinejoin="round"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 50px" }}
          />
        </svg>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "linear", delay: -i * 1.1 }}
          >
            <div style={{ transform: `translate(-12px, ${-44 - i * 6}px)` }}>
              <Bee className="size-6" />
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mt-2 text-sm font-semibold text-ink-700"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
      <p className="mt-1 text-xs text-ink-400">Big PDFs can take a minute</p>
    </div>
  );
}
