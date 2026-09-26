"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Card } from "@/lib/demo-data";
import { spring } from "@/lib/motion";
import { Results } from "./results";
import { StudyHeader } from "./study-header";

const SWIPE_DISTANCE = 110;

export function Flashcards({ setId, title, cards }: { setId: string; title: string; cards: Card[] }) {
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Card[]>([]);
  const [direction, setDirection] = useState(0); // -1 = still learning, 1 = got it

  const card = queue[index];
  const finished = index >= queue.length;

  const answer = useCallback(
    (knewIt: boolean) => {
      if (!card) return;
      setDirection(knewIt ? 1 : -1);
      if (!knewIt) setMissed((m) => [...m, card]);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") answer(true);
      else if (e.key === "ArrowLeft") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, finished]);

  function restart(next: Card[]) {
    setQueue(next);
    setMissed([]);
    setIndex(0);
    setFlipped(false);
    setDirection(0);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <StudyHeader setId={setId} title={title} done={index} total={queue.length} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        {finished ? (
          <Results
            correct={queue.length - missed.length}
            total={queue.length}
            actions={[
              missed.length > 0
                ? { label: `Redo the ${missed.length} I missed`, onClick: () => restart(missed), primary: true }
                : { label: "Go again", onClick: () => restart(cards), primary: true },
              { label: "Take the quiz", href: `/sets/${setId}/quiz` },
            ]}
          />
        ) : (
          <>
            <div className="perspective relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-[3/2]">
              {/* Peek of the next cards in the deck */}
              {[2, 1].map((depth) =>
                queue[index + depth] ? (
                  <motion.div
                    key={queue[index + depth].id}
                    className="absolute inset-0 rounded-3xl border border-line bg-surface shadow-card"
                    animate={{ y: depth * 12, scale: 1 - depth * 0.05 }}
                    transition={spring}
                  />
                ) : null
              )}
              <AnimatePresence custom={direction} initial={false}>
                <SwipeCard
                  key={card.id}
                  card={card}
                  flipped={flipped}
                  onFlip={() => setFlipped((f) => !f)}
                  onSwipe={answer}
                />
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <ActionButton onClick={() => answer(false)} label="Still learning" hint="←" className="text-rose-600 hover:border-rose-500/40 hover:bg-rose-50">
                <X className="size-5" />
              </ActionButton>
              <button
                onClick={() => setFlipped((f) => !f)}
                className="flex h-14 items-center gap-2 rounded-2xl bg-ink-950 px-6 text-sm font-semibold text-white transition hover:bg-ink-900 active:scale-95"
              >
                <RotateCcw className="size-4" /> Flip
                <kbd className="ml-1 rounded-md bg-white/15 px-1.5 py-0.5 font-sans text-[10px]">space</kbd>
              </button>
              <ActionButton onClick={() => answer(true)} label="Got it" hint="→" className="text-mint-600 hover:border-mint-500/40 hover:bg-mint-50">
                <Check className="size-5" />
              </ActionButton>
            </div>
            <p className="mt-5 text-center text-xs text-ink-400">
              Tap the card to flip · swipe right if you knew it, left if not
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SwipeCard({
  card,
  flipped,
  onFlip,
  onSwipe,
}: {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (knewIt: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const knewOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1]);
  const missOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > 700) onSwipe(true);
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -700) onSwipe(false);
  }

  return (
    <motion.div
      className="absolute inset-0 z-10 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      custom={0}
      variants={{
        exit: (dir: number) => ({
          x: dir * 520,
          rotate: dir * 18,
          opacity: 0,
          transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
        }),
      }}
      initial={{ scale: 0.95, y: 12, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1, transition: spring }}
      exit="exit"
    >
      <motion.button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? "Show question" : "Show answer"}
        className="preserve-3d relative size-full rounded-3xl text-left"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <Face label="Question" text={card.front} />
        <Face label="Answer" text={card.back} back />

        <motion.span style={{ opacity: knewOpacity }} className="pointer-events-none absolute inset-0 rounded-3xl bg-mint-500/10 ring-2 ring-mint-500">
          <span className="absolute right-5 top-5 rotate-6 rounded-lg border-2 border-mint-500 px-2.5 py-1 text-sm font-bold uppercase text-mint-600">Got it</span>
        </motion.span>
        <motion.span style={{ opacity: missOpacity }} className="pointer-events-none absolute inset-0 rounded-3xl bg-rose-500/10 ring-2 ring-rose-500">
          <span className="absolute left-5 top-5 -rotate-6 rounded-lg border-2 border-rose-500 px-2.5 py-1 text-sm font-bold uppercase text-rose-600">Not yet</span>
        </motion.span>
      </motion.button>
    </motion.div>
  );
}

function Face({ label, text, back }: { label: string; text: string; back?: boolean }) {
  return (
    <span
      className={`backface-hidden absolute inset-0 flex flex-col rounded-3xl border p-6 shadow-lift sm:p-8 ${
        back ? "border-brand-700 bg-brand-600 text-white [transform:rotateY(180deg)]" : "border-line bg-surface"
      }`}
    >
      <span className={`text-xs font-semibold uppercase tracking-wider ${back ? "text-brand-200" : "text-ink-400"}`}>
        {label}
      </span>
      <span className="flex flex-1 items-center justify-center text-center font-display text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl">
        {text}
      </span>
    </span>
  );
}

function ActionButton({
  onClick,
  label,
  hint,
  className,
  children,
}: {
  onClick: () => void;
  label: string;
  hint: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} (${hint})`}
      title={`${label} (${hint})`}
      className={`grid size-14 place-items-center rounded-2xl border border-line bg-surface shadow-card transition active:scale-90 ${className}`}
    >
      {children}
    </button>
  );
}
