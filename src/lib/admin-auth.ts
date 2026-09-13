import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";
import { fail, type ActionResult } from "@/lib/result";

export async function requireStaff() {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    return {
      supabase: null,
      staff: null,
      error: fail("NOT_CONFIGURED", "Supabase is not configured."),
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase: null,
      staff: null,
      error: fail("UNAUTHENTICATED", "Please sign in."),
    };
  }
  const { data: staff } = await supabase
    .from("staff")
    .select("user_id, role, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staff) {
    return {
      supabase: null,
      staff: null,
      error: fail("FORBIDDEN", "This account is not on the staff list."),
    };
  }
  return { supabase, staff, error: null as ActionResult<never> | null };
}
