"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NewSetCard, SetCard } from "@/components/set-card";
import { studySets } from "@/lib/demo-data";
import { spring, stagger } from "@/lib/motion";

export function Library() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = studySets.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q)
  );

  return (
    <>
      <label className="relative mt-6 block max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sets or subjects…"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-sm shadow-card outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </label>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {results.map((set) => (
            <motion.div
              key={set.id}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
            >
              <SetCard set={set} />
            </motion.div>
          ))}
          {!q && (
            <motion.div key="new" layout exit={{ opacity: 0 }}>
              <NewSetCard />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {results.length === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-ink-500">
          Nothing matches &ldquo;{query}&rdquo;.
        </motion.p>
      )}
    </>
  );
}
