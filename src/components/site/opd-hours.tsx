import type { OpdDay } from "@/config/site";
import type { DaySummary, SlotSummary } from "@/lib/slot-types";
import { formatSession } from "@/lib/hours";
import { Reveal, RevealGroup } from "@/components/site/reveal";

function statusClass(status: DaySummary["status"]) {
  if (status === "available") return "border-accent bg-accent-soft text-ink";
  if (status === "limited") return "border-highlight bg-highlight-soft text-ink";
  if (status === "full") return "border-border bg-background text-muted";
  return "border-border bg-background text-muted";
}

function statusLabel(status: DaySummary["status"]) {
  if (status === "available") return "Available";
  if (status === "limited") return "Limited";
  if (status === "full") return "Full";
  return "Closed";
}

export function OpdHours({
  summary,
  hours,
}: {
  summary: SlotSummary;
  hours: OpdDay[];
}) {
  const anyBreak = hours.some((day) => !day.closed && day.breakLabel);

  return (
    <section id="opd-hours" className="scroll-mt-24 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          OPD hours in Goregaon West
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Appointments are in 15-minute slots. Times are shown in Indian Standard
          Time (IST).
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Weekly OPD hours</caption>
            <thead className="border-b border-border bg-primary-soft">
              <tr>
                <th className="px-4 py-3 font-medium text-ink">Day</th>
                <th className="px-4 py-3 font-medium text-ink">Sessions</th>
                {anyBreak ? (
                  <th className="px-4 py-3 font-medium text-ink">Break</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {hours.map((day) => (
                <tr key={day.label} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{day.label}</td>
                  <td className="px-4 py-3 text-muted">
                    {day.closed
                      ? "Closed"
                      : day.sessions.map((s) => formatSession(s)).join(" · ")}
                  </td>
                  {anyBreak ? (
                    <td className="px-4 py-3 text-muted">
                      {day.closed || !day.breakLabel ? "—" : day.breakLabel}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </Reveal>

        <Reveal delay={120}>
          <h3 className="font-display mt-8 text-lg text-ink">Next 7 days</h3>
        </Reveal>
        <RevealGroup
          as="ul"
          itemAs="li"
          step={60}
          className="mt-3 grid grid-cols-7 gap-2"
        >
          {summary.days.map((day) => {
            const label = new Date(`${day.date}T00:00:00+05:30`).toLocaleDateString(
              "en-GB",
              { weekday: "short", day: "numeric", timeZone: "Asia/Kolkata" },
            );
            return (
              <div
                key={day.date}
                className={`h-full rounded-xl border px-1 py-3 text-center text-xs ${statusClass(day.status)}`}
              >
                <span className="block font-medium">{label}</span>
                <span className="mt-1 block">{statusLabel(day.status)}</span>
              </div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
