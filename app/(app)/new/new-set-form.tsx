"use client";

import { ClipboardTextIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, useTransition } from "react";
import { Bee } from "@/components/bee";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { createSet } from "@/lib/actions";
import { parseCards } from "@/lib/parse-cards";
import { accents, accentStyles, type Accent } from "@/lib/types";
import { ease, spring } from "@/lib/motion";

const example = `Mitochondria - makes energy (ATP) for the cell
Ribosome - builds proteins
Nucleus: holds the DNA`;

export function NewSetForm() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [accent, setAccent] = useState<Accent>("honey");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const cards = useMemo(() => parseCards(text), [text]);

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(txt|md|csv|tsv)$/i.test(file.name)) {
      setError("Only .txt, .md, .csv, or .tsv files for now — for PDFs, copy the text and paste it.");
      return;
    }
    let content = await file.text();
    // CSV: treat the first comma on each line as the term/definition split.
    if (/\.csv$/i.test(file.name)) content = content.replace(/^([^,\n]+),/gm, "$1\t");
    setText(content);
    setFileName(file.name);
    setError(null);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSet({ title, subject, accent, sourceText: text, cards });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bio unit 2" className={inputClass} required />
        </Field>
        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology" className={inputClass} />
        </Field>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">Color</span>
          <div className="flex h-12 items-center gap-1">
            {accents.map((a) => (
              <button key={a} type="button" onClick={() => setAccent(a)} aria-label={a} aria-pressed={accent === a} className="relative grid size-10 place-items-center">
                {accent === a && <motion.span layoutId="accent-ring" className="absolute inset-0.5 rounded-xl ring-2 ring-ink-950" transition={spring} />}
                <span className={`size-6 rotate-45 rounded-lg ${accentStyles[a].solid}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-end justify-between gap-4">
          <span className="text-sm font-semibold text-ink-700">Cards</span>
          <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold text-honey-600 hover:text-honey-700">
            <UploadSimpleIcon size={16} weight="bold" /> Upload file
          </button>
          <input ref={fileInput} type="file" accept=".txt,.md,.csv,.tsv" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />
        </div>

        <motion.div
          animate={{ scale: dragging ? 1.01 : 1 }}
          transition={spring}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            loadFile(e.dataTransfer.files[0]);
          }}
          className={`relative rounded-card border-2 transition-colors ${dragging ? "border-dashed border-honey-400 bg-honey-50" : "border-transparent"}`}
        >
          {fileName && (
            <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-honey-50 py-1 pl-3 pr-1 text-xs font-semibold text-honey-600">
              {fileName}
              <button type="button" aria-label="Clear" onClick={() => { setFileName(null); setText(""); }} className="grid size-5 place-items-center rounded-full hover:bg-honey-100">
                <XIcon size={12} weight="bold" />
              </button>
            </span>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`One card per line, or drop a file here:\n\n${example}`}
            rows={10}
            className="block w-full resize-y rounded-card border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed outline-none transition placeholder:font-sans placeholder:text-ink-400 focus:border-honey-400 focus:ring-4 focus:ring-honey-400/15"
          />
        </motion.div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
          <ClipboardTextIcon size={14} weight="duotone" />
          Split term and definition with a dash, colon, tab, or =. You can also add cards later.
        </p>
      </div>

      {/* Live preview of what we'll create */}
      <AnimatePresence>
        {cards.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <p className="mb-2 text-sm font-semibold text-ink-700">
              Preview · <span className="text-honey-600">{cards.length} cards</span>
            </p>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {cards.slice(0, 12).map((c, i) => (
                <motion.div
                  key={`${i}-${c.front}`}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...spring, delay: Math.min(i, 6) * 0.03 }}
                  className={`${cardClass} w-48 shrink-0 snap-start p-4`}
                >
                  <p className="line-clamp-2 text-sm font-semibold">{c.front}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-ink-500">{c.back}</p>
                </motion.div>
              ))}
              {cards.length > 12 && <div className="grid w-24 shrink-0 place-items-center text-sm font-semibold text-ink-400">+{cards.length - 12}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

      <button type="submit" disabled={pending || !title.trim()} className={buttonClass("primary", "h-12 w-full text-base")}>
        {pending ? (
          <>
            <Bee className="size-6" hover /> Saving…
          </>
        ) : cards.length ? (
          `Create set with ${cards.length} cards`
        ) : (
          "Create empty set"
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span>
      {children}
    </label>
  );
}
