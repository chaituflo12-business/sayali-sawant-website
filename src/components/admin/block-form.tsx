"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { blockRange } from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";

export function BlockForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("13:00");
  const [reason, setReason] = useState("Leave");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date) return;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startDate = new Date(date);
    startDate.setHours(sh, sm, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(eh, em, 0, 0);
    const result = await blockRange({
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      reason,
    });
    setMessage(result.ok ? `Blocked ${result.data.count} slot(s).` : result.message);
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink">Block time</h1>
      <p className="mt-2 text-sm text-muted">
        Use this for leave or surgery days. Existing open slots in the range are
        blocked.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Start
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-3"
            />
          </label>
          <label className="text-sm">
            End
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-3"
            />
          </label>
        </div>
        <label className="block text-sm">
          Reason
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        {message ? <p className="text-sm text-ink">{message}</p> : null}
        <button type="submit" className={cn(buttonVariants(), "w-full")}>
          Block these times
        </button>
      </form>
    </div>
  );
}
