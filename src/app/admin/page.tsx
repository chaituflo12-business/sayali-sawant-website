import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { startOfIstDay, addIstDays } from "@/lib/datetime";
import { TodayList } from "@/components/admin/today-list";

export const dynamic = "force-dynamic";

export default async function AdminTodayPage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const from = startOfIstDay(new Date());
  const to = addIstDays(from, 1);

  const { data: slots } = await gate.supabase
    .from("slots")
    .select("id, starts_at, ends_at, blocked")
    .gte("starts_at", from.toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at");

  const slotIds = (slots ?? []).map((s) => s.id);
  const { data: appointments } = slotIds.length
    ? await gate.supabase
        .from("appointments")
        .select(
          "id, public_ref, patient_name, whatsapp_e164, age, visit_type, status, slot_id, report_ready_at, next_visit_suggested_at",
        )
        .in("slot_id", slotIds)
    : { data: [] };

  const rows = (appointments ?? [])
    .map((appt) => {
      const slot = slots?.find((s) => s.id === appt.slot_id);
      return slot
        ? {
            ...appt,
            starts_at: slot.starts_at,
            ends_at: slot.ends_at,
          }
        : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Today</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {gate.staff.display_name} ({gate.staff.role})
      </p>
      <TodayList rows={rows} />
    </div>
  );
}
