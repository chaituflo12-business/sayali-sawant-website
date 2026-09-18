export const IST = "Asia/Kolkata";

const weekdayShort = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  weekday: "short",
});
const dayMonth = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  day: "numeric",
  month: "short",
});
const time12 = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const isoDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatIstDate(date: Date): string {
  return isoDate.format(date);
}

export function formatIstTime(date: Date): string {
  return time12.format(date).toUpperCase();
}

export function formatSlotDisplay(startsAt: Date, endsAt: Date): string {
  const day = weekdayShort.format(startsAt);
  const md = dayMonth.format(startsAt);
  return `${day} ${md}, ${formatIstTime(startsAt)}–${formatIstTime(endsAt)}`;
}

export function formatSlotStarts(startsAt: Date): string {
  const day = weekdayShort.format(startsAt);
  const md = dayMonth.format(startsAt);
  return `${day} ${md}, ${formatIstTime(startsAt)}`;
}

export function istWeekday(date: Date): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: IST,
    weekday: "short",
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export function addIstDays(from: Date, days: number): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(from);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return istLocalToUtc(year, month, day + days, 0, 0);
}

export function istLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour - 5, minute - 30);
  return new Date(utcGuess);
}

export function startOfIstDay(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return istLocalToUtc(year, month, day, 0, 0);
}

export function parseHHmm(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}
