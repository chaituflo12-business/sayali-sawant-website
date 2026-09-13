import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-auth";
import { addIstDays, startOfIstDay } from "@/lib/datetime";

export const runtime = "nodejs";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) {
    return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  }

  const from = addIstDays(startOfIstDay(new Date()), -7);
  const to = addIstDays(startOfIstDay(new Date()), 21);

  const { data: slots } = await gate.supabase
    .from("slots")
    .select("id, starts_at, ends_at")
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString());

  const ids = (slots ?? []).map((s) => s.id);
  const { data: appointments } = ids.length
    ? await gate.supabase
        .from("appointments")
        .select(
          "public_ref, patient_name, whatsapp_e164, age, gender, visit_type, status, slot_id, created_at",
        )
        .in("slot_id", ids)
    : { data: [] };

  const header = [
    "ref",
    "starts_at",
    "ends_at",
    "patient_name",
    "whatsapp",
    "age",
    "gender",
    "visit_type",
    "status",
    "created_at",
  ];
  const lines = [header.join(",")];
  for (const row of appointments ?? []) {
    const slot = slots?.find((s) => s.id === row.slot_id);
    lines.push(
      [
        row.public_ref,
        slot?.starts_at ?? "",
        slot?.ends_at ?? "",
        row.patient_name,
        row.whatsapp_e164,
        String(row.age),
        row.gender,
        row.visit_type,
        row.status,
        row.created_at,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="opd-appointments.csv"',
    },
  });
}
