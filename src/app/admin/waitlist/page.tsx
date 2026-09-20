import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { formatIstDate } from "@/lib/datetime";
import { WaitlistTable } from "@/components/admin/waitlist-table";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const today = formatIstDate(new Date());
  const { data: rows } = await gate.supabase
    .from("waitlist")
    .select(
      "id, patient_name, whatsapp_e164, preferred_date, visit_type, notified_at, hold_expires_at, opted_out",
    )
    .gte("preferred_date", today)
    .order("preferred_date")
    .order("created_at")
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Waitlist</h1>
      <p className="mt-1 text-sm text-muted">
        Patients who asked to be told if a slot opens. Offering a slot holds it
        for 2 hours.
      </p>
      <WaitlistTable rows={rows ?? []} />
    </div>
  );
}
