import "server-only";
import { OPD_HOURS, type OpdDay, type WeekdayIndex } from "@/config/site";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatSession } from "@/lib/hours";

const LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "18:00:00" and "18:00" both arrive from Postgres depending on the driver. */
function hhmm(value: string): string {
  return value.slice(0, 5);
}

function breakLabelFor(sessions: { start: string; end: string }[]): string | undefined {
  if (sessions.length < 2) return undefined;
  return `${formatSession({ start: sessions[0].end, end: sessions[1].start })}`;
}

function toDays(
  rows: { weekday: number; start_time: string; end_time: string }[],
): OpdDay[] {
  return LABELS.map((label, index) => {
    const sessions = rows
      .filter((r) => r.weekday === index)
      .map((r) => ({ start: hhmm(r.start_time), end: hhmm(r.end_time) }))
      .sort((a, b) => a.start.localeCompare(b.start));
    return {
      weekday: index as WeekdayIndex,
      label,
      closed: sessions.length === 0,
      sessions,
      breakLabel: breakLabelFor(sessions),
    };
  });
}

/**
 * The weekly OPD template as patients should see it.
 *
 * Reads the same `opd_schedule` rows the admin editor writes, so changing the
 * hours in /admin/schedule updates the public table, the footer and the
 * openingHoursSpecification in the SEO schema. Falls back to the config in
 * src/config/site.ts when Supabase is not configured or the table is empty.
 */
export async function resolveOpdHours(): Promise<OpdDay[]> {
  try {
    const supabase = await createSupabaseServer();
    if (!supabase) return OPD_HOURS;
    const { data, error } = await supabase.rpc("get_opd_schedule");
    if (error || !data || data.length === 0) return OPD_HOURS;
    return toDays(data);
  } catch {
    return OPD_HOURS;
  }
}
