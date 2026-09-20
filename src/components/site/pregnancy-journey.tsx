import {
  CalendarDays,
  Clock,
  HeartPulse,
  ScanLine,
  Syringe,
  TestTube,
  TriangleAlert,
} from "lucide-react";
import {
  MILESTONES,
  SCAN_LEGAL_NOTE,
  TRIMESTERS,
  WARNING_SIGNS,
  type JourneyItemKind,
  type Trimester,
} from "@/config/pregnancy";
import { Reveal } from "@/components/site/reveal";
import { BookCta } from "@/components/booking/book-cta";
import { MobileCollapse } from "@/components/site/mobile-collapse";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<JourneyItemKind, typeof CalendarDays> = {
  visit: CalendarDays,
  scan: ScanLine,
  test: TestTube,
  vaccine: Syringe,
  guidance: HeartPulse,
};

const KIND_LABEL: Record<JourneyItemKind, string> = {
  visit: "Visit",
  scan: "Scan",
  test: "Test",
  vaccine: "Vaccine",
  guidance: "Care",
};

// One pastel per trimester, carried from the week bar into its card.
const TONE: Record<
  Trimester["id"],
  { bar: string; card: string; disc: string }
> = {
  first: {
    bar: "bg-pastel_petal-500",
    card: "bg-pastel_petal-900",
    disc: "bg-pastel_petal-700",
  },
  second: {
    bar: "bg-thistle-500",
    card: "bg-thistle-900",
    disc: "bg-thistle-700",
  },
  third: {
    bar: "bg-sky_blue-500",
    card: "bg-sky_blue-900",
    disc: "bg-sky_blue-700",
  },
};

const TOTAL_WEEKS = 40;

function WeekBar() {
  return (
    <div className="mt-10" aria-hidden>
      {/* Milestone labels sit above the bar on wide screens only; on a phone
          they would collide, and the cards below carry the same facts. */}
      <div className="relative hidden h-10 md:block">
        {MILESTONES.map((m, i) => (
          <span
            key={m.label}
            className={cn(
              "absolute -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted",
              i % 2 === 0 ? "bottom-5" : "bottom-0",
            )}
            style={{ left: `${(m.week / TOTAL_WEEKS) * 100}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="relative flex h-3 overflow-hidden rounded-full">
        {TRIMESTERS.map((t) => (
          <div
            key={t.id}
            className={TONE[t.id].bar}
            style={{ width: `${((t.to - t.from + 1) / TOTAL_WEEKS) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative hidden h-0 md:block">
        {MILESTONES.map((m) => (
          <span
            key={m.label}
            className="absolute -mt-[0.6rem] h-2 w-2 -translate-x-1/2 rounded-full border-2 border-surface bg-ink"
            style={{ left: `${(m.week / TOTAL_WEEKS) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex text-xs text-muted">
        {TRIMESTERS.map((t) => (
          <span
            key={t.id}
            style={{ width: `${((t.to - t.from + 1) / TOTAL_WEEKS) * 100}%` }}
          >
            {t.name.replace(" trimester", "")}
            <span className="hidden sm:inline">
              {" "}
              · wk {t.from}-{t.to}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PregnancyJourney() {
  return (
    <section
      id="pregnancy-journey"
      className="scroll-mt-24 bg-surface-warm py-16 md:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Antenatal care
          </p>
          <h2 className="font-display mt-2 text-2xl text-ink md:text-3xl">
            Your pregnancy, trimester by trimester
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            A typical schedule of visits, scans and tests. Your own plan may
            differ depending on your health and your history, and Dr. Sawant
            will go through it with you at your first visit.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <WeekBar />
        </Reveal>

        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {TRIMESTERS.map((t, index) => (
            <Reveal
              key={t.id}
              as="li"
              delay={index * 120}
              className={cn(
                "card-soft flex flex-col rounded-2xl p-5",
                TONE[t.id].card,
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl text-ink">{t.name}</h3>
                <span className="shrink-0 text-sm text-muted">{t.weeks}</span>
              </div>
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface/70 px-3 py-2 text-sm text-ink">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                {t.cadence}
              </p>
              <MobileCollapse
                defaultOpen={index === 0}
                showLabel={`Show ${t.items.length} visits, scans and tests`}
              >
                <ul className="mt-4 space-y-4">
                  {t.items.map((item) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <li key={item.title} className="flex gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink",
                            TONE[t.id].disc,
                          )}
                          aria-hidden
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-primary">
                            {KIND_LABEL[item.kind]} · {item.when}
                          </p>
                          <p className="mt-0.5 font-medium text-ink">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {item.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </MobileCollapse>
            </Reveal>
          ))}
        </ol>

        <Reveal
          delay={120}
          className="mt-8 grid gap-6 rounded-2xl border border-warning bg-warning-soft p-5 md:grid-cols-[auto_1fr] md:p-6"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-warning"
            aria-hidden
          >
            <TriangleAlert className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg text-ink">
              Go to the hospital straight away, day or night, if you notice:
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-base text-ink sm:grid-cols-2">
              {WARNING_SIGNS.map((sign) => (
                <li key={sign} className="flex gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                    aria-hidden
                  />
                  {sign}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">
              Do not wait for an OPD appointment. Call 108 or 112 if you need an
              ambulance.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-muted">{SCAN_LEGAL_NOTE}</p>
          <BookCta
            label="Book OPD slot"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}
