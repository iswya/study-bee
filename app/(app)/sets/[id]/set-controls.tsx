"use client";

import { CheckCircleIcon, PlusIcon, SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useRef, useState, useTransition } from "react";
import { cardClass, buttonClass, inputClass } from "@/components/ui";
import { addCard, deleteCard, deleteSet } from "@/lib/actions";
import type { Card } from "@/lib/types";
import { spring } from "@/lib/motion";

export function CardManager({ setId, cards }: { setId: string; cards: Card[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(async (_: unknown, form: FormData) => {
    const result = await addCard(setId, String(form.get("front")), String(form.get("back")));
    if (!result?.error) {
      formRef.current?.reset();
      frontRef.current?.focus();
    }
    return result;
  }, undefined);

  return (
    <div className="space-y-3">
      <form ref={formRef} action={action} className={`${cardClass} grid gap-2 p-3 sm:grid-cols-[1fr_1fr_auto]`}>
        <input ref={frontRef} name="front" placeholder="Term / question" className={inputClass} required />
        <input name="back" placeholder="Definition / answer" className={inputClass} required />
        <button disabled={pending} className={buttonClass("primary", "h-12")}>
          {pending ? <SpinnerGapIcon size={18} weight="bold" className="animate-spin" /> : <PlusIcon size={18} weight="bold" />}
          Add
        </button>
        {state?.error && <p className="text-sm text-rose-600 sm:col-span-3">{state.error}</p>}
      </form>

      {cards.length > 0 && (
        <ul className={`${cardClass} divide-y divide-line overflow-hidden`}>
          <AnimatePresence initial={false}>
            {cards.map((card, i) => (
              <CardRow key={card.id} setId={setId} card={card} index={i} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function CardRow({ setId, card, index }: { setId: string; card: Card; index: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: pending ? 0.4 : 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring}
      className="group"
    >
      <div className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 p-4 sm:grid-cols-[2rem_1fr_1fr_auto]">
        <span className="pt-0.5 text-xs font-bold tabular-nums text-ink-400">
          {card.known ? <CheckCircleIcon size={18} weight="fill" className="text-mint-500" aria-label="Known" /> : index + 1}
        </span>
        <p className="font-semibold">{card.front}</p>
        <p className="col-start-2 text-ink-500 sm:col-start-auto">{card.back}</p>
        <button
          onClick={() => startTransition(() => deleteCard(setId, card.id))}
          aria-label="Delete card"
          className="col-start-3 row-start-1 grid size-8 place-items-center rounded-lg text-ink-400 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 sm:col-start-4 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          <TrashIcon size={16} weight="duotone" />
        </button>
      </div>
    </motion.li>
  );
}

export function DeleteSetButton({ setId }: { setId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {confirming && (
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onClick={() => setConfirming(false)}
            className={buttonClass("ghost", "h-9")}
          >
            Cancel
          </motion.button>
        )}
      </AnimatePresence>
      <button
        onClick={() => (confirming ? startTransition(() => deleteSet(setId)) : setConfirming(true))}
        disabled={pending}
        className={buttonClass("danger", `h-9 ${confirming ? "bg-rose-50" : ""}`)}
      >
        <TrashIcon size={16} weight="duotone" />
        {confirming ? "Delete for real" : "Delete set"}
      </button>
    </div>
  );
}
