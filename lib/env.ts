export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

// Validation for server-side
if (typeof window === "undefined") {
  if (!env.supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
} else {
  // Client-side specific validation (only for public ones)
  if (!env.supabaseUrl) console.warn("NEXT_PUBLIC_SUPABASE_URL is not defined on the client");
  if (!env.supabaseAnonKey) console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined on the client");
}
