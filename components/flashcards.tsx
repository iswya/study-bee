"use client";

import { ArrowCounterClockwiseIcon, ArrowLeftIcon, ArrowsClockwiseIcon, CheckIcon, ExamIcon, XIcon } from "@phosphor-icons/react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Card } from "@/lib/types";
import { spring } from "@/lib/motion";
import { useSessionSaver } from "@/lib/use-session-saver";
import { Results } from "./results";
import { StudyHeader } from "./study-header";
import { pressable } from "./ui";

const SWIPE_DISTANCE = 110;

export function Flashcards({ setId, title, cards }: { setId: string; title: string; cards: Card[] }) {
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flips, setFlips] = useState(0); // odd = showing the back
  const [results, setResults] = useState<{ cardId: string; known: boolean }[]>([]);
  const [direction, setDirection] = useState(0); // -1 = not yet, 1 = got it

  const card = queue[index];
  const finished = index >= queue.length;
  const saving = useSessionSaver(setId, "flashcards", finished, results);
  const missed = queue.filter((c) => results.some((r) => r.cardId === c.id && !r.known));
  const flip = useCallback(() => setFlips((f) => f + 1), []);

  const answer = useCallback(
    (knewIt: boolean) => {
      if (!card) return;
      setDirection(knewIt ? 1 : -1);
      setResults((r) => [...r, { cardId: card.id, known: knewIt }]);
      setFlips(0);
      setIndex((i) => i + 1);
    },
    [card]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished || e.repeat) return;
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") answer(true);
      else if (e.key === "ArrowLeft") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, flip, finished]);

  function restart(next: Card[]) {
    setQueue(next);
    setResults([]);
    setIndex(0);
    setFlips(0);
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
            saving={saving}
            actions={[
              missed.length > 0
                ? { label: `Redo ${missed.length} missed`, icon: <ArrowCounterClockwiseIcon size={18} weight="bold" />, onClick: () => restart(missed), primary: true }
                : { label: "Go again", icon: <ArrowCounterClockwiseIcon size={18} weight="bold" />, onClick: () => restart(cards), primary: true },
              { label: "Quiz", icon: <ExamIcon size={18} weight="duotone" />, href: `/sets/${setId}/quiz` },
              { label: "Back to set", icon: <ArrowLeftIcon size={18} weight="bold" />, href: `/sets/${setId}` },
            ]}
          />
        ) : (
          <>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg sm:aspect-[3/2]">
              {/* Peek of the next cards in the deck */}
              {[2, 1].map((depth) =>
                queue[index + depth] ? (
                  <motion.div
                    key={queue[index + depth].id}
                    className="absolute inset-0 rounded-[2rem] border border-line bg-surface shadow-card"
                    animate={{ y: depth * 12, scale: 1 - depth * 0.05, opacity: 1 - depth * 0.3 }}
                    transition={spring}
                  />
                ) : null
              )}
              <AnimatePresence custom={direction} initial={false}>
                <SwipeCard key={card.id} card={card} flips={flips} onFlip={flip} onSwipe={answer} />
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <ActionButton onClick={() => answer(false)} label="Not yet" hint="←" className="text-rose-600 hover:border-rose-500/50 hover:bg-rose-50 hover:ring-4 hover:ring-rose-500/15">
                <XIcon size={22} weight="bold" />
              </ActionButton>
              <button
                onClick={flip}
                className={`group flex h-14 items-center gap-2 rounded-2xl bg-ink-950 px-6 text-sm font-semibold text-canvas hover:-translate-y-0.5 hover:ring-4 hover:ring-ink-950/15 ${pressable}`}
              >
                <ArrowsClockwiseIcon size={18} weight="bold" className="transition-transform duration-500 group-hover:rotate-180" /> Flip
                <kbd className="ml-1 rounded-md bg-canvas/15 px-1.5 py-0.5 font-sans text-[10px]">space</kbd>
              </button>
              <ActionButton onClick={() => answer(true)} label="Got it" hint="→" className="text-mint-600 hover:border-mint-500/50 hover:bg-mint-50 hover:ring-4 hover:ring-mint-500/15">
                <CheckIcon size={22} weight="bold" />
              </ActionButton>
            </div>
            <p className="mt-5 text-center text-xs text-ink-400">Swipe right if you knew it, left if not</p>
          </>
        )}
      </div>
    </div>
  );
}

function SwipeCard({ card, flips, onFlip, onSwipe }: { card: Card; flips: number; onFlip: () => void; onSwipe: (knewIt: boolean) => void }) {
  const flipped = flips % 2 === 1;

  // Swipe
  const x = useMotionValue(0);
  const swipeRotate = useTransform(x, [-240, 240], [-14, 14]);
  const knewOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1]);
  const missOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0]);
  const [dragging, setDragging] = useState(false);

  // Flip: keeps turning the same way; a springy settle with a little wobble.
  const rotateY = useSpring(0, { stiffness: 150, damping: 17, mass: 1 });
  const lift = useMotionValue(0); // 0 → 1 → 0 during each flip
  const sweep = useMotionValue(0); // shine position during each flip
  const scale = useTransform(lift, [0, 1], [1, 1.07]);
  const liftY = useTransform(lift, [0, 1], [0, -22]);
  const shadowScale = useTransform(lift, [0, 1], [1, 0.8]);
  const shadowOpacity = useTransform(lift, [0, 1], [0.55, 0.25]);
  const sheen = useMotionTemplate`linear-gradient(105deg, transparent ${useTransform(sweep, (s) => s * 140 - 40)}%, rgb(255 255 255 / 0.28) ${useTransform(sweep, (s) => s * 140 - 20)}%, transparent ${useTransform(sweep, (s) => s * 140)}%)`;

  useEffect(() => {
    rotateY.set(flips * 180);
    if (flips === 0) return;
    const a = animate(lift, [0, 1, 0], { duration: 0.6, ease: "easeInOut" });
    const b = animate(sweep, [0, 1], { duration: 0.55, ease: "easeOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [flips, rotateY, lift, sweep]);

  // Hover tilt + glare that follows the mouse
  const tiltX = useSpring(0, { stiffness: 220, damping: 22 });
  const tiltY = useSpring(0, { stiffness: 220, damping: 22 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.16), transparent 55%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || dragging) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltX.set(-py * 10);
    tiltY.set(px * 12);
    glareX.set((px + 0.5) * 100);
    glareY.set((py + 0.5) * 100);
  }
  function resetTilt() {
    tiltX.set(0);
    tiltY.set(0);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > 700) onSwipe(true);
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -700) onSwipe(false);
  }

  return (
    <motion.div
      className="absolute inset-0 z-10 cursor-grab touch-pan-y [perspective:1100px] active:cursor-grabbing"
      style={{ x, rotate: swipeRotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => {
        setDragging(true);
        resetTilt();
      }}
      onDragEnd={onDragEnd}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      variants={{
        exit: (dir: number) => ({
          x: dir * 560,
          y: dir === 0 ? 0 : -50,
          rotate: dir * 22,
          opacity: 0,
          transition: { duration: 0.38, ease: [0.4, 0, 1, 1] },
        }),
      }}
      initial={{ scale: 0.95, y: 12, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1, transition: spring }}
      exit="exit"
    >
      {/* Ground shadow that shrinks as the card lifts */}
      <motion.div
        aria-hidden
        className="absolute inset-x-8 -bottom-5 h-10 rounded-[50%] bg-black blur-2xl"
        style={{ scaleX: shadowScale, opacity: shadowOpacity }}
      />

      <motion.div className="relative size-full [transform-style:preserve-3d]" style={{ rotateX: tiltX, rotateY: tiltY, scale, y: liftY }}>
        <motion.button
          type="button"
          onClick={onFlip}
          aria-label={flipped ? "Show front" : "Show back"}
          className="relative size-full rounded-[2rem] text-left outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-honey-400/45"
          style={{ rotateY }}
        >
          <Face label="Front" text={card.front} glare={glare} sheen={sheen} />
          <Face label="Back" text={card.back} glare={glare} sheen={sheen} back visible={flipped} />
        </motion.button>

        {/* Swipe stamps float above whichever side is showing */}
        <motion.span style={{ opacity: knewOpacity }} className="pointer-events-none absolute inset-0 rounded-[2rem] bg-mint-500/15 ring-2 ring-mint-500 [transform:translateZ(2px)]">
          <span className="absolute right-5 top-5 rotate-6 rounded-xl border-2 border-mint-500 bg-surface/80 px-2.5 py-1 font-display text-sm font-semibold uppercase text-mint-600">Got it</span>
        </motion.span>
        <motion.span style={{ opacity: missOpacity }} className="pointer-events-none absolute inset-0 rounded-[2rem] bg-rose-500/15 ring-2 ring-rose-500 [transform:translateZ(2px)]">
          <span className="absolute left-5 top-5 -rotate-6 rounded-xl border-2 border-rose-500 bg-surface/80 px-2.5 py-1 font-display text-sm font-semibold uppercase text-rose-600">Not yet</span>
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function Face({
  label,
  text,
  back,
  visible = true,
  glare,
  sheen,
}: {
  label: string;
  text: string;
  back?: boolean;
  visible?: boolean;
  glare: ReturnType<typeof useMotionTemplate>;
  sheen: ReturnType<typeof useMotionTemplate>;
}) {
  return (
    <span
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border p-6 shadow-lift [backface-visibility:hidden] sm:p-8 ${
        back ? "border-honey-500 bg-honey-400 text-honey-ink [transform:rotateY(180deg)]" : "border-line bg-surface"
      }`}
    >
      {back && <span className="honeycomb pointer-events-none absolute inset-0" />}
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: sheen }} />

      <span className={`relative flex items-center justify-between text-xs font-bold uppercase tracking-wider ${back ? "opacity-60" : "text-ink-400"}`}>
        {label}
        {!back && (
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <ArrowsClockwiseIcon size={14} weight="bold" /> tap to flip
          </span>
        )}
      </span>
      <motion.span
        className="relative flex flex-1 items-center justify-center text-balance text-center font-display text-2xl font-semibold leading-snug sm:text-[28px]"
        initial={false}
        animate={back ? { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.92, filter: visible ? "blur(0px)" : "blur(4px)" } : undefined}
        transition={{ duration: 0.3, delay: visible ? 0.18 : 0 }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function ActionButton({ onClick, label, hint, className, children }: { onClick: () => void; label: string; hint: string; className: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} (${hint})`}
      title={`${label} (${hint})`}
      className={`grid size-14 place-items-center rounded-2xl border border-line bg-surface shadow-card hover:-translate-y-0.5 ${pressable} ${className}`}
    >
      {children}
    </button>
  );
}
