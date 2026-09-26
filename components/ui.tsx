import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 h-11 text-sm font-semibold transition-[background-color,box-shadow,transform,color,border-color] duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-honey-400 text-honey-ink shadow-honey hover:bg-honey-300",
  outline: "bg-surface text-ink-950 border border-line hover:border-ink-300",
  ghost: "text-ink-700 hover:bg-ink-950/5 hover:text-ink-950",
  danger: "text-rose-600 hover:bg-rose-50",
};

// Use on <button> or <Link> so both look identical.
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export const cardClass = "rounded-card border border-line bg-surface shadow-card";

export const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-ink-400 focus:border-honey-400 focus:ring-4 focus:ring-honey-400/15";

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{children}</h1>
      {action}
    </div>
  );
}
