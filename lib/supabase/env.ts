// Supabase URL and public key, accepting the names used by both manual
// setup (.env.local) and the Vercel ↔ Supabase integration.
// NEXT_PUBLIC_* must be referenced directly so Next can inline them at build.
// `||` (not `??`) so an empty dashboard value falls through to the next one.
//
// The final fallbacks are the project's public values. They're safe to commit:
// the URL and publishable key are designed to be public, and Row Level
// Security protects the data. NEVER put the secret key in this file.
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://dezsrinrentyrjrxvdnh.supabase.co";

export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_sSzq4gLAxiNEK3grj-HmVw_PVUwILen";

export function getSupabaseEnv() {
  return { url: supabaseUrl, key: supabaseKey };
}
