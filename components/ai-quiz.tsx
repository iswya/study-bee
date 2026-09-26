"use client";

import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LightbulbIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AiQuestion } from "@/app/api/quiz/route";
import { ease, keyHandledByFocus, spring } from "@/lib/motion";
import { useSessionSaver } from "@/lib/use-session-saver";
import { BeeLoader } from "./bee-loader";
import { Results } from "./results";
import { StudyHeader } from "./study-header";
import { buttonClass, cardClass } from "./ui";

type Phase = "setup" | "loading" | "playing";

const counts = [5, 10, 20] as const;
const difficulties = ["easy", "medium", "hard"] as const;
const typeOptions = [
  { id: "multiple_choice", label: "Multiple choice" },
  { id: "true_false", label: "True / false" },
] as const;

export function AiQuiz({ setId, title, cardIds }: { setId: string; title: string; cardIds: string[] }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState<(typeof counts)[number]>(10);
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("medium");
  const [types, setTypes] = useState<string[]>(["multiple_choice", "true_false"]);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<{ cardId: string | null; known: boolean }[]>([]);

  const q = questions[index];
  const playing = phase === "playing";
  const finished = playing && index >= questions.length;
  const answered = picked !== null;
  const saving = useSessionSaver(setId, "quiz", finished, results);

  async function make() {
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, count, difficulty, types }),
      });
      const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
      if (!res.ok) throw new Error(data.error);
      start(data.questions);
    } catch (e) {
      setError((e as Error).message);
      setPhase("setup");
    }
  }

  function start(qs: AiQuestion[]) {
    setQuestions(qs);
    setIndex(0);
    setPicked(null);
    setResults([]);
    setPhase("playing");
  }

  function pick(i: number) {
    if (answered || !q) return;
    setPicked(i);
    setResults((r) => [...r, { cardId: q.card >= 0 ? (cardIds[q.card] ?? null) : null, known: i === q.answer_index }]);
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!playing || finished || !q || e.repeat || keyHandledByFocus(e)) return;
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= q.options.length) pick(n - 1);
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
      <StudyHeader setId={setId} title={title} done={playing ? index + (answered ? 1 : 0) : 0} total={playing ? questions.length : count} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease }}>
              <div className={`${cardClass} p-6`}>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-honey-50 text-honey-600">
                    <SparkleIcon size={22} weight="fill" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-semibold">AI quiz</h1>
                    <p className="text-sm text-ink-500">Fresh questions from your cards, with explanations.</p>
                  </div>
                </div>

                <Choice label="Questions">
                  {counts.map((c) => (
                    <Pill key={c} active={count === c} onClick={() => setCount(c)} group="count">
                      {c}
                    </Pill>
                  ))}
                </Choice>
                <Choice label="Difficulty">
                  {difficulties.map((d) => (
                    <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)} group="difficulty">
                      <span className="capitalize">{d}</span>
                    </Pill>
                  ))}
                </Choice>
                <Choice label="Question types">
                  {typeOptions.map((t) => {
                    const on = types.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setTypes((ts) => (on ? ts.filter((x) => x !== t.id) : [...ts, t.id]))}
                        className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors ${
                          on ? "border-honey-400 bg-honey-50 text-honey-600" : "border-line text-ink-500 hover:text-ink-950"
                        }`}
                      >
                        {on && <CheckIcon size={14} weight="bold" />}
                        {t.label}
                      </button>
                    );
                  })}
                </Choice>

                {error && <p className="mt-5 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
                <button type="button" onClick={make} disabled={!types.length} className={buttonClass("primary", "mt-6 h-12 w-full text-base")}>
                  <SparkleIcon size={18} weight="fill" /> Make quiz
                </button>
              </div>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BeeLoader steps={["Reading your cards…", "Writing questions…", "Checking answers…", "Almost done…"]} hint="Usually takes 10–30 seconds" />
            </motion.div>
          )}

          {finished && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Results
                correct={results.filter((r) => r.known).length}
                total={questions.length}
                saving={saving}
                actions={[
                  { label: "New quiz", icon: <SparkleIcon size={18} weight="fill" />, onClick: () => setPhase("setup"), primary: true },
                  { label: "Retry these questions", icon: <ArrowCounterClockwiseIcon size={18} weight="bold" />, onClick: () => start(questions) },
                  { label: "Back to set", icon: <ArrowLeftIcon size={18} weight="bold" />, href: `/sets/${setId}` },
                ]}
              />
            </motion.div>
          )}

          {playing && !finished && q && (
            <motion.div
              key={`q-${index}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease }}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Question {index + 1} · {q.type === "true_false" ? "True or false" : "Multiple choice"}
              </p>
              <h1 className="mt-2 text-balance font-display text-2xl font-semibold leading-snug sm:text-3xl">{q.question}</h1>

              <div className={`mt-8 grid gap-3 ${q.type === "true_false" ? "grid-cols-2" : ""}`}>
                {q.options.map((opt, i) => {
                  const state = !answered ? "idle" : i === q.answer_index ? "right" : i === picked ? "wrong" : "dim";
                  return (
                    <motion.button
                      key={i}
                      onClick={() => pick(i)}
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
                      <span className="font-medium">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-5 space-y-4">
                    <div className="flex gap-3 rounded-2xl bg-honey-50 p-4">
                      <LightbulbIcon size={20} weight="fill" className="mt-0.5 shrink-0 text-honey-600" />
                      <p className="text-sm leading-relaxed text-ink-900">
                        <span className={`font-semibold ${picked === q.answer_index ? "text-mint-600" : "text-rose-600"}`}>
                          {picked === q.answer_index ? "Correct. " : "Not quite. "}
                        </span>
                        {q.explanation}
                      </p>
                    </div>
                    <button onClick={next} autoFocus className={buttonClass("primary", "w-full sm:ml-auto sm:flex sm:w-auto")}>
                      {index + 1 === questions.length ? "Results" : "Next"} <ArrowRightIcon size={16} weight="bold" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!answered && <p className="mt-6 text-center text-xs text-ink-400">Keys 1–{q.options.length} to answer</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "setup" && (
          <Link href={`/sets/${setId}/quiz`} className="mt-4 text-center text-xs font-medium text-ink-500 hover:text-ink-950">
            Or use the quick quiz (no AI)
          </Link>
        )}
      </div>
    </div>
  );
}

function Choice({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-semibold text-ink-700">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, group, children }: { active: boolean; onClick: () => void; group: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative h-10 flex-1 rounded-xl text-sm font-semibold transition-colors ${active ? "text-honey-ink" : "bg-ink-950/5 text-ink-500 hover:text-ink-950"}`}
    >
      {active && <motion.span layoutId={`pill-${group}`} className="absolute inset-0 rounded-xl bg-honey-400" transition={spring} />}
      <span className="relative">{children}</span>
    </button>
  );
}
