import "server-only";
import {
  OPD_HOURS,
  SLOT_CAPACITY,
  SLOT_MINUTES,
} from "@/config/site";
import {
  addIstDays,
  formatIstDate,
  istLocalToUtc,
  istWeekday,
  parseHHmm,
  startOfIstDay,
} from "@/lib/datetime";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { DayAvailability, DaySummary, PublicSlot, SlotSummary } from "@/lib/slot-types";

export type { DayAvailability, DaySummary, PublicSlot, SlotSummary };

function stubId(startsAtIso: string): string {
  const hex = startsAtIso.replace(/\D/g, "").padEnd(12, "0").slice(0, 12);
  return `00000000-0000-4000-8000-${hex}`;
}

function generateStubSlots(from: Date, to: Date): PublicSlot[] {
  const slots: PublicSlot[] = [];
  const startDay = startOfIstDay(from);
  const now = Date.now();

  for (let i = 0; i < 21; i += 1) {
    const day = addIstDays(startDay, i);
    if (day >= to) break;
    const weekday = istWeekday(day) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const template = OPD_HOURS[weekday];
    if (!template || template.closed) continue;

    const parts = formatIstDate(day).split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const date = Number(parts[2]);

    for (const session of template.sessions) {
      const start = parseHHmm(session.start);
      const end = parseHHmm(session.end);
      let minutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;
      while (minutes + SLOT_MINUTES <= endMinutes) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const starts = istLocalToUtc(year, month, date, hour, minute);
        const ends = istLocalToUtc(
          year,
          month,
          date,
          hour,
          minute + SLOT_MINUTES,
        );
        if (starts.getTime() > now && starts < to) {
          slots.push({
            slotId: stubId(starts.toISOString()),
            startsAt: starts.toISOString(),
            endsAt: ends.toISOString(),
            remaining: SLOT_CAPACITY,
          });
        }
        minutes += SLOT_MINUTES;
      }
    }
  }

  return slots;
}

function summariseDays(slots: PublicSlot[], from: Date): DaySummary[] {
  const days: DaySummary[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = addIstDays(from, i);
    const key = formatIstDate(day);
    const weekday = istWeekday(day);
    const template = OPD_HOURS[weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6];
    const ofDay = slots.filter((s) => formatIstDate(new Date(s.startsAt)) === key);
    const remaining = ofDay.reduce((sum, s) => sum + s.remaining, 0);
    const total = ofDay.length;
    let status: DayAvailability = "available";
    if (!template || template.closed) status = "closed";
    else if (total === 0 || remaining === 0) status = "full";
    else if (remaining <= Math.max(2, Math.floor(total * 0.25))) status = "limited";
    days.push({ date: key, weekday, status, remaining, total });
  }
  return days;
}

export async function getAvailableSlots(
  from: Date,
  to: Date,
): Promise<{ live: boolean; slots: PublicSlot[] }> {
  const supabase = await createSupabaseServer();
  if (supabase) {
    const { data, error } = await supabase.rpc("get_available_slots", {
      from_date: from.toISOString(),
      to_date: to.toISOString(),
    });
    if (!error && data) {
      return {
        live: true,
        slots: data.map((row) => ({
          slotId: row.slot_id,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          remaining: row.remaining,
        })),
      };
    }
  }
  return { live: false, slots: generateStubSlots(from, to) };
}

export async function getSlotSummary(): Promise<SlotSummary> {
  const from = new Date();
  const to = addIstDays(startOfIstDay(from), 7);
  const { live, slots } = await getAvailableSlots(from, to);
  const next = slots[0]?.startsAt ?? null;
  return {
    live,
    nextAvailable: next,
    days: summariseDays(slots, startOfIstDay(from)),
  };
}

export async function getSlotsForDay(dateIst: string): Promise<{
  live: boolean;
  slots: PublicSlot[];
}> {
  const [year, month, day] = dateIst.split("-").map(Number);
  const from = istLocalToUtc(year, month, day, 0, 0);
  const to = istLocalToUtc(year, month, day + 1, 0, 0);
  const now = new Date();
  const start = from < now ? now : from;
  return getAvailableSlots(start, to);
}
