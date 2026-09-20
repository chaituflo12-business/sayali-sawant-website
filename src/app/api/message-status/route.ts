import { NextResponse } from "next/server";
import { authorizeMakeRequest } from "@/lib/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { messageStatusSchema } from "@/lib/validation/appointment";

export const runtime = "nodejs";

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

  const parsed = messageStatusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION",
        message: parsed.error.issues[0]?.message ?? "Invalid body.",
      },
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

  const { data, error } = await supabase.rpc("record_message_status", {
    p_whatsapp: parsed.data.whatsapp,
    p_template: parsed.data.template,
    p_status: parsed.data.status,
    p_make_execution_id: parsed.data.make_execution_id ?? null,
    p_appointment_ref: parsed.data.appointment_ref ?? null,
    p_opt_out: parsed.data.opt_out ?? false,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, code: "RECORD_ERROR", message: "Could not record the status." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
