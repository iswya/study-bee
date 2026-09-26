import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Supabase client for Client Components (files with "use client").
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
