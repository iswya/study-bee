"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

function read(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: read(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const name = read(form, "name");
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Add a name so your friends know it's you." };
  if (password.length < 6) return { error: "Password needs at least 6 characters." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: read(form, "email"),
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // Email confirmation is on in Supabase → no session until they click the link.
  if (!data.session) return { message: "Check your email for a confirmation link." };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
