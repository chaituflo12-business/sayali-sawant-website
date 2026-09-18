import type { SessionHours } from "@/config/site";

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatSession(session: SessionHours): string {
  return `${to12h(session.start)} – ${to12h(session.end)}`;
}
