export type Accent = "honey" | "mint" | "sky" | "rose" | "lilac";

export type Card = {
  id: string;
  front: string;
  back: string;
  known: boolean;
  position: number;
};

export type StudySetSummary = {
  id: string;
  title: string;
  subject: string;
  accent: Accent;
  createdAt: string;
  cardCount: number;
  knownCount: number;
  progress: number; // 0–100
};

export type StudySet = StudySetSummary & { cards: Card[] };

// Tailwind needs full class names written out, so accents map to fixed sets.
export const accentStyles: Record<
  Accent,
  { soft: string; text: string; solid: string; stroke: string }
> = {
  honey: { soft: "bg-honey-50", text: "text-honey-600", solid: "bg-honey-400", stroke: "stroke-honey-400" },
  mint: { soft: "bg-mint-50", text: "text-mint-600", solid: "bg-mint-500", stroke: "stroke-mint-500" },
  sky: { soft: "bg-sky-50", text: "text-sky-600", solid: "bg-sky-500", stroke: "stroke-sky-500" },
  rose: { soft: "bg-rose-50", text: "text-rose-600", solid: "bg-rose-500", stroke: "stroke-rose-500" },
  lilac: { soft: "bg-lilac-50", text: "text-lilac-600", solid: "bg-lilac-500", stroke: "stroke-lilac-500" },
};

export const accents = Object.keys(accentStyles) as Accent[];

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
