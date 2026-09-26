"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/data";
import { accents, type Accent } from "@/lib/types";

export type FormState = { error?: string } | undefined;

export async function createSet(input: {
  title: string;
  subject: string;
  accent: Accent;
  sourceText: string;
  cards: { front: string; back: string }[];
}): Promise<FormState> {
  const title = input.title.trim();
  if (!title) return { error: "Give it a title." };
  if (!accents.includes(input.accent)) return { error: "Pick a color." };

  const supabase = await createClient();
  const { data: set, error } = await supabase
    .from("study_sets")
    .insert({
      title,
      subject: input.subject.trim(),
      accent: input.accent,
      source_text: input.sourceText,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (input.cards.length) {
    const { error: cardError } = await supabase.from("cards").insert(
      input.cards.slice(0, 500).map((c, i) => ({
        study_set_id: set.id,
        front: c.front.slice(0, 2000),
        back: c.back.slice(0, 2000),
        position: i,
      }))
    );
    if (cardError) return { error: cardError.message };
  }

  revalidatePath("/", "layout");
  redirect(`/sets/${set.id}`);
}

export async function deleteSet(id: string) {
  const supabase = await createClient();
  await supabase.from("study_sets").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function addCard(setId: string, front: string, back: string): Promise<FormState> {
  front = front.trim();
  back = back.trim();
  if (!front || !back) return { error: "Fill in both sides." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("cards")
    .select("id", { count: "exact", head: true })
    .eq("study_set_id", setId);
  const { error } = await supabase
    .from("cards")
    .insert({ study_set_id: setId, front, back, position: count ?? 0 });
  if (error) return { error: error.message };

  revalidatePath(`/sets/${setId}`);
}

// Swap a set's cards for an AI-edited list. Cards that come back unchanged
// keep their "known" progress.
export async function replaceCards(setId: string, cards: { front: string; back: string }[]): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Log in first." };
  const clean = cards
    .map((c) => ({ front: c.front.trim().slice(0, 2000), back: c.back.trim().slice(0, 2000) }))
    .filter((c) => c.front && c.back)
    .slice(0, 500);
  if (!clean.length) return { error: "A set needs at least one card." };

  const supabase = await createClient();
  const { data: set } = await supabase.from("study_sets").select("id").eq("id", setId).eq("user_id", user.id).maybeSingle();
  if (!set) return { error: "You can only edit your own sets." };

  const { data: old } = await supabase.from("cards").select("id, front, back, known").eq("study_set_id", setId);
  const knownBefore = new Map((old ?? []).map((c) => [`${c.front}\u0000${c.back}`, c.known]));

  // Insert the new list first, then remove the old rows — so a failure
  // part-way never leaves the set empty.
  const { error } = await supabase.from("cards").insert(
    clean.map((c, i) => ({
      study_set_id: setId,
      front: c.front,
      back: c.back,
      position: i,
      known: knownBefore.get(`${c.front}\u0000${c.back}`) ?? false,
    }))
  );
  if (error) return { error: error.message };
  if (old?.length) await supabase.from("cards").delete().in("id", old.map((c) => c.id));

  revalidatePath("/", "layout");
}

export async function deleteCard(setId: string, cardId: string) {
  const supabase = await createClient();
  await supabase.from("cards").delete().eq("id", cardId);
  revalidatePath(`/sets/${setId}`);
}

// Called when a flashcard or quiz round finishes.
export async function saveSession(input: {
  setId: string;
  mode: "flashcards" | "quiz";
  results: { cardId: string; known: boolean }[];
  seconds: number;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const knownIds = input.results.filter((r) => r.known).map((r) => r.cardId);
  const missedIds = input.results.filter((r) => !r.known).map((r) => r.cardId);

  await Promise.all([
    knownIds.length &&
      supabase.from("cards").update({ known: true, reviewed_at: now }).in("id", knownIds),
    missedIds.length &&
      supabase.from("cards").update({ known: false, reviewed_at: now }).in("id", missedIds),
    supabase.from("study_sessions").insert({
      study_set_id: input.setId,
      mode: input.mode,
      correct: knownIds.length,
      total: input.results.length,
      seconds: Math.min(Math.max(0, Math.round(input.seconds)), 60 * 60 * 3),
    }),
  ]);

  revalidatePath("/", "layout");
}
