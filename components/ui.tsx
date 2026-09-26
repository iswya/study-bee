import type { ReactNode } from "react";

type Variant = "primary" | "honey" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-semibold transition-[background-color,box-shadow,transform,color] duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-brand hover:bg-brand-700",
  honey: "bg-honey-400 text-ink-950 shadow-honey hover:bg-honey-300",
  outline: "bg-surface text-ink-900 border border-line hover:border-ink-300 hover:bg-canvas",
  ghost: "text-ink-700 hover:bg-ink-950/5",
};

// Use on <button> or <Link> so both look identical.
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}
