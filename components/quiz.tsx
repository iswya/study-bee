"use client";

import { ArrowRight, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/demo-data";
import { ease, spring } from "@/lib/motion";
import { Results } from "./results";
import { StudyHeader } from "./study-header";
import { buttonClass } from "./ui";

// Deterministic shuffle so the server and browser render the same order.
function seededShuffle<T>(items: T[], seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildQuestions(cards: Card[], round: number) {
  return seededShuffle(cards, `order-${round}`).map((card) => {
    const wrong = seededShuffle(
      cards.filter((c) => c.id !== card.id),
      `${card.id}-${round}`
    ).slice(0, 3);
    return {
      card,
      options: seededShuffle([card, ...wrong], `opts-${card.id}-${round}`).map((c) => ({
        id: c.id,
        text: c.back,
      })),
    };
  });
}

export function Quiz({ setId, title, cards }: { setId: string; title: string; cards: Card[] }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildQuestions(cards, round), [cards, round]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[index];
  const finished = index >= questions.length;
  const answered = picked !== null;

  function pick(id: string) {
    if (answered) return;
    setPicked(id);
    if (id === q.card.id) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished) return;
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= q.options.length) pick(q.options[n - 1].id);
      if (answered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <StudyHeader setId={setId} title={title} done={index + (answered ? 1 : 0)} total={questions.length} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        {finished ? (
          <Results
            correct={score}
            total={questions.length}
            actions={[
              {
                label: "Try again",
                primary: true,
                onClick: () => {
                  setRound((r) => r + 1);
                  setIndex(0);
                  setScore(0);
                },
              },
              { label: "Back to flashcards", href: `/sets/${setId}/flashcards` },
            ]}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${round}-${index}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Question {index + 1}
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold leading-snug tracking-tight text-balance sm:text-3xl">
                {q.card.front}
              </h1>

              <div className="mt-8 grid gap-3">
                {q.options.map((opt, i) => {
                  const isRight = opt.id === q.card.id;
                  const isPicked = opt.id === picked;
                  const state = !answered ? "idle" : isRight ? "right" : isPicked ? "wrong" : "dim";
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => pick(opt.id)}
                      disabled={answered}
                      initial={{ opacity: 0, y: 10 }}
                      animate={
                        state === "wrong"
                          ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }
                          : { opacity: state === "dim" ? 0.45 : 1, y: 0, scale: state === "right" ? 1.02 : 1 }
                      }
                      transition={state === "wrong" ? { duration: 0.4 } : { ...spring, delay: answered ? 0 : i * 0.05 }}
                      className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
                        state === "right"
                          ? "border-mint-500 bg-mint-50"
                          : state === "wrong"
                            ? "border-rose-500 bg-rose-50"
                            : "border-line bg-surface hover:border-brand-300 hover:bg-brand-50/40"
                      }`}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold transition-colors ${
                          state === "right"
                            ? "bg-mint-500 text-white"
                            : state === "wrong"
                              ? "bg-rose-500 text-white"
                              : "bg-canvas text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-700"
                        }`}
                      >
                        {state === "right" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : i + 1}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8 flex min-h-11 items-center justify-between gap-4">
                <AnimatePresence>
                  {answered && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-semibold ${picked === q.card.id ? "text-mint-600" : "text-rose-600"}`}
                    >
                      {picked === q.card.id ? "Nice, that's it!" : "Not quite — the right one's in green."}
                    </motion.p>
                  )}
                </AnimatePresence>
                {answered && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                    onClick={next}
                    autoFocus
                    className={buttonClass("primary", "ml-auto")}
                  >
                    {index + 1 === questions.length ? "See results" : "Next"} <ArrowRight className="size-4" />
                  </motion.button>
                )}
              </div>
              {!answered && <p className="text-center text-xs text-ink-400">Tip: press 1–{q.options.length} to answer</p>}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
