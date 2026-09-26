"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
