import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ManageAppointment } from "@/components/booking/manage-appointment";
import { formatSlotDisplay } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "Manage appointment",
  robots: { index: false, follow: false },
};

type RpcAppointment = {
  public_ref: string;
  patient_name: string;
  status: string;
  starts_at: string;
  ends_at: string;
  visit_type: string;
};

function asAppointment(value: unknown): RpcAppointment | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.ok === false) return null;
  if (
    typeof record.public_ref !== "string" ||
    typeof record.patient_name !== "string" ||
    typeof record.status !== "string" ||
    typeof record.starts_at !== "string" ||
    typeof record.ends_at !== "string" ||
    typeof record.visit_type !== "string"
  ) {
    return null;
  }
  return {
    public_ref: record.public_ref,
    patient_name: record.patient_name,
    status: record.status,
    starts_at: record.starts_at,
    ends_at: record.ends_at,
    visit_type: record.visit_type,
  };
}

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { token } = await params;
  const { action } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const supabase = await createSupabaseServer();
  if (!supabase) {
    return (
      <SiteShell showSticky={false}>
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="font-display text-2xl text-ink">Manage appointment</h1>
          <p className="mt-3 text-sm text-muted">
            Online manage links are not connected yet. Please write on WhatsApp
            to reschedule or cancel.
          </p>
        </div>
      </SiteShell>
    );
  }

  const { data } = await supabase.rpc("get_appointment_by_token", {
    p_token: token,
  });
  const appointment = asAppointment(data);
  if (!appointment) notFound();

  return (
    <SiteShell showSticky={false}>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-2xl text-ink">Manage appointment</h1>
        <p className="mt-2 text-sm text-muted">Reference {appointment.public_ref}</p>
        <p className="mt-4 text-sm text-ink">
          {formatSlotDisplay(
            new Date(appointment.starts_at),
            new Date(appointment.ends_at),
          )}{" "}
          IST
        </p>
        <p className="mt-1 text-sm text-muted">
          {appointment.patient_name} · {appointment.visit_type.replace("_", " ")} ·{" "}
          {appointment.status}
        </p>
        <ManageAppointment
          token={token}
          status={appointment.status}
          initialAction={action === "cancel" ? "cancel" : undefined}
        />
      </div>
    </SiteShell>
  );
}
