import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { addIstDays, formatIstTime, startOfIstDay } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AdminWeekPage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const from = startOfIstDay(new Date());
  const to = addIstDays(from, 7);

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
        .select("id, patient_name, status, slot_id")
        .in("slot_id", slotIds)
    : { data: [] };

  const byDay = new Map<string, typeof slots>();
  for (const slot of slots ?? []) {
    const key = new Date(slot.starts_at).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const list = byDay.get(key) ?? [];
    list.push(slot);
    byDay.set(key, list);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Week</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-7">
        {[...byDay.entries()].map(([day, daySlots]) => (
          <section key={day} className="rounded-xl border border-border bg-surface p-3">
            <h2 className="text-sm font-medium text-ink">{day}</h2>
            <ul className="mt-2 space-y-2">
              {(daySlots ?? []).map((slot) => {
                const appt = appointments?.find((a) => a.slot_id === slot.id);
                return (
                  <li key={slot.id} className="text-xs text-muted">
                    {formatIstTime(new Date(slot.starts_at))}
                    {slot.blocked
                      ? " · blocked"
                      : appt
                        ? ` · ${appt.patient_name}`
                        : " · open"}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
