import Image from "next/image";
import {
  DOCTOR_NAME,
  GOOGLE_MAPS_DIR_URL,
  LOCALITY,
  MMC_REG_NO,
  PROFILE_PHOTO,
  CITY,
} from "@/config/site";
import { formatSlotStarts } from "@/lib/datetime";
import type { SlotSummary } from "@/lib/slot-types";
import { HeroActions } from "@/components/site/hero-actions";

export function Hero({ summary }: { summary: SlotSummary }) {
  const nextLabel = summary.nextAvailable
    ? formatSlotStarts(new Date(summary.nextAvailable))
    : "Check the booking card for the next open time";

  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
        <div>
          <p className="text-sm font-medium text-primary">
            {DOCTOR_NAME} · {LOCALITY}, {CITY}
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight text-ink md:text-4xl">
            Obstetrician, Gynaecologist & IVF Specialist in Goregaon West,
            Mumbai
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Unhurried, evidence-based consultations. Options explained in plain
            language — in English, Hindi or Marathi.
          </p>
          <HeroActions directionsUrl={GOOGLE_MAPS_DIR_URL} />
          <p className="mt-5 text-sm font-medium text-accent">
            Next available slot: {nextLabel}
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-sm">
          <div
            className="pointer-events-none absolute -left-6 -top-6 h-40 w-40 rounded-full bg-baby_pink-500 opacity-60 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 -right-4 h-48 w-48 rounded-full bg-icy_blue-500 opacity-60 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
            <Image
              src={PROFILE_PHOTO}
              alt={`${DOCTOR_NAME}, female gynaecologist in Goregaon West, Mumbai`}
              width={720}
              height={900}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          <figcaption className="relative mt-3 flex flex-wrap gap-2">
            {["MBBS", "DNB Obs & Gyn", `MMC Reg. ${MMC_REG_NO}`].map((chip) => (
              <span
                key={chip}
                className="rounded-xl border border-border bg-primary-soft px-3 py-2 text-xs font-medium text-ink"
              >
                {chip}
              </span>
            ))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
