// A small round bee facing right, drawn in a 32×32 box.
// <BeeShape> is the static SVG group (for use inside other SVGs, e.g. the logo).
// <Bee> puts the wings on their own layer so they can flap on the GPU —
// animating shapes *inside* an SVG forces a repaint every frame.

function Wings() {
  return (
    <>
      <ellipse cx="13" cy="10" rx="4.2" ry="6.2" transform="rotate(-18 13 10)" fill="#fff" fillOpacity="0.75" stroke="#1f1a12" strokeOpacity="0.25" />
      <ellipse cx="18.5" cy="9.5" rx="4" ry="6" transform="rotate(14 18.5 9.5)" fill="#fff" fillOpacity="0.9" stroke="#1f1a12" strokeOpacity="0.25" />
    </>
  );
}

function Body({ body, stripes }: { body: string; stripes: string }) {
  return (
    <>
      <path d="M6.2 19.5 3.2 18.4l3 -1.9z" fill="#1f1a12" />
      <ellipse cx="15.5" cy="19" rx="9.5" ry="7" fill={body} />
      <rect x="12" y="12.4" width="2.8" height="13.2" rx="1.4" fill={stripes} />
      <rect x="17.3" y="12.3" width="2.8" height="13.4" rx="1.4" fill={stripes} />
      <ellipse cx="15.5" cy="19" rx="9.5" ry="7" fill="none" stroke="#1f1a12" strokeWidth="1.4" />
      <circle cx="25.3" cy="17.8" r="4" fill="#1f1a12" />
      <circle cx="26.6" cy="16.9" r="1.1" fill="#fff" />
      <path d="M25 14c.3-2 1.5-3.3 3-3.8" fill="none" stroke="#1f1a12" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}

export function BeeShape({ body = "var(--color-honey-400)", stripes = "#1f1a12" }: { body?: string; stripes?: string }) {
  return (
    <g>
      <Wings />
      <Body body={body} stripes={stripes} />
    </g>
  );
}

export function Bee({ className = "size-8", hover = false }: { className?: string; hover?: boolean }) {
  return (
    <span className={`relative inline-block shrink-0 ${hover ? "bee-hover" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 32 32" className="bee-wings absolute inset-0 size-full overflow-visible">
        <Wings />
      </svg>
      <svg viewBox="0 0 32 32" className="relative block size-full overflow-visible">
        <Body body="var(--color-honey-400)" stripes="#1f1a12" />
      </svg>
    </span>
  );
}
