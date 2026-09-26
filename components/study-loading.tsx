import { Bee } from "./bee";

export function StudyLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4" aria-busy="true" aria-label="Loading">
      <div className="honey-shimmer aspect-[3/2] w-full max-w-lg animate-pulse rounded-[2rem] bg-ink-950/[0.06]" />
      <Bee className="size-8" hover />
    </div>
  );
}
