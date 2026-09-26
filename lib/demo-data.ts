// Sample study sets so the UI has something to show before saving to
// Supabase is wired up. Shapes mirror the study_sets / cards tables.

export type Accent = "brand" | "honey" | "mint" | "sky" | "rose";

export type Card = {
  id: string;
  front: string;
  back: string;
};

export type StudySet = {
  id: string;
  title: string;
  subject: string;
  accent: Accent;
  createdAt: string;
  aiGenerated: boolean;
  progress: number; // 0–100
  minutesStudied: number;
  cards: Card[];
};

export const studySets: StudySet[] = [
  {
    id: "french-revolution",
    title: "The French Revolution",
    subject: "History",
    accent: "honey",
    createdAt: "2026-09-18",
    aiGenerated: true,
    progress: 75,
    minutesStudied: 42,
    cards: [
      { id: "fr1", front: "When did the storming of the Bastille happen?", back: "July 14, 1789" },
      { id: "fr2", front: "What were the three Estates?", back: "Clergy (1st), nobility (2nd), and everyone else — commoners (3rd)" },
      { id: "fr3", front: "What was the Tennis Court Oath?", back: "The Third Estate's vow not to disband until France had a new constitution (June 1789)" },
      { id: "fr4", front: "Who led the Committee of Public Safety during the Terror?", back: "Maximilien Robespierre" },
      { id: "fr5", front: "What document declared the rights of citizens in 1789?", back: "The Declaration of the Rights of Man and of the Citizen" },
      { id: "fr6", front: "When was Louis XVI executed?", back: "January 21, 1793" },
      { id: "fr7", front: "Who seized power in the coup of 18 Brumaire (1799)?", back: "Napoleon Bonaparte" },
    ],
  },
  {
    id: "cell-biology",
    title: "Cell Structure & Function",
    subject: "Biology",
    accent: "mint",
    createdAt: "2026-09-20",
    aiGenerated: true,
    progress: 40,
    minutesStudied: 18,
    cards: [
      { id: "cb1", front: "What is the powerhouse of the cell?", back: "The mitochondria — it makes ATP through cellular respiration" },
      { id: "cb2", front: "What does the ribosome do?", back: "Builds proteins by translating mRNA" },
      { id: "cb3", front: "What controls what enters and leaves the cell?", back: "The cell membrane (it's selectively permeable)" },
      { id: "cb4", front: "Which organelle does photosynthesis?", back: "The chloroplast" },
      { id: "cb5", front: "What's the difference between prokaryotes and eukaryotes?", back: "Eukaryotes have a nucleus and membrane-bound organelles; prokaryotes don't" },
    ],
  },
  {
    id: "calc-limits",
    title: "Limits & Continuity",
    subject: "Calculus",
    accent: "sky",
    createdAt: "2026-09-22",
    aiGenerated: false,
    progress: 15,
    minutesStudied: 9,
    cards: [
      { id: "cl1", front: "What does lim x→a f(x) = L mean?", back: "f(x) gets arbitrarily close to L as x gets close to a" },
      { id: "cl2", front: "What's lim x→0 of sin(x)/x?", back: "1" },
      { id: "cl3", front: "Three conditions for f to be continuous at a?", back: "f(a) is defined, the limit exists, and the limit equals f(a)" },
      { id: "cl4", front: "What is L'Hôpital's rule used for?", back: "Limits of the form 0/0 or ∞/∞ — take derivatives of top and bottom" },
    ],
  },
  {
    id: "spanish-vocab",
    title: "Spanish Unit 3 Vocab",
    subject: "Spanish",
    accent: "rose",
    createdAt: "2026-09-24",
    aiGenerated: false,
    progress: 0,
    minutesStudied: 0,
    cards: [],
  },
];

export function getStudySet(id: string) {
  return studySets.find((s) => s.id === id);
}

// Tailwind needs full class names written out, so accents map to fixed sets.
export const accentStyles: Record<
  Accent,
  { soft: string; text: string; solid: string; stroke: string; bar: string }
> = {
  brand: { soft: "bg-brand-50", text: "text-brand-600", solid: "bg-brand-500", stroke: "stroke-brand-500", bar: "bg-brand-500" },
  honey: { soft: "bg-honey-50", text: "text-honey-600", solid: "bg-honey-400", stroke: "stroke-honey-400", bar: "bg-honey-400" },
  mint: { soft: "bg-mint-50", text: "text-mint-600", solid: "bg-mint-500", stroke: "stroke-mint-500", bar: "bg-mint-500" },
  sky: { soft: "bg-sky-50", text: "text-sky-600", solid: "bg-sky-500", stroke: "stroke-sky-500", bar: "bg-sky-500" },
  rose: { soft: "bg-rose-50", text: "text-rose-600", solid: "bg-rose-500", stroke: "stroke-rose-500", bar: "bg-rose-500" },
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
