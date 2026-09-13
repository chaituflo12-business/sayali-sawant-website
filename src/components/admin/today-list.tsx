"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { markAppointmentStatus } from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";
import { formatIstTime } from "@/lib/datetime";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export type TodayRow = {
  id: string;
  public_ref: string;
  patient_name: string;
  whatsapp_e164: string;
  age: number;
  visit_type: string;
  status: string;
  starts_at: string;
  ends_at: string;
};

export function TodayList({ rows }: { rows: TodayRow[] }) {
  const [items, setItems] = useState(rows);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: "completed" | "no_show") {
    const result = await markAppointmentStatus(id, status);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  }

  if (items.length === 0) {
    return <p className="mt-6 text-sm text-muted">No appointments today.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {error ? <p className="text-sm text-error">{error}</p> : null}
      {items.map((row) => (
        <li
          key={row.id}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-ink">
            {formatIstTime(new Date(row.starts_at))} · {row.patient_name} ({row.age})
          </p>
          <p className="mt-1 text-xs text-muted">
            {row.public_ref} · {row.visit_type.replaceAll("_", " ")} · {row.status}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${row.whatsapp_e164}`}
              className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}
              aria-label={`Call ${row.patient_name}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/${row.whatsapp_e164.replace(/\D/g, "")}`}
              className={cn(buttonVariants({ variant: "whatsapp", size: "icon" }))}
              aria-label={`WhatsApp ${row.patient_name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }))}
              onClick={() => setStatus(row.id, "completed")}
            >
              Completed
            </button>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }))}
              onClick={() => setStatus(row.id, "no_show")}
            >
              No-show
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
