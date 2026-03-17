import { createClient } from "@supabase/supabase-js";

// Server-side only — uses service_role key to bypass RLS for admin writes
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase env vars not configured");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
