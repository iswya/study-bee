import { NewSetForm } from "./new-set-form";

export default function NewSetPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">New study set</h1>
      <p className="mt-1 text-sm text-ink-500">
        Drop in a syllabus, notes, or a study guide — whatever you&apos;ve got.
      </p>
      <NewSetForm />
    </div>
  );
}
