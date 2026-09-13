"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import {
  markAppointmentStatus,
  suggestNextVisit,
  toggleReportReady,
} from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";
import { formatIstTime } from "@/lib/datetime";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useToast } from "@/components/ui/toast";

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
  report_ready_at: string | null;
  next_visit_suggested_at: string | null;
};

const NEXT_VISIT_OPTIONS = [
  { weeks: 4 as const, label: "4 weeks" },
  { weeks: 2 as const, label: "2 weeks" },
  { weeks: 1 as const, label: "1 week" },
];

export function TodayList({ rows }: { rows: TodayRow[] }) {
  const [items, setItems] = useState(rows);
  const [error, setError] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const { toast } = useToast();

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

  async function onToggleReport(id: string, ready: boolean) {
    setError(null);
    const result = await toggleReportReady(id, ready);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, report_ready_at: ready ? new Date().toISOString() : null }
          : row,
      ),
    );
    toast({ title: ready ? "Marked report ready." : "Report flag cleared." });
  }

  async function onSuggestNextVisit(id: string, weeks: 1 | 2 | 4) {
    setError(null);
    setPending(id);
    const result = await suggestNextVisit(id, weeks);
    setPending(null);
    setOpenPopover(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, next_visit_suggested_at: new Date().toISOString() }
          : row,
      ),
    );
    toast({
      title: "Next visit held",
      description: `${result.data.display} · held for ${result.data.holdHours} hours`,
    });
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
            {formatIstTime(new Date(row.starts_at))} · {row.patient_name} (
            {row.age})
          </p>
          <p className="mt-1 text-xs text-muted">
            {row.public_ref} · {row.visit_type.replaceAll("_", " ")} ·{" "}
            {row.status}
            {row.next_visit_suggested_at ? " · next visit held" : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${row.whatsapp_e164}`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "icon" }),
              )}
              aria-label={`Call ${row.patient_name}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/${row.whatsapp_e164.replace(/\D/g, "")}`}
              className={cn(
                buttonVariants({ variant: "whatsapp", size: "icon" }),
              )}
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
            <div className="relative">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "secondary" }))}
                disabled={pending === row.id}
                aria-expanded={openPopover === row.id}
                onClick={() =>
                  setOpenPopover(openPopover === row.id ? null : row.id)
                }
              >
                Suggest next visit
              </button>
              {openPopover === row.id ? (
                <div className="absolute left-0 z-10 mt-1 w-40 rounded-xl border border-border bg-surface p-1 shadow-sm">
                  {NEXT_VISIT_OPTIONS.map((option) => (
                    <button
                      key={option.weeks}
                      type="button"
                      className="block min-h-11 w-full rounded-lg px-3 text-left text-sm text-ink hover:bg-primary-soft"
                      onClick={() => onSuggestNextVisit(row.id, option.weeks)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={row.report_ready_at !== null}
              onChange={(e) => onToggleReport(row.id, e.target.checked)}
              className="h-5 w-5"
            />
            <span>Report ready</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
