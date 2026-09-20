"use client";

import { Calendar } from "@/components/ui/calendar";
import { formatIstDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { DaySummary } from "@/lib/slot-types";

export function isBookable(day: DaySummary): boolean {
  return day.status === "available" || day.status === "limited";
}

/**
 * What a patient needs to know about a day in two words. "Closed" and "Full"
 * are deliberately different: one means come another weekday, the other means
 * the evening exists but is taken.
 */
export function availabilityLabel(day: DaySummary): string {
  if (day.status === "closed") return "Closed";
  if (day.total === 0) return "No slots";
  if (day.remaining <= 0) return "Full";
  if (day.status === "limited") return `${day.remaining} left`;
  return `${day.remaining} slots`;
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  // Pure calendar dates: formatting in UTC keeps the day stable in any zone.
  const date = new Date(Date.UTC(y, m - 1, d));
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
  return {
    weekday: fmt({ weekday: "short" }),
    day: d,
    month: fmt({ month: "short" }),
    long: fmt({ weekday: "long", day: "numeric", month: "long" }),
  };
}

// ------------------------------------------------------------- phone strip

export function DateStrip({
  days,
  selected,
  onSelect,
  className,
}: {
  days: DaySummary[];
  selected: string | null;
  onSelect: (date: string) => void;
  className?: string;
}) {
  const today = formatIstDate(new Date());

  return (
    <div
      className={cn(
        "-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]",
        className,
      )}
    >
      {days.map((day) => {
        const p = parts(day.date);
        const open = isBookable(day);
        const isSelected = selected === day.date;
        const label = availabilityLabel(day);
        return (
          <button
            key={day.date}
            type="button"
            disabled={!open}
            aria-pressed={isSelected}
            aria-label={`${p.long}, ${label}`}
            onClick={() => onSelect(day.date)}
            className={cn(
              "flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-2xl border px-2 py-3 transition-colors duration-200",
              isSelected
                ? "border-primary bg-primary text-white shadow-sm"
                : open
                  ? "border-border bg-surface text-ink"
                  : "cursor-not-allowed border-border bg-background text-muted",
            )}
          >
            <span className="text-xs font-medium uppercase tracking-wide">
              {day.date === today ? "Today" : p.weekday}
            </span>
            <span className="font-display mt-1 text-2xl leading-none">
              {p.day}
            </span>
            <span className="text-xs">{p.month}</span>
            <span
              className={cn(
                "mt-2 text-[11px] font-medium",
                isSelected
                  ? "text-primary-soft"
                  : day.status === "limited"
                    ? "text-warning"
                    : open
                      ? "text-accent"
                      : "text-muted",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------- desktop calendar

function toLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fromLocal(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function MonthCalendar({
  days,
  selected,
  onSelect,
}: {
  days: DaySummary[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const bookable = new Set(days.filter(isBookable).map((d) => d.date));
  const datesWhere = (test: (d: DaySummary) => boolean) =>
    days.filter(test).map((d) => toLocal(d.date));
  const first = days[0] ? toLocal(days[0].date) : undefined;
  const last = days.length ? toLocal(days[days.length - 1].date) : undefined;

  return (
    <div className="booking-calendar">
      <Calendar
        mode="single"
        required
        selected={selected ? toLocal(selected) : undefined}
        onSelect={(date: Date) => onSelect(fromLocal(date))}
        disabled={(date: Date) => !bookable.has(fromLocal(date))}
        defaultMonth={selected ? toLocal(selected) : first}
        startMonth={first}
        endMonth={last}
        weekStartsOn={1}
        showOutsideDays={false}
        modifiers={{
          open: datesWhere((d) => d.status === "available"),
          limited: datesWhere((d) => d.status === "limited"),
          // Struck through only when real slots exist and are all taken. A day
          // whose evening has already passed is simply unavailable, not "full".
          full: datesWhere((d) => d.total > 0 && d.remaining <= 0),
        }}
        modifiersClassNames={{
          open: "rdp-open",
          limited: "rdp-limited",
          full: "rdp-full",
        }}
      />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded border border-accent bg-accent-soft"
            aria-hidden
          />
          Open
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded border border-highlight bg-highlight-soft"
            aria-hidden
          />
          Few left
        </li>
        <li className="flex items-center gap-1.5">
          <span className="line-through" aria-hidden>
            18
          </span>
          Full
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded border border-border bg-background"
            aria-hidden
          />
          Closed
        </li>
      </ul>
    </div>
  );
}
