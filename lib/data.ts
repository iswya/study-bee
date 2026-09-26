import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Accent,
  AvatarInfo,
  Card,
  LeaderboardRow,
  MyProfile,
  PublicProfile,
  StudySet,
  StudySetSummary,
} from "@/lib/types";

type SetRow = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  accent: Accent;
  created_at: string;
  cards: Card[];
};

function summarize(row: SetRow): StudySetSummary {
  const cardCount = row.cards.length;
  const knownCount = row.cards.filter((c) => c.known).length;
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    accent: row.accent,
    createdAt: row.created_at,
    cardCount,
    knownCount,
    progress: cardCount ? Math.round((knownCount / cardCount) * 100) : 0,
  };
}

// getClaims verifies the login token locally (no round trip to Supabase),
// and cache() dedupes it within one request.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

export const getMyProfile = cache(async (): Promise<MyProfile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_emoji, avatar_color, avatar_url, is_private, show_on_leaderboard, show_sets, show_activity")
    .eq("id", user.id)
    .maybeSingle();
  return data as MyProfile | null;
});

// Sets owned by `userId` (defaults to you). Others' sets only come back if
// they share them — RLS enforces that.
export async function getSets(userId?: string): Promise<StudySetSummary[]> {
  const owner = userId ?? (await getUser())?.id;
  if (!owner) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sets")
    .select("id, user_id, title, subject, accent, created_at, cards(id, known)")
    .eq("user_id", owner)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as SetRow[]).map(summarize);
}

export type SetWithOwner = StudySet & { isMine: boolean; owner: AvatarInfo | null };

export async function getSet(id: string): Promise<SetWithOwner | null> {
  const supabase = await createClient();
  const [{ data, error }, user] = await Promise.all([
    supabase
      .from("study_sets")
      .select("id, user_id, title, subject, accent, created_at, cards(id, front, back, known, position)")
      .eq("id", id)
      .order("position", { referencedTable: "cards" })
      .maybeSingle(),
    getUser(),
  ]);
  // Bad ids (not a uuid) come back as an error; treat them as "not found".
  if (error || !data) return null;
  const row = data as unknown as SetRow;
  const isMine = row.user_id === user?.id;

  let owner: AvatarInfo | null = null;
  if (!isMine) {
    const { data: card } = await supabase.rpc("profile_card", { uid: row.user_id }).maybeSingle();
    owner = card as AvatarInfo | null;
  }
  return { ...summarize(row), cards: row.cards, isMine, owner };
}

export async function getStats() {
  const user = await getUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sessions")
    .select("seconds, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);

  const minutes = Math.round(data.reduce((n, s) => n + s.seconds, 0) / 60);

  // Streak = consecutive days (UTC) with at least one session, ending today or yesterday.
  const days = new Set(data.map((s) => s.created_at.slice(0, 10)));
  const day = new Date();
  const key = () => day.toISOString().slice(0, 10);
  if (!days.has(key())) day.setUTCDate(day.getUTCDate() - 1);
  let streak = 0;
  while (days.has(key())) {
    streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }

  return { minutes, streak };
}

export async function getLeaderboard(period: "week" | "all"): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("leaderboard", { days: period === "week" ? 7 : null });
  if (error) throw new Error(error.message);
  return (data as LeaderboardRow[]).map((r) => ({ ...r, cards_reviewed: Number(r.cards_reviewed) }));
}

export async function getProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_profile", { uname: username });
  if (error) throw new Error(error.message);
  return (data as PublicProfile | null) ?? null;
}
