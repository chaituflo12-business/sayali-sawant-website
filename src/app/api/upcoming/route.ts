import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/webhook/sign";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "WEBHOOK_SECRET is not set." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const signature =
    request.headers.get("x-signature") ?? request.headers.get("authorization");
  const header = signature?.startsWith("Bearer ")
    ? signature.slice("Bearer ".length)
    : signature;
  const body = `GET\n${url.pathname}${url.search}`;
  if (!verifySignature(body, header ?? null, secret)) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED", message: "Invalid signature." },
      { status: 401 },
    );
  }

  const from = url.searchParams.get("from") ?? new Date().toISOString();
  const to =
    url.searchParams.get("to") ??
    new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("get_upcoming_appointments", {
    from_date: from,
    to_date: to,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "QUERY_ERROR", message: "Could not load upcoming appointments." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
