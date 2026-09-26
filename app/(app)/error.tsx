"use client";

import { Bee } from "@/components/bee";
import { buttonClass } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <Bee className="mx-auto size-16 rotate-180" />
        <h1 className="mt-5 font-display text-2xl font-semibold">Something broke</h1>
        <p className="mt-2 break-words text-sm text-ink-500">{error.message}</p>
        <button onClick={reset} className={buttonClass("primary", "mt-6")}>
          Try again
        </button>
      </div>
    </div>
  );
}
