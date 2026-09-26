"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "./motion";

// Minimal top bar for focus mode (flashcards / quiz).
export function StudyHeader({
  setId,
  title,
  done,
  total,
}: {
  setId: string;
  title: string;
  done: number;
  total: number;
}) {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 pt-5 sm:pt-8">
      <Link
        href={`/sets/${setId}`}
        aria-label="Stop studying"
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink-500 transition hover:text-ink-950 active:scale-90"
      >
        <X className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate font-medium text-ink-700">{title}</span>
          <span className="shrink-0 tabular-nums text-ink-500">
            {Math.min(done, total)} / {total}
          </span>
        </div>
        <ProgressBar value={total ? (done / total) * 100 : 0} />
      </div>
    </header>
  );
}
