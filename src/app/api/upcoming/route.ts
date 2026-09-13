import { NextResponse } from "next/server";
import { authorizeMakeRequest } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = authorizeMakeRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, code: auth.code, message: auth.message },
      { status: auth.status },
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);

  if (url.searchParams.get("status") === "no_show") {
    const { data, error } = await supabase.rpc("get_no_shows_today");
    if (error) {
      return NextResponse.json(
        { ok: false, code: "QUERY_ERROR", message: "Could not load no-shows." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, data });
  }

  const hours = Number(url.searchParams.get("hours") ?? "24");
  const window = Number.isFinite(hours) && hours > 0 && hours <= 720 ? hours : 24;
  const from = new Date();
  const to = new Date(from.getTime() + window * 60 * 60 * 1000);

  const { data, error } = await supabase.rpc("get_upcoming_appointments", {
    from_date: from.toISOString(),
    to_date: to.toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "QUERY_ERROR", message: "Could not load upcoming appointments." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, hours: window, data });
}
