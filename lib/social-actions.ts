"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { accents, avatarEmojis, USERNAME_RE, type Accent } from "@/lib/types";

type Result = { error?: string; ok?: boolean };

// "I'm here" ping for the online dot. Sent every couple of minutes.
export async function touch() {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
}

// Copy someone's shared set (and its cards) into your own library.
export async function copySet(setId: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: "Log in first." };
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("study_sets")
    .select("title, subject, accent, source_text, cards(front, back, position)")
    .eq("id", setId)
    .maybeSingle();
  if (!set) return { error: "That set isn't available." };

  const { data: copy, error } = await supabase
    .from("study_sets")
    .insert({ title: set.title, subject: set.subject, accent: set.accent, source_text: set.source_text })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (set.cards.length) {
    const { error: cardError } = await supabase
      .from("cards")
      .insert(set.cards.map((c) => ({ study_set_id: copy.id, front: c.front, back: c.back, position: c.position })));
    if (cardError) return { error: cardError.message };
  }

  revalidatePath("/", "layout");
  redirect(`/sets/${copy.id}`);
}

export async function updateProfile(input: { username: string; avatarEmoji: string; avatarColor: Accent }): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: "Log in first." };
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) return { error: "3–20 characters: letters, numbers, and _ only." };
  if (!avatarEmojis.includes(input.avatarEmoji) || !accents.includes(input.avatarColor)) return { error: "Pick an icon and color." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_emoji: input.avatarEmoji, avatar_color: input.avatarColor })
    .eq("id", user.id);
  if (error?.code === "23505") return { error: "That username is taken." };
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

// avatarUrl is a public URL from the avatars bucket, or null to go back to the emoji.
export async function setAvatarUrl(avatarUrl: string | null): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: "Log in first." };
  const supabase = await createClient();
  if (avatarUrl && !avatarUrl.includes(`/avatars/${user.id}/`)) return { error: "Invalid image." };

  // Clean up old photos.
  const { data: old } = await supabase.storage.from("avatars").list(user.id);
  const keep = avatarUrl?.split(`/avatars/`)[1];
  const stale = (old ?? []).map((f) => `${user.id}/${f.name}`).filter((p) => p !== keep);
  if (stale.length) await supabase.storage.from("avatars").remove(stale);

  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

const privacyKeys = ["is_private", "show_on_leaderboard", "show_sets", "show_activity"] as const;
export type PrivacyKey = (typeof privacyKeys)[number];

export async function updatePrivacy(key: PrivacyKey, value: boolean): Promise<Result> {
  const user = await getUser();
  if (!user || !privacyKeys.includes(key)) return { error: "Not allowed." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ [key]: value }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePassword(password: string, confirm: string): Promise<Result> {
  if (password.length < 6) return { error: "Needs at least 6 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: true };
}
