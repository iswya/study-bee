// Last 12 weeks of study activity as a honeycomb: one hexagon per day,
// brighter honey = more cards reviewed. Columns are weeks, rows are days.

const WEEKS = 12;
const W = 16; // hex width
const H = 18; // hex height
const ROW = H * 0.78;

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join("L")}Z`;
}

export function HiveActivity({ activity }: { activity: { day: string; cards: number }[] }) {
  const byDay = new Map(activity.map((a) => [a.day, a.cards]));
  const max = Math.max(1, ...activity.map((a) => a.cards));

  // Start on the Sunday 11 weeks before this week's Sunday (UTC).
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() - (WEEKS - 1) * 7));
  const todayKey = today.toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (key > todayKey) break;
    const col = Math.floor(i / 7);
    const row = i % 7;
    const n = byDay.get(key) ?? 0;
    const level = n === 0 ? 0 : Math.ceil((n / max) * 4);
    cells.push({ key, n, level, cx: col * W + (row % 2 ? W / 2 : 0) + W / 2, cy: row * ROW + H / 2 });
  }

  const fill = ["var(--color-ink-950)", "#fbb829", "#fbb829", "#fbb829", "#fbb829"];
  const opacity = [0.06, 0.3, 0.5, 0.75, 1];
  const total = activity.reduce((n, a) => n + a.cards, 0);
  const activeDays = activity.filter((a) => a.cards > 0).length;

  return (
    <div>
      <svg viewBox={`0 0 ${WEEKS * W + W / 2} ${6 * ROW + H}`} className="w-full" role="img" aria-label={`${total} cards over ${activeDays} days in the last 12 weeks`}>
        {cells.map((c) => (
          <path key={c.key} d={hexPath(c.cx, c.cy, H / 2 - 1.2)} fill={fill[c.level]} fillOpacity={opacity[c.level]} strokeLinejoin="round">
            <title>{`${c.key}: ${c.n} cards`}</title>
          </path>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
        <span>
          {total} cards · {activeDays} active {activeDays === 1 ? "day" : "days"}
        </span>
        <span className="flex items-center gap-1">
          Less
          {opacity.map((o, i) => (
            <svg key={i} viewBox="0 0 16 18" className="size-3">
              <path d={hexPath(8, 9, 7.5)} fill={fill[i]} fillOpacity={o} />
            </svg>
          ))}
          More
        </span>
      </div>
    </div>
  );
}
