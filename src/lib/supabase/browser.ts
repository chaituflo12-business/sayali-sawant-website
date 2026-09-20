import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function createBrowserSupabase() {
  if (!hasSupabaseEnv()) return null;
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
}
