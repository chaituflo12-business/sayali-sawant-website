import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { hasServiceRole } from "@/lib/supabase/env";

export function createServiceClient() {
  if (!hasServiceRole()) return null;
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    },
  );
}
