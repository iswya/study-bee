import Link from "next/link";
import { BeeShape } from "./bee";

// Rounded honey hexagon with a little bee inside.
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-honey" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd46b" />
          <stop offset="1" stopColor="#f0a007" />
        </linearGradient>
      </defs>
      <path
        d="M20 5.5 32.6 12.75v14.5L20 34.5 7.4 27.25v-14.5z"
        fill="url(#logo-honey)"
        stroke="url(#logo-honey)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <g transform="translate(6.5 7) scale(0.84)">
        <BeeShape body="#1f1a12" stripes="#fbb829" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-xl">
      <span className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
        <LogoMark />
      </span>
      <span className="font-display text-[22px] font-semibold tracking-tight">
        study<span className="text-honey-400">bee</span>
      </span>
    </Link>
  );
}
