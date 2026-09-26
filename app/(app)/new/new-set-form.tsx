"use client";

import { ClipboardPaste, FileUp, Loader2, Sparkles, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui";
import { accentStyles, type Accent } from "@/lib/demo-data";
import { ease, spring } from "@/lib/motion";

const accents: Accent[] = ["brand", "honey", "mint", "sky", "rose"];
const inputCls =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export function NewSetForm() {
  const [tab, setTab] = useState<"paste" | "upload">("paste");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [accent, setAccent] = useState<Accent>("brand");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  const hasSource = tab === "paste" ? text.trim().length > 0 : file !== null;
  const canSubmit = title.trim().length > 0 && hasSource && status === "idle";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("saving");
    // TODO: save to Supabase (study_sets) and generate cards.
    setTimeout(() => setStatus("done"), 1400);
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="mt-8 rounded-3xl border border-line bg-surface p-8 text-center shadow-card"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-honey-50 text-2xl">🐝</div>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">Looks good!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Saving isn&apos;t hooked up yet — that&apos;s the next thing we build. For now, try one of the
          sample sets.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/sets/french-revolution" className={buttonClass("primary")}>
            Open a sample set
          </Link>
          <button onClick={() => setStatus("idle")} className={buttonClass("outline")}>
            Back to form
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bio Unit 2" className={inputCls} />
        </Field>
        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" className={inputCls} />
        </Field>
      </div>

      <Field label="Color">
        <div className="flex gap-3">
          {accents.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccent(a)}
              aria-label={a}
              aria-pressed={accent === a}
              className="relative grid size-10 place-items-center rounded-full"
            >
              {accent === a && (
                <motion.span layoutId="accent-ring" className="absolute inset-0 rounded-full ring-2 ring-ink-950" transition={spring} />
              )}
              <span className={`size-7 rounded-full ${accentStyles[a].solid}`} />
            </button>
          ))}
        </div>
      </Field>

      <div>
        {/* Segmented control */}
        <div className="inline-flex rounded-xl bg-ink-950/5 p-1">
          {(
            [
              { id: "paste", label: "Paste text", icon: ClipboardPaste },
              { id: "upload", label: "Upload file", icon: FileUp },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                tab === id ? "text-ink-950" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {tab === id && (
                <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-lg bg-surface shadow-card" transition={spring} />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "paste" ? (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease }}
                className="relative"
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your syllabus, notes, or study guide here…"
                  rows={10}
                  className="w-full resize-y rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <span className="pointer-events-none absolute bottom-4 right-4 text-xs tabular-nums text-ink-400">
                  {text.length.toLocaleString()} chars
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.txt,.md,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <FileUp className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-ink-500">{(file.size / 1024).toFixed(0)} KB</span>
                    </span>
                    <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-canvas hover:text-ink-950">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
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
                      setFile(e.dataTransfer.files[0] ?? null);
                    }}
                    animate={{ scale: dragging ? 1.02 : 1 }}
                    transition={spring}
                    className={`flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
                      dragging ? "border-brand-500 bg-brand-50" : "border-ink-300/70 bg-surface hover:border-brand-300"
                    }`}
                  >
                    <motion.span
                      animate={{ y: dragging ? -4 : 0 }}
                      className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600"
                    >
                      <Upload className="size-5" />
                    </motion.span>
                    <span className="text-sm font-semibold">Drop a file or click to browse</span>
                    <span className="text-xs text-ink-500">PDF, Word, or text</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={useAI}
        onClick={() => setUseAI((v) => !v)}
        className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-ink-300"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-honey-50 text-honey-600">
          <Sparkles className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Make flashcards for me</span>
          <span className="text-xs text-ink-500">Uses AI to pull out the key stuff.</span>
        </span>
        <span className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${useAI ? "justify-end bg-brand-600" : "justify-start bg-ink-300"}`}>
          <motion.span layout transition={spring} className="size-5 rounded-full bg-white shadow" />
        </span>
      </button>

      <button type="submit" disabled={!canSubmit} className={buttonClass("primary", "h-12 w-full text-base")}>
        {status === "saving" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Working on it…
          </>
        ) : (
          "Create study set"
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
