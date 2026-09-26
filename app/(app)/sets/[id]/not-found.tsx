import Link from "next/link";
import { Bee } from "@/components/bee";
import { buttonClass } from "@/components/ui";

export default function SetNotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <Bee className="mx-auto size-16" hover />
        <h1 className="mt-5 font-display text-2xl font-semibold">Set not found</h1>
        <p className="mt-2 text-sm text-ink-500">It was deleted, or the link is wrong.</p>
        <Link href="/" className={buttonClass("primary", "mt-6")}>
          Home
        </Link>
      </div>
    </div>
  );
}
