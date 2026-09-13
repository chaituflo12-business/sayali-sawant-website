import { NextResponse } from "next/server";
import { authorizeMakeRequest } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { formatIstDate } from "@/lib/datetime";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeMakeRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, code: auth.code, message: auth.message },
      { status: auth.status },
    );
  }

  const url = new URL(request.url);
  const requested = url.searchParams.get("date") ?? "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requested)
    ? requested
    : formatIstDate(new Date());

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("get_pending_waitlist", {
    p_date: date,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "QUERY_ERROR", message: "Could not load the waitlist." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, date, data });
}
