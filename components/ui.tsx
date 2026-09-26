import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

// Springy press: squish fast on click, bounce back on release.
export const pressable =
  "transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-[0.94] active:duration-75 disabled:opacity-50 disabled:pointer-events-none";

// Soft honey halo on hover / keyboard focus.
export const glow =
  "hover:ring-4 hover:ring-honey-400/20 focus-visible:ring-4 focus-visible:ring-honey-400/45 focus-visible:outline-none";

const base = `inline-flex items-center justify-center gap-2 rounded-2xl px-4 h-11 text-sm font-semibold select-none ${pressable}`;

const variants: Record<Variant, string> = {
  primary: `bg-honey-400 text-honey-ink shadow-honey hover:bg-honey-300 hover:-translate-y-0.5 ${glow}`,
  outline: `bg-surface text-ink-950 border border-line hover:border-honey-400 hover:text-honey-600 ${glow}`,
  ghost: "text-ink-700 hover:bg-ink-950/5 hover:text-ink-950",
  danger: "text-rose-600 hover:bg-rose-50 hover:ring-4 hover:ring-rose-500/15",
};

// Use on <button> or <Link> so both look identical.
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

// Square icon-only buttons (close, theme, sign out…).
export const iconButtonClass = `grid size-10 place-items-center rounded-xl text-ink-500 hover:bg-ink-950/5 hover:text-ink-950 ${pressable}`;

export const cardClass = "rounded-card border border-line bg-surface shadow-card";

// Card-shaped links: lift + honey edge on hover.
export const cardLinkClass = `${cardClass} ${pressable} hover:-translate-y-1 hover:border-honey-400/70 hover:shadow-lift ${glow} active:translate-y-0`;

export const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-honey-400 focus:ring-4 focus:ring-honey-400/15";

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, icon, action }: { children: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        {icon && <span className="text-honey-600">{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  );
}

export function PageTitle({ children, icon, action }: { children: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="flex items-center gap-3 font-display text-3xl font-semibold sm:text-4xl">
        {icon && <span className="grid size-11 place-items-center rounded-2xl bg-honey-50 text-honey-600">{icon}</span>}
        {children}
      </h1>
      {action}
    </div>
  );
}
