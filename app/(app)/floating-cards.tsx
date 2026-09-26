"use client";

import { motion } from "motion/react";
import type { Card } from "@/lib/demo-data";

// Decorative fanned-out stack of flashcards that gently bobs.
const layout = [
  { rotate: -8, x: -26, y: 10, delay: 0 },
  { rotate: 5, x: 22, y: -4, delay: 0.4 },
  { rotate: -1, x: 0, y: 0, delay: 0.8 },
];

export function FloatingCards({ cards }: { cards: Card[] }) {
  return (
    <div className="relative hidden h-48 w-64 md:block" aria-hidden>
      {cards.map((card, i) => {
        const l = layout[i];
        return (
          <motion.div
            key={card.id}
            className="absolute inset-x-4 top-6 rounded-2xl bg-white p-4 text-ink-950 shadow-lift"
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{
              opacity: 1,
              x: l.x,
              y: [l.y, l.y - 8, l.y],
              rotate: l.rotate,
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.3 + i * 0.12 },
              rotate: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 + i * 0.12 },
              x: { type: "spring", stiffness: 120, damping: 14, delay: 0.3 + i * 0.12 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: l.delay },
            }}
          >
            {i === cards.length - 1 ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Card {i + 1}</p>
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug">{card.front}</p>
              </>
            ) : (
              // Cards underneath just show placeholder lines.
              <div className="space-y-2 py-1">
                <div className="h-2 w-10 rounded-full bg-ink-950/10" />
                <div className="h-2.5 w-4/5 rounded-full bg-ink-950/10" />
                <div className="h-2.5 w-3/5 rounded-full bg-ink-950/10" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
