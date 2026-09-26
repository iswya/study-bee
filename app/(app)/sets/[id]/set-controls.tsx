"use client";

import { CaretDownIcon, CheckCircleIcon, CheckIcon, CopyIcon, PlusIcon, SparkleIcon, SpinnerGapIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useRef, useState, useTransition } from "react";
import { buttonClass, cardClass, inputClass, pressable } from "@/components/ui";
import { addCard, deleteCard, deleteSet, replaceCards } from "@/lib/actions";
import { AskAi, ChangeSummary, diffCards, StatusBadge, type Draft } from "@/components/ask-ai";
import { copySet } from "@/lib/social-actions";
import type { Card } from "@/lib/types";
import { spring } from "@/lib/motion";

export function CardManager({ setId, cards, readOnly = false }: { setId: string; cards: Card[]; readOnly?: boolean }) {
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
      {!readOnly && (
        <form ref={formRef} action={action} className={`${cardClass} grid gap-2 p-3 sm:grid-cols-[1fr_1fr_auto]`}>
          <input ref={frontRef} name="front" placeholder="Term / question" className={inputClass} required />
          <input name="back" placeholder="Definition / answer" className={inputClass} required />
          <button disabled={pending} className={buttonClass("primary", "h-12")}>
            {pending ? <SpinnerGapIcon size={18} weight="bold" className="animate-spin" /> : <PlusIcon size={18} weight="bold" />}
            Add
          </button>
          {state?.error && <p className="text-sm text-rose-600 sm:col-span-3">{state.error}</p>}
        </form>
      )}

      {cards.length > 0 && (
        <ul className={`${cardClass} divide-y divide-line overflow-hidden`}>
          <AnimatePresence initial={false}>
            {cards.map((card, i) => (
              <CardRow key={card.id} setId={setId} card={card} index={i} readOnly={readOnly} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function CardRow({ setId, card, index, readOnly }: { setId: string; card: Card; index: number; readOnly: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: pending ? 0.4 : 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring}
      className="group transition-colors hover:bg-ink-950/[0.02]"
    >
      <div className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 p-4 sm:grid-cols-[2rem_1fr_1fr_auto]">
        <span className="pt-0.5 text-xs font-bold tabular-nums text-ink-400">
          {card.known ? <CheckCircleIcon size={18} weight="fill" className="text-mint-500" aria-label="Known" /> : index + 1}
        </span>
        <p className="font-semibold">{card.front}</p>
        <p className="col-start-2 text-ink-500 sm:col-start-auto">{card.back}</p>
        {!readOnly && (
          <button
            onClick={() => startTransition(() => deleteCard(setId, card.id))}
            aria-label="Delete card"
            className={`col-start-3 row-start-1 grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 sm:col-start-4 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 ${pressable}`}
          >
            <TrashIcon size={16} weight="duotone" />
          </button>
        )}
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

export function CopySetButton({ setId }: { setId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-rose-600">{error}</span>}
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await copySet(setId);
            if (result?.error) setError(result.error);
          })
        }
        disabled={pending}
        className={buttonClass("primary", "h-10")}
      >
        {pending ? <SpinnerGapIcon size={16} weight="bold" className="animate-spin" /> : <CopyIcon size={16} weight="bold" />}
        Copy to my library
      </button>
    </div>
  );
}

// "Edit with AI": describe a change, review what the AI proposes, then apply.
export function AiEditPanel({ setId, cards, title, subject }: { setId: string; cards: Card[]; title: string; subject: string }) {
  const [open, setOpen] = useState(false);
  const [proposal, setProposal] = useState<{ cards: Draft[]; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, startApplying] = useTransition();
  const current = cards.map(({ front, back }) => ({ front, back }));
  const diff = proposal ? diffCards(current, proposal.cards) : null;

  function apply() {
    if (!proposal) return;
    setError(null);
    startApplying(async () => {
      const result = await replaceCards(setId, proposal.cards);
      if (result?.error) setError(result.error);
      else {
        setProposal(null);
        setOpen(false);
      }
    });
  }

  return (
    <div className={`${cardClass} mb-3 overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-ink-950/[0.02]"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-honey-50 text-honey-600">
          <SparkleIcon size={18} weight="fill" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Edit with AI</span>
          <span className="block text-xs text-ink-500">Shorten answers, add cards, fix mistakes…</span>
        </span>
        <CaretDownIcon size={18} weight="bold" className={`text-ink-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line p-4">
            {proposal && diff ? (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="space-y-3">
                <ChangeSummary summary={proposal.summary} added={diff.added} edited={diff.edited} removed={diff.removed} />
                <ul className="max-h-80 divide-y divide-line overflow-y-auto rounded-2xl border border-line">
                  {proposal.cards.map((c, i) => (
                    <li key={i} className={`grid gap-1 px-3 py-2.5 text-sm sm:grid-cols-2 sm:gap-3 ${diff.statuses[i] === "same" ? "opacity-60" : ""}`}>
                      <span className="flex items-start gap-2 font-semibold">
                        <StatusBadge status={diff.statuses[i]} />
                        {c.front}
                      </span>
                      <span className="text-ink-500">{c.back}</span>
                    </li>
                  ))}
                </ul>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setProposal(null)} disabled={applying} className={buttonClass("outline", "flex-1")}>
                    <XIcon size={16} weight="bold" /> Discard
                  </button>
                  <button type="button" onClick={apply} disabled={applying} className={buttonClass("primary", "flex-1")}>
                    {applying ? <SpinnerGapIcon size={16} weight="bold" className="animate-spin" /> : <CheckIcon size={16} weight="bold" />}
                    Apply
                  </button>
                </div>
              </motion.div>
            ) : (
              open && <AskAi cards={current} title={title} subject={subject} onResult={(next, summary) => setProposal({ cards: next, summary })} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
