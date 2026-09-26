import { Library } from "./library";

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Library</h1>
      <p className="mt-1 text-sm text-ink-500">Everything you&apos;ve made so far.</p>
      <Library />
    </div>
  );
}
