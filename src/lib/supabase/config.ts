export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig {
  // Accept both the NEXT_PUBLIC_* names and the names the Supabase Vercel
  // integration creates, so auth works regardless of which set is configured.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
}
