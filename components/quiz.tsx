"use client";

import { ArrowCounterClockwiseIcon, ArrowLeftIcon, ArrowRightIcon, CardsThreeIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/types";
import { ease, spring } from "@/lib/motion";
import { useSessionSaver } from "@/lib/use-session-saver";
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
      cards.filter((c) => c.id !== card.id && c.back !== card.back),
      `${card.id}-${round}`
    ).slice(0, 3);
    return {
      card,
      options: seededShuffle([card, ...wrong], `opts-${card.id}-${round}`).map((c) => ({ id: c.id, text: c.back })),
    };
  });
}

export function Quiz({ setId, title, cards }: { setId: string; title: string; cards: Card[] }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildQuestions(cards, round), [cards, round]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<{ cardId: string; known: boolean }[]>([]);

  const q = questions[index];
  const finished = index >= questions.length;
  const answered = picked !== null;
  const saving = useSessionSaver(setId, "quiz", finished, results);

  function pick(id: string) {
    if (answered) return;
    setPicked(id);
    setResults((r) => [...r, { cardId: q.card.id, known: id === q.card.id }]);
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
            correct={results.filter((r) => r.known).length}
            total={questions.length}
            saving={saving}
            actions={[
              {
                label: "Try again",
                icon: <ArrowCounterClockwiseIcon size={18} weight="bold" />,
                primary: true,
                onClick: () => {
                  setRound((r) => r + 1);
                  setIndex(0);
                  setResults([]);
                },
              },
              { label: "Flashcards", icon: <CardsThreeIcon size={18} weight="duotone" />, href: `/sets/${setId}/flashcards` },
              { label: "Back to set", icon: <ArrowLeftIcon size={18} weight="bold" />, href: `/sets/${setId}` },
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
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Question {index + 1}</p>
              <h1 className="mt-2 text-balance font-display text-2xl font-semibold leading-snug sm:text-3xl">{q.card.front}</h1>

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
                          : { opacity: state === "dim" ? 0.4 : 1, y: 0, scale: state === "right" ? 1.02 : 1 }
                      }
                      transition={state === "wrong" ? { duration: 0.4 } : { ...spring, delay: answered ? 0 : i * 0.05 }}
                      className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 ${
                        state === "right"
                          ? "border-mint-500 bg-mint-50"
                          : state === "wrong"
                            ? "border-rose-500 bg-rose-50"
                            : "border-line bg-surface hover:border-honey-400 hover:bg-honey-50 hover:ring-4 hover:ring-honey-400/15 active:scale-[0.98]"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold transition-colors ${
                          state === "right"
                            ? "bg-mint-500 text-white"
                            : state === "wrong"
                              ? "bg-rose-500 text-white"
                              : "bg-ink-950/5 text-ink-500 group-hover:bg-honey-400 group-hover:text-honey-ink"
                        }`}
                      >
                        {state === "right" ? <CheckIcon size={18} weight="bold" /> : state === "wrong" ? <XIcon size={18} weight="bold" /> : i + 1}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8 flex min-h-12 items-center justify-between gap-4">
                <AnimatePresence>
                  {answered && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-semibold ${picked === q.card.id ? "text-mint-600" : "text-rose-600"}`}
                    >
                      {picked === q.card.id ? "Correct" : "Wrong — answer in green"}
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
                    {index + 1 === questions.length ? "Results" : "Next"} <ArrowRightIcon size={16} weight="bold" />
                  </motion.button>
                )}
              </div>
              {!answered && <p className="text-center text-xs text-ink-400">Keys 1–{q.options.length} to answer</p>}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
