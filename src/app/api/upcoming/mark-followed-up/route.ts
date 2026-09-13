import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeMakeRequest } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const bodySchema = z.object({
  ref: z.string().trim().min(4).max(20),
});

export async function POST(request: Request) {
  const auth = authorizeMakeRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, code: auth.code, message: auth.message },
      { status: auth.status },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "Body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", message: "ref is required." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("mark_no_show_followed_up", {
    p_ref: parsed.data.ref,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "UPDATE_ERROR", message: "Could not stamp the follow-up." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
