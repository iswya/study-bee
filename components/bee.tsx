// A small round bee facing right, drawn in a 32×32 box. Wings flap via CSS.
// <BeeShape> is the raw SVG group (for use inside other SVGs); <Bee> wraps it.

export function BeeShape({
  body = "var(--color-honey-400)",
  stripes = "#1f1a12",
  flap = true,
}: {
  body?: string;
  stripes?: string;
  flap?: boolean;
}) {
  const wing = flap ? "bee-wing" : undefined;
  return (
    <g>
      <ellipse className={wing} cx="13" cy="10" rx="4.2" ry="6.2" transform="rotate(-18 13 10)" fill="#fff" fillOpacity="0.75" stroke="#1f1a12" strokeOpacity="0.25" />
      <ellipse className={wing} cx="18.5" cy="9.5" rx="4" ry="6" transform="rotate(14 18.5 9.5)" fill="#fff" fillOpacity="0.9" stroke="#1f1a12" strokeOpacity="0.25" />
      <path d="M6.2 19.5 3.2 18.4l3 -1.9z" fill="#1f1a12" />
      <ellipse cx="15.5" cy="19" rx="9.5" ry="7" fill={body} />
      <rect x="12" y="12.4" width="2.8" height="13.2" rx="1.4" fill={stripes} />
      <rect x="17.3" y="12.3" width="2.8" height="13.4" rx="1.4" fill={stripes} />
      <ellipse cx="15.5" cy="19" rx="9.5" ry="7" fill="none" stroke="#1f1a12" strokeWidth="1.4" />
      <circle cx="25.3" cy="17.8" r="4" fill="#1f1a12" />
      <circle cx="26.6" cy="16.9" r="1.1" fill="#fff" />
      <path d="M25 14c.3-2 1.5-3.3 3-3.8" fill="none" stroke="#1f1a12" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

export function Bee({ className = "size-8", hover = false }: { className?: string; hover?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} ${hover ? "bee-hover" : ""} overflow-visible`} aria-hidden>
      <BeeShape />
    </svg>
  );
}
