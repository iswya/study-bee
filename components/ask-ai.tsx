"use client";

import { ArrowUpIcon, SparkleIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { spring } from "@/lib/motion";
import { BeeLoader } from "./bee-loader";
import { inputClass, pressable } from "./ui";

export type Draft = { front: string; back: string };
export type Status = "same" | "edited" | "new";

const suggestions = ["Shorter answers", "Add 5 more cards", "Make them harder", "Fix any mistakes", "Remove duplicates", "Turn them into questions"];

// Compares an AI-edited list with the original, card by card.
export function diffCards(before: Draft[], after: Draft[]) {
  const pairs = new Set(before.map((c) => `${c.front}\u0000${c.back}`));
  const fronts = new Set(before.map((c) => c.front.toLowerCase()));
  const statuses: Status[] = after.map((c) =>
    pairs.has(`${c.front}\u0000${c.back}`) ? "same" : fronts.has(c.front.toLowerCase()) ? "edited" : "new"
  );
  const afterFronts = new Set(after.map((c) => c.front.toLowerCase()));
  const removed = before.filter((c) => !afterFronts.has(c.front.toLowerCase())).length;
  return {
    statuses,
    added: statuses.filter((s) => s === "new").length,
    edited: statuses.filter((s) => s === "edited").length,
    removed,
  };
}

// Text box + quick chips that send the cards and a request to the AI.
export function AskAi({
  cards,
  title,
  subject,
  onResult,
  placeholder = "Ask AI to change these cards…",
}: {
  cards: Draft[];
  title?: string;
  subject?: string;
  onResult: (cards: Draft[], summary: string) => void;
  placeholder?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(instruction: string) {
    if (!instruction.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards, instruction, title, subject }),
      });
      const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
      if (!res.ok) throw new Error(data.error);
      setPrompt("");
      onResult(data.cards, data.summary);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BeeLoader steps={["Reading your cards…", "Making changes…", "Almost done…"]} hint={cards.length > 60 ? "Big sets can take a minute" : null} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Not a <form>: this can sit inside the new-set form, and forms can't nest. */}
            <div className="relative">
              <SparkleIcon size={18} weight="fill" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-honey-500" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder}
                maxLength={600}
                enterKeyHint="send"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send(prompt);
                  }
                }}
                className={`${inputClass} pl-11 pr-14`}
              />
              <button
                type="button"
                onClick={() => send(prompt)}
                disabled={!prompt.trim()}
                aria-label="Send"
                className={`absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl bg-honey-400 text-honey-ink ${pressable}`}
              >
                <ArrowUpIcon size={18} weight="bold" />
              </button>
            </div>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  whileTap={{ scale: 0.94 }}
                  transition={spring}
                  className="shrink-0 rounded-full border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-honey-400 hover:text-honey-600"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "same") return null;
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
        status === "new" ? "bg-mint-50 text-mint-600" : "bg-honey-50 text-honey-600"
      }`}
    >
      {status === "new" ? "New" : "Edited"}
    </span>
  );
}

export function ChangeSummary({ summary, added, edited, removed }: { summary: string; added: number; edited: number; removed: number }) {
  return (
    <div className="rounded-2xl bg-honey-50 px-4 py-3">
      <p className="flex items-start gap-2 text-sm font-medium text-ink-900">
        <SparkleIcon size={16} weight="fill" className="mt-0.5 shrink-0 text-honey-600" />
        {summary}
      </p>
      <p className="mt-1 pl-6 text-xs font-semibold text-ink-500">
        {[added && `+${added} new`, edited && `${edited} edited`, removed && `−${removed} removed`].filter(Boolean).join(" · ") || "No changes"}
      </p>
    </div>
  );
}
