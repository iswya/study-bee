import { Bee } from "@/components/bee";

// Shown instantly on navigation while the page's data loads.
function Block({ className }: { className: string }) {
  return <div className={`honey-shimmer animate-pulse rounded-card bg-ink-950/[0.06] ${className}`} />;
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <Bee className="size-7" hover />
        <Block className="h-8 w-48 rounded-xl" />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
        <Block className="h-32" />
        <Block className="h-32" />
        <Block className="h-32" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Block className="h-48" />
        <Block className="h-48" />
        <Block className="h-48" />
      </div>
    </div>
  );
}
