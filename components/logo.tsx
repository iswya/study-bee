import Link from "next/link";
import { BeeShape } from "./bee";

// Rounded honey hexagon with a little bee inside. Solid fills only — SVG
// gradient ids break when the same logo is on the page twice and one copy
// is hidden (e.g. sidebar vs. mobile top bar).
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 5.5 32.6 12.75v14.5L20 34.5 7.4 27.25v-14.5z" fill="#f7ab1c" stroke="#f7ab1c" strokeWidth="7" strokeLinejoin="round" />
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
