import Link from "next/link";

// Hexagon mark with bee stripes.
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="sb-hex" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-honey-300)" />
          <stop offset="1" stopColor="var(--color-honey-500)" />
        </linearGradient>
        <clipPath id="sb-clip">
          <path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5z" />
        </clipPath>
      </defs>
      <path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5z" fill="url(#sb-hex)" />
      <g clipPath="url(#sb-clip)" fill="var(--color-ink-950)">
        <rect x="0" y="15" width="40" height="3.6" rx="1" />
        <rect x="0" y="22.5" width="40" height="3.6" rx="1" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-xl">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">Study Bee</span>
    </Link>
  );
}
