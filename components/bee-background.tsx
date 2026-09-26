import { BeeShape } from "./bee";

// Fixed page background: faint honeycomb clusters, dotted flight trails,
// and a few bees flying along them. Purely decorative.

const trails = [
  "M-80 180 C 220 60, 420 320, 700 200 S 1180 40, 1520 160",
  "M-60 720 C 260 560, 520 820, 820 640 S 1260 520, 1520 700",
  "M1500 420 C 1200 300, 1000 520, 760 430 S 360 300, -60 470",
];

// [trail index, duration seconds, start offset 0–1, scale]
const flyers: [number, number, number, number][] = [
  [0, 34, 0, 1],
  [1, 42, 0.45, 0.85],
  [2, 38, 0.2, 0.75],
];

function Comb({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  // Seven-cell honeycomb cluster
  const cells = [
    [0, 0], [1, 0], [-1, 0], [0.5, 0.87], [-0.5, 0.87], [0.5, -0.87], [-0.5, -0.87],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="var(--comb)" strokeWidth="2">
      {cells.map(([cx, cy], i) => (
        <path
          key={i}
          transform={`translate(${cx * 64} ${cy * 64})`}
          d="M0 -36 31 -18v36L0 36-31 18v-36z"
          strokeLinejoin="round"
          fill={i === 0 ? "var(--comb)" : "none"}
        />
      ))}
    </g>
  );
}

export function BeeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-honey-400/[0.07] blur-3xl" />
      <div className="absolute -bottom-52 -right-40 size-[560px] rounded-full bg-honey-400/[0.05] blur-3xl" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <Comb x={1330} y={90} s={1.1} />
        <Comb x={90} y={860} s={0.9} />
        {trails.map((d, i) => (
          <path
            key={i}
            id={`trail-${i}`}
            d={d}
            fill="none"
            stroke="var(--trail)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 14"
          />
        ))}
        {flyers.map(([trail, dur, offset, scale], i) => (
          <g key={i} className="bee-flyer">
            <animateMotion dur={`${dur}s`} begin={`-${offset * dur}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#trail-${trail}`} />
            </animateMotion>
            {/* Trail 2 flies right→left; flip so the bee isn't upside down */}
            <g transform={`scale(${scale} ${trail === 2 ? -scale : scale}) translate(-16 -18)`} opacity="0.85">
              <BeeShape />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
