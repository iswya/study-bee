import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Accent, Card, StudySet, StudySetSummary } from "@/lib/types";

type SetRow = {
  id: string;
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
  const meta = (claims.user_metadata ?? {}) as { display_name?: string };
  const email = typeof claims.email === "string" ? claims.email : "";
  return {
    id: claims.sub,
    email,
    name: meta.display_name || email.split("@")[0] || "you",
  };
});

export async function getSets(): Promise<StudySetSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sets")
    .select("id, title, subject, accent, created_at, cards(id, known)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as SetRow[]).map(summarize);
}

export async function getSet(id: string): Promise<StudySet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sets")
    .select("id, title, subject, accent, created_at, cards(id, front, back, known, position)")
    .eq("id", id)
    .order("position", { referencedTable: "cards" })
    .maybeSingle();
  // Bad ids (not a uuid) come back as an error; treat them as "not found".
  if (error || !data) return null;
  const row = data as unknown as SetRow;
  return { ...summarize(row), cards: row.cards };
}

export async function getStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_sessions")
    .select("seconds, created_at")
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
