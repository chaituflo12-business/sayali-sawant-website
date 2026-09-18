export function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function buildAppointmentIcs(input: {
  uid: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  description: string;
}): string {
  const stamp = toUtcStamp(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dr Sayali Sawant//OPD//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}@drsayalisawant.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcStamp(input.startsAt)}`,
    `DTEND:${toUtcStamp(input.endsAt)}`,
    `SUMMARY:${icsEscape("OPD appointment with Dr. Sayali Sawant")}`,
    `LOCATION:${icsEscape(input.location)}`,
    `DESCRIPTION:${icsEscape(input.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
