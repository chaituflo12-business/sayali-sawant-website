"use client";

import { useState } from "react";
import {
  deleteScheduleRow,
  saveScheduleRow,
} from "@/app/actions/admin";
import { buttonVariants, cn } from "@/lib/utils";

type Row = {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  capacity_per_slot: number;
  active: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleEditor({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState(rows);
  const [message, setMessage] = useState<string | null>(null);

  async function save(row: Row) {
    const result = await saveScheduleRow(row);
    setMessage(result.ok ? "Saved." : result.message);
  }

  async function remove(id: number) {
    const result = await deleteScheduleRow(id);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setItems((current) => current.filter((row) => row.id !== id));
  }

  async function add() {
    const result = await saveScheduleRow({
      weekday: 1,
      start_time: "10:00",
      end_time: "13:00",
      slot_minutes: 15,
      capacity_per_slot: 1,
      active: true,
    });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setItems((current) => [
      ...current,
      {
        id: result.data.id,
        weekday: 1,
        start_time: "10:00:00",
        end_time: "13:00:00",
        slot_minutes: 15,
        capacity_per_slot: 1,
        active: true,
      },
    ]);
  }

  function patch(id: number, update: Partial<Row>) {
    setItems((current) =>
      current.map((row) => (row.id === id ? { ...row, ...update } : row)),
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {message ? <p className="text-sm text-ink">{message}</p> : null}
      {items.map((row) => (
        <form
          key={row.id}
          className="grid gap-2 rounded-xl border border-border bg-surface p-4 md:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            void save(row);
          }}
        >
          <label className="text-xs">
            Day
            <select
              value={row.weekday}
              onChange={(e) => patch(row.id, { weekday: Number(e.target.value) })}
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-2"
            >
              {DAYS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Start
            <input
              type="time"
              value={row.start_time.slice(0, 5)}
              onChange={(e) => patch(row.id, { start_time: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-2"
            />
          </label>
          <label className="text-xs">
            End
            <input
              type="time"
              value={row.end_time.slice(0, 5)}
              onChange={(e) => patch(row.id, { end_time: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-2"
            />
          </label>
          <label className="text-xs">
            Minutes
            <input
              type="number"
              min={5}
              max={60}
              value={row.slot_minutes}
              onChange={(e) =>
                patch(row.id, { slot_minutes: Number(e.target.value) })
              }
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-2"
            />
          </label>
          <label className="text-xs">
            Capacity
            <input
              type="number"
              min={1}
              max={4}
              value={row.capacity_per_slot}
              onChange={(e) =>
                patch(row.id, { capacity_per_slot: Number(e.target.value) })
              }
              className="mt-1 min-h-11 w-full rounded-xl border border-border px-2"
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex min-h-11 items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={row.active}
                onChange={(e) => patch(row.id, { active: e.target.checked })}
              />
              Active
            </label>
            <button type="submit" className={cn(buttonVariants(), "flex-1")}>
              Save
            </button>
          </div>
          <button
            type="button"
            className="text-left text-xs text-error underline md:col-span-6"
            onClick={() => remove(row.id)}
          >
            Remove row
          </button>
        </form>
      ))}
      <button type="button" onClick={add} className={cn(buttonVariants({ variant: "secondary" }))}>
        Add session
      </button>
    </div>
  );
}
