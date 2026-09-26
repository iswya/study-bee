"use client";

import { XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { ProgressBar } from "./motion";
import { iconButtonClass } from "./ui";

// Minimal top bar for focus mode (flashcards / quiz).
export function StudyHeader({ setId, title, done, total }: { setId: string; title: string; done: number; total: number }) {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 pt-5 sm:pt-8">
      <Link
        href={`/sets/${setId}`}
        aria-label="Stop studying"
        className={`${iconButtonClass} size-11 shrink-0 rounded-2xl border border-line bg-surface`}
      >
        <XIcon size={20} weight="bold" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate font-semibold text-ink-700">{title}</span>
          <span className="shrink-0 font-semibold tabular-nums text-ink-500">
            {Math.min(done, total)} / {total}
          </span>
        </div>
        <ProgressBar value={total ? (done / total) * 100 : 0} />
      </div>
    </header>
  );
}
