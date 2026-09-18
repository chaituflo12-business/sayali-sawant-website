import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { formatIstDate } from "@/lib/datetime";
import { ReminderForm } from "@/components/admin/reminder-form";
import { reminderKindLabels } from "@/lib/validation/appointment";

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const today = formatIstDate(new Date());
  const { data: reminders } = await gate.supabase
    .from("cycle_reminders")
    .select("id, patient_name, whatsapp_e164, kind, remind_on, remind_at, note, sent_at")
    .gte("remind_on", today)
    .order("remind_on")
    .order("remind_at")
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Reminders</h1>
      <p className="mt-1 text-sm text-muted">
        Reminders are date prompts only. Do not type drug names, doses or
        instructions.
      </p>

      <ReminderForm />

      <h2 className="mt-8 font-display text-lg text-ink">Upcoming</h2>
      {(reminders ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-muted">No reminders scheduled.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {(reminders ?? []).map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-ink">
                {row.remind_on} at {row.remind_at.slice(0, 5)} ·{" "}
                {reminderKindLabels[row.kind]}
              </p>
              <p className="mt-1 text-xs text-muted">
                {row.patient_name} · {row.whatsapp_e164}
                {row.sent_at ? " · sent" : " · pending"}
              </p>
              {row.note ? (
                <p className="mt-1 text-xs text-muted">{row.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
