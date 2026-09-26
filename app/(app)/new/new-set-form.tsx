"use client";

import {
  ArrowCounterClockwiseIcon,
  CardsThreeIcon,
  FilePdfIcon,
  FileDocIcon,
  FileTextIcon,
  ImageIcon,
  PaletteIcon,
  SparkleIcon,
  TagIcon,
  TextTIcon,
  TrayArrowUpIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, useTransition } from "react";
import { Bee } from "@/components/bee";
import { BeeLoader } from "@/components/bee-loader";
import { buttonClass, cardClass, inputClass } from "@/components/ui";
import { createSet } from "@/lib/actions";
import { parseCards } from "@/lib/parse-cards";
import { ACCEPTED_FILES, fileKind, prepareFile, readDocx } from "@/lib/prepare-file";
import { accents, accentStyles, type Accent } from "@/lib/types";
import { ease, spring } from "@/lib/motion";

type Draft = { front: string; back: string };
type Upload = { id: string; file: File };

const kindIcon: Record<string, Icon> = { pdf: FilePdfIcon, image: ImageIcon, doc: FileDocIcon, text: FileTextIcon, other: FileTextIcon };
const counts = ["auto", "10", "25", "50"] as const;

export function NewSetForm() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [accent, setAccent] = useState<Accent>("honey");
  const [text, setText] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [readFiles, setReadFiles] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const [count, setCount] = useState<(typeof counts)[number]>("auto");
  const [focus, setFocus] = useState("");
  const [aiCards, setAiCards] = useState<Draft[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseCards(text), [text]);
  const cards = aiCards ?? parsed;
  const hasMaterial = uploads.length > 0 || text.trim().length > 0;

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    for (const raw of Array.from(list)) {
      const kind = fileKind(raw);
      if (kind === "old-doc") {
        setError(`${raw.name} is an old Word file. Open it in Word and use Save As → .docx, then upload that.`);
        continue;
      }
      if (kind === "other") {
        setError(`Can't use ${raw.name}. Try PDF, Word (.docx), images, or text files.`);
        continue;
      }
      if (kind === "text" || kind === "doc") {
        // Text and Word files go straight into the box so their lines can
        // become cards (and the AI can use them too).
        let content: string;
        try {
          content = kind === "doc" ? await readDocx(raw) : await raw.text();
        } catch {
          setError(`Couldn't read ${raw.name}. Is it a real Word file?`);
          continue;
        }
        if (!content.trim()) {
          setError(`${raw.name} doesn't have any text in it.`);
          continue;
        }
        if (raw.name.toLowerCase().endsWith(".csv")) content = content.replace(/^([^,\n]+),/gm, "$1\t");
        setText((t) => (t ? `${t}\n${content}` : content));
        setReadFiles((f) => [...f, raw.name]);
      } else {
        const file = await prepareFile(raw);
        setUploads((u) => [...u, { id: crypto.randomUUID(), file }]);
      }
      if (!title) setTitle(raw.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function generate() {
    setAiError(null);
    setAiLoading(true);
    try {
      const body = new FormData();
      uploads.forEach((u) => body.append("files", u.file));
      body.append("notes", text);
      body.append("focus", focus);
      body.append("count", count);
      const res = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
      if (!res.ok) throw new Error(data.error);
      setAiCards(data.cards);
      if (!subject && data.subject) setSubject(data.subject);
      if ((!title || uploads.some((u) => u.file.name.startsWith(title))) && data.title) setTitle(data.title);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const result = await createSet({ title, subject, accent, sourceText: text, cards });
      if (result?.error) setError(result.error);
    });
  }

  const totalMB = uploads.reduce((n, u) => n + u.file.size, 0) / 1024 / 1024;

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {/* Details */}
      <section className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <Field label="Title" icon={TextTIcon}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bio unit 2" className={inputClass} required />
        </Field>
        <Field label="Subject" icon={TagIcon}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Label icon={PaletteIcon}>Color</Label>
          <div className="flex gap-1">
            {accents.map((a) => (
              <button key={a} type="button" onClick={() => setAccent(a)} aria-label={a} aria-pressed={accent === a} className="relative grid size-11 place-items-center rounded-xl">
                {accent === a && <motion.span layoutId="accent-ring" className="absolute inset-0.5 rounded-xl ring-2 ring-ink-950" transition={spring} />}
                <motion.span whileHover={{ rotate: 90 }} whileTap={{ scale: 0.8 }} className={`size-6 rotate-45 rounded-lg ${accentStyles[a].solid}`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Material */}
      <section className={`${cardClass} p-5`}>
        <Label icon={TrayArrowUpIcon}>Material</Label>
        <motion.button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          animate={{ scale: dragging ? 1.015 : 1 }}
          whileTap={{ scale: 0.99 }}
          transition={spring}
          className={`group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-5 text-left transition-colors ${
            dragging ? "border-honey-400 bg-honey-50" : "border-line hover:border-honey-400/60 hover:bg-honey-50/50"
          }`}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-honey-50 text-honey-600 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6">
            <TrayArrowUpIcon size={24} weight="duotone" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Drop files or click to upload</span>
            <span className="block text-xs text-ink-500">Syllabus PDF, slides, Word docs, photos of notes, text files</span>
          </span>
        </motion.button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPTED_FILES}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <AnimatePresence initial={false}>
          {uploads.length > 0 && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex flex-wrap gap-2 overflow-hidden">
              <AnimatePresence>
                {uploads.map(({ id, file }) => {
                  const KindIcon = kindIcon[fileKind(file)];
                  return (
                    <motion.li
                      key={id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={spring}
                      className="flex items-center gap-2 rounded-xl border border-line bg-raised py-1.5 pl-2.5 pr-1 text-sm"
                    >
                      <KindIcon size={18} weight="duotone" className="text-honey-600" />
                      <span className="max-w-48 truncate font-medium">{file.name}</span>
                      <span className="text-xs text-ink-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setUploads((u) => u.filter((x) => x.id !== id))} className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                        <XIcon size={14} weight="bold" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
        {totalMB > 4 && <p className="mt-2 text-xs font-medium text-rose-600">That&apos;s {totalMB.toFixed(1)} MB — the limit is 4 MB. Remove something or use fewer pages.</p>}

        <AnimatePresence initial={false}>
          {readFiles.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-mint-600"
            >
              <FileTextIcon size={14} weight="fill" />
              Added text from {readFiles.join(", ")}
              <button
                type="button"
                onClick={() => {
                  setReadFiles([]);
                  setText("");
                }}
                className="font-semibold text-ink-500 underline-offset-2 hover:text-ink-950 hover:underline"
              >
                Clear
              </button>
            </motion.p>
          )}
        </AnimatePresence>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste notes here, or cards as one per line:\n\nMitochondria - makes energy for the cell\nRibosome: builds proteins"}
          rows={7}
          className="mt-3 block w-full resize-y rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none transition placeholder:text-ink-400 focus:border-honey-400 focus:ring-4 focus:ring-honey-400/15"
        />
        {parsed.length > 0 && !aiCards && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-mint-600">
            <CardsThreeIcon size={14} weight="fill" /> Found {parsed.length} cards in your text
          </p>
        )}
      </section>

      {/* AI */}
      <section className={`${cardClass} relative overflow-hidden p-5`}>
        <div className="flex items-center justify-between gap-3">
          <Label icon={SparkleIcon} className="mb-0">Make cards with AI</Label>
          {aiCards && (
            <button type="button" onClick={() => setAiCards(null)} className="flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-950">
              <ArrowCounterClockwiseIcon size={14} weight="bold" /> Undo
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {aiLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BeeLoader />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div className="flex rounded-xl bg-ink-950/5 p-1" role="radiogroup" aria-label="How many cards">
                {counts.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={count === c} onClick={() => setCount(c)} className={`relative h-9 rounded-lg px-3 text-xs font-semibold transition-colors ${count === c ? "text-honey-ink" : "text-ink-500 hover:text-ink-950"}`}>
                    {count === c && <motion.span layoutId="count-pill" className="absolute inset-0 rounded-lg bg-honey-400" transition={spring} />}
                    <span className="relative">{c === "auto" ? "Auto" : c}</span>
                  </button>
                ))}
              </div>
              <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Focus on… (optional)" className={`${inputClass} h-11`} />
              <button type="button" onClick={generate} disabled={!hasMaterial || totalMB > 4} className={buttonClass("primary", "h-11")}>
                <SparkleIcon size={18} weight="fill" /> {aiCards ? "Regenerate" : "Generate"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {aiError && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{aiError}</p>}
      </section>

      {/* Preview */}
      <AnimatePresence>
        {cards.length > 0 && (
          <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-700">
              <CardsThreeIcon size={18} weight="duotone" className="text-honey-600" />
              {cards.length} cards {aiCards ? "from AI" : "from your text"}
            </p>
            <ul className={`${cardClass} max-h-96 divide-y divide-line overflow-y-auto`}>
              {cards.map((c, i) => (
                <motion.li
                  key={`${i}-${c.front}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 15) * 0.02 }}
                  className="group grid grid-cols-[1fr_auto] gap-x-3 px-4 py-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <p className="text-sm font-semibold">{c.front}</p>
                  <p className="col-start-1 text-sm text-ink-500 sm:col-start-auto">{c.back}</p>
                  {aiCards && (
                    <button type="button" aria-label="Remove card" onClick={() => setAiCards(aiCards.filter((_, j) => j !== i))} className="col-start-2 row-start-1 grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600 sm:col-start-3">
                      <XIcon size={14} weight="bold" />
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

      <button type="submit" disabled={saving || aiLoading || !title.trim()} className={buttonClass("primary", "h-12 w-full text-base")}>
        {saving ? (
          <>
            <Bee className="size-6" hover /> Saving…
          </>
        ) : (
          <>
            <CardsThreeIcon size={20} weight="fill" />
            {cards.length ? `Create set with ${cards.length} cards` : "Create empty set"}
          </>
        )}
      </button>
    </form>
  );
}

function Label({ icon: LabelIcon, children, className = "mb-2" }: { icon: Icon; children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-sm font-semibold text-ink-700 ${className}`}>
      <LabelIcon size={16} weight="duotone" className="text-honey-600" />
      {children}
    </span>
  );
}

function Field({ label, icon, children }: { label: string; icon: Icon; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label icon={icon}>{label}</Label>
      {children}
    </label>
  );
}
