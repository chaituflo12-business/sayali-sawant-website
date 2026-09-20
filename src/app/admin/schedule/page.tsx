import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { ScheduleEditor } from "@/components/admin/schedule-editor";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const { data } = await gate.supabase
    .from("opd_schedule")
    .select("*")
    .order("weekday")
    .order("start_time");

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Schedule template</h1>
      <p className="mt-2 text-sm text-muted">
        Weekday 0 is Sunday. Changes apply to newly materialised slots (nightly
        job, next 21 days).
      </p>
      <ScheduleEditor rows={data ?? []} />
    </div>
  );
}
