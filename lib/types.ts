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

// "just now", "5m ago", "3h ago", "2d ago"
export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(iso);
}

// ───── Social ─────

export type AvatarInfo = {
  username: string;
  avatar_emoji: string;
  avatar_color: Accent;
  avatar_url: string | null;
};

export type MyProfile = AvatarInfo & {
  id: string;
  is_private: boolean;
  show_on_leaderboard: boolean;
  show_sets: boolean;
  show_activity: boolean;
};

export type LeaderboardRow = AvatarInfo & {
  cards_reviewed: number;
  minutes: number;
  streak: number;
  online: boolean;
  is_me: boolean;
};

export type PublicProfile = AvatarInfo & {
  id: string;
  created_at: string;
  is_me: boolean;
  is_private: boolean;
  show_sets: boolean;
  online: boolean | null;
  last_seen_at: string | null;
  stats: {
    cards_reviewed: number;
    cards_known: number;
    minutes: number;
    sessions: number;
    accuracy: number | null;
    streak: number;
    sets: number;
  } | null;
  activity: { day: string; cards: number }[] | null;
  studying: { id: string; title: string; at: string } | null;
};

export const avatarEmojis = ["🐝", "🌻", "🍯", "🌸", "🦋", "🐞", "🌈", "⭐", "🔥", "🍀", "🐸", "🦊", "🐼", "🐧", "🐙", "🦄", "👾", "🎧", "📚", "🧠", "☕", "🍕", "🎮", "⚡"];

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
