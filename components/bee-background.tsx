"use client";

import { useEffect, useRef } from "react";
import { Bee } from "./bee";

// Fixed page background: faint honeycomb clusters, dotted flight trails,
// and a few bees flying along them. Purely decorative.
//
// Performance: the trails are a static SVG that never repaints. Each bee is
// its own tiny element flown by a precomputed compositor animation, so it costs
// almost nothing (the old version repainted the whole screen every frame).

const trails = [
  "M-80 180 C 220 60, 420 320, 700 200 S 1180 40, 1520 160",
  "M-60 720 C 260 560, 520 820, 820 640 S 1260 520, 1520 700",
  "M1500 420 C 1200 300, 1000 520, 760 430 S 360 300, -60 470",
];

// [trail index, seconds per lap, start offset 0–1, size px]
const flyers: [number, number, number, number][] = [
  [0, 34, 0, 30],
  [1, 42, 0.45, 26],
  [2, 38, 0.2, 22],
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
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const beeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const paths = pathRefs.current;
    let running: Animation[] = [];

    // Sample each trail once, convert to screen pixels, and hand the result to
    // the browser as a looping transform animation. It then runs entirely on
    // the compositor — zero JavaScript or repainting per frame.
    function start() {
      running.forEach((a) => a.cancel());
      const ctm = svg!.getScreenCTM();
      if (!ctm) return;
      running = flyers.flatMap(([trail, dur, offset], i) => {
        const el = beeRefs.current[i];
        const path = paths[trail];
        if (!el || !path) return [];
        const len = path.getTotalLength();
        const steps = 160;
        let prevAngle = 0;
        const frames: Keyframe[] = [];
        for (let s = 0; s <= steps; s++) {
          const at = (s / steps) * len;
          const p = path.getPointAtLength(at);
          const q = path.getPointAtLength(Math.min(len, at + 2));
          const x = ctm.a * p.x + ctm.c * p.y + ctm.e;
          const y = ctm.b * p.x + ctm.d * p.y + ctm.f;
          const raw = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          // Keep the angle continuous so it never spins the long way round.
          let angle = raw;
          while (angle - prevAngle > 180) angle -= 360;
          while (angle - prevAngle < -180) angle += 360;
          prevAngle = angle;
          // Flying leftwards: mirror so the bee stays upright.
          const flip = Math.abs(raw) > 90 ? -1 : 1;
          frames.push({ transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) scaleY(${flip})` });
        }
        const anim = el.animate(frames, { duration: dur * 1000, iterations: Infinity, easing: "linear" });
        anim.currentTime = offset * dur * 1000;
        return [anim];
      });
    }

    start();
    let timer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(start, 150);
    });
    ro.observe(svg);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      running.forEach((a) => a.cancel());
    };
  }, []);

  return (
    // lvh = the tallest the viewport gets, so the address bar sliding or the
    // keyboard opening doesn't resize (and jolt) the background.
    <div className="pointer-events-none fixed left-0 top-0 h-lvh w-full overflow-hidden [contain:strict]" aria-hidden>
      {/* Soft honey glows (gradients, not blur filters — much cheaper on phones) */}
      <div className="absolute -left-60 -top-60 size-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(251_184_41/0.08),transparent)]" />
      <div className="absolute -bottom-72 -right-60 size-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(251_184_41/0.06),transparent)]" />

      <svg ref={svgRef} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <Comb x={1330} y={90} s={1.1} />
        <Comb x={90} y={860} s={0.9} />
        {trails.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="var(--trail)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 14"
          />
        ))}
      </svg>

      {flyers.map(([, , , size], i) => (
        <div
          key={i}
          ref={(el) => {
            beeRefs.current[i] = el;
          }}
          className="bee-flyer absolute left-0 top-0 opacity-85 will-change-transform"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, transform: "translate3d(-100px,-100px,0)" }}
        >
          <Bee className="size-full" />
        </div>
      ))}
    </div>
  );
}
