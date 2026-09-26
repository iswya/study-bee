"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NewSetCard, SetCard } from "@/components/set-card";
import { inputClass } from "@/components/ui";
import type { StudySetSummary } from "@/lib/types";
import { spring, stagger } from "@/lib/motion";

export function Library({ sets }: { sets: StudySetSummary[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = sets.filter((s) => !q || s.title.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q));

  return (
    <>
      <label className="relative mt-6 block max-w-md">
        <MagnifyingGlassIcon size={18} weight="duotone" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className={`${inputClass} pl-11`} />
      </label>

      <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((set) => (
            <motion.div key={set.id} layout exit={{ opacity: 0, scale: 0.9 }} transition={spring}>
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

      {q && results.length === 0 && <p className="mt-4 text-sm text-ink-500">No sets match &ldquo;{query}&rdquo;.</p>}
    </>
  );
}
