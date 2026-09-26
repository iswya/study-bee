import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui";

export default function SetNotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <LogoMark className="mx-auto size-14" />
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Couldn&apos;t find that set</h1>
        <p className="mt-2 text-sm text-ink-500">It may have been deleted, or the link&apos;s off.</p>
        <Link href="/" className={buttonClass("primary", "mt-6")}>
          Back home
        </Link>
      </div>
    </div>
  );
}
