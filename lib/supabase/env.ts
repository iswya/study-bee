// Supabase URL and public key, accepting the names used by both manual
// setup (.env.local) and the Vercel ↔ Supabase integration.
// NEXT_PUBLIC_* must be referenced directly so Next can inline them at build.
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase env vars: ${[
        !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
        !supabaseKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY (or _PUBLISHABLE_KEY)",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }
  return { url: supabaseUrl, key: supabaseKey };
}
