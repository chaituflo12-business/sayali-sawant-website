"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCycleReminder } from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";
import {
  reminderKindLabels,
  reminderKindValues,
} from "@/lib/validation/appointment";
import { useToast } from "@/components/ui/toast";

export function ReminderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kind, setKind] =
    useState<(typeof reminderKindValues)[number]>("scan_day");
  const [remindOn, setRemindOn] = useState("");
  const [remindAt, setRemindAt] = useState("08:00");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createCycleReminder({
      patientName,
      whatsapp,
      kind,
      remindOn,
      remindAt,
      note,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setPatientName("");
    setWhatsapp("");
    setNote("");
    toast({ title: "Reminder saved." });
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <label className="block text-sm">
        <span className="text-ink">Patient name</span>
        <input
          required
          minLength={2}
          maxLength={80}
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink">WhatsApp mobile</span>
        <span className="mt-1 flex overflow-hidden rounded-xl border border-border">
          <span className="inline-flex min-h-11 items-center bg-primary-soft px-3 text-sm text-ink">
            +91
          </span>
          <input
            required
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="min-h-11 w-full px-3 text-ink"
            placeholder="9XXXXXXXXX"
          />
        </span>
      </label>
      <label className="block text-sm">
        <span className="text-ink">Kind</span>
        <select
          value={kind}
          onChange={(e) =>
            setKind(e.target.value as (typeof reminderKindValues)[number])
          }
          className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
        >
          {reminderKindValues.map((value) => (
            <option key={value} value={value}>
              {reminderKindLabels[value]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink">Date</span>
          <input
            required
            type="date"
            value={remindOn}
            onChange={(e) => setRemindOn(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink">Time (IST)</span>
          <input
            required
            type="time"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-ink">Note (optional)</span>
        <input
          maxLength={120}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Day 9 scan"
          className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
        />
      </label>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <button
        type="submit"
        className={cn(buttonVariants(), "w-full sm:w-auto")}
        disabled={submitting}
      >
        {submitting ? "Please wait…" : "Save reminder"}
      </button>
    </form>
  );
}
