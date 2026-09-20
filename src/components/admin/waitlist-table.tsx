"use client";

import { useMemo, useState } from "react";
import { offerWaitlistSlot } from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";
import { visitTypeLabels } from "@/lib/validation/appointment";
import { useToast } from "@/components/ui/toast";

export type WaitlistRow = {
  id: string;
  patient_name: string;
  whatsapp_e164: string;
  preferred_date: string;
  visit_type: keyof typeof visitTypeLabels;
  notified_at: string | null;
  hold_expires_at: string | null;
  opted_out: boolean;
};

export function WaitlistTable({ rows }: { rows: WaitlistRow[] }) {
  const [items, setItems] = useState(rows);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const { toast } = useToast();

  const byDate = useMemo(() => {
    const groups = new Map<string, WaitlistRow[]>();
    for (const row of items) {
      const list = groups.get(row.preferred_date) ?? [];
      list.push(row);
      groups.set(row.preferred_date, list);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  async function onOffer(id: string) {
    setError(null);
    setPending(id);
    const result = await offerWaitlistSlot(id);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems((current) =>
      current.map((row) =>
        row.id === id ? { ...row, notified_at: new Date().toISOString() } : row,
      ),
    );
    toast({ title: "Slot offered", description: result.data.display });
  }

  if (items.length === 0) {
    return <p className="mt-6 text-sm text-muted">Nobody is waiting.</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      {error ? <p className="text-sm text-error">{error}</p> : null}
      {byDate.map(([date, list]) => (
        <section key={date}>
          <h2 className="font-display text-lg text-ink">{date}</h2>
          <ul className="mt-3 space-y-3">
            {list.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-ink">{row.patient_name}</p>
                <p className="mt-1 text-xs text-muted">
                  {row.whatsapp_e164} · {visitTypeLabels[row.visit_type]}
                  {row.opted_out ? " · opted out" : ""}
                  {row.notified_at ? " · offered" : ""}
                </p>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "secondary" }), "mt-3")}
                  disabled={
                    pending === row.id || row.notified_at !== null || row.opted_out
                  }
                  onClick={() => onOffer(row.id)}
                >
                  {pending === row.id ? "Holding…" : "Offer slot"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
