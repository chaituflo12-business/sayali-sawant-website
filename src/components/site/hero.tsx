import { Fragment } from "react";
import Image from "next/image";
import {
  DOCTOR_NAME,
  GOOGLE_MAPS_DIR_URL,
  LOCALITY,
  PROFILE_PHOTO,
  CITY,
} from "@/config/site";
import { formatSlotStarts } from "@/lib/datetime";
import type { SlotSummary } from "@/lib/slot-types";
import { HeroActions } from "@/components/site/hero-actions";

const HEADLINE =
  "Obstetrician, Gynaecologist & IVF Specialist in Goregaon West, Mumbai";

export function Hero({ summary }: { summary: SlotSummary }) {
  const nextLabel = summary.nextAvailable
    ? formatSlotStarts(new Date(summary.nextAvailable))
    : "Check the booking card for the next open time";

  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_18rem] md:py-16 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div>
          <p
            className="hero-in text-sm font-medium text-primary"
            style={{ animationDelay: "80ms" }}
          >
            {DOCTOR_NAME} · {LOCALITY}, {CITY}
          </p>
          <h1 className="font-display mt-2 text-[1.7rem] leading-tight text-balance text-ink sm:text-3xl lg:text-[2rem] xl:text-4xl">
            {HEADLINE.split(" ").map((word, index) => (
              <Fragment key={index}>
                <span className="word-mask">
                  <span
                    className="word-rise"
                    style={{ animationDelay: `${160 + index * 55}ms` }}
                  >
                    {word}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p
            className="hero-in mt-4 max-w-xl text-base leading-relaxed text-muted"
            style={{ animationDelay: "300ms" }}
          >
            Unhurried, evidence-based consultations. Options explained in plain
            language, in English, Hindi or Marathi.
          </p>
          <div className="hero-in" style={{ animationDelay: "420ms" }}>
            <HeroActions directionsUrl={GOOGLE_MAPS_DIR_URL} />
          </div>
          <p
            className="hero-in mt-5 text-sm font-medium text-accent"
            style={{ animationDelay: "540ms" }}
          >
            Next available slot: {nextLabel}
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-sm">
          <div className="relative">
            {/* One still, soft shape offset behind the photo. It gives depth
                without the floating glow blobs. */}
            <div
              className="fade-in-slow pointer-events-none absolute -bottom-4 -right-4 left-6 top-6 rounded-[2.25rem] bg-violet-900"
              aria-hidden
            />
            <div className="bezel relative">
              <div className="photo-unveil bezel-core relative overflow-hidden">
                <Image
                  src={PROFILE_PHOTO}
                  alt={`${DOCTOR_NAME}, female gynaecologist in Goregaon West, Mumbai`}
                  width={720}
                  height={900}
                  priority
                  className="photo-unveil-img h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
          <figcaption
            className="hero-in relative mt-6 flex flex-wrap gap-2"
            style={{ animationDelay: "900ms" }}
          >
            {["MBBS", "DNB Obs & Gyn", "Trained at KEM, Pune"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-primary-soft px-3 py-2 text-xs font-medium text-ink"
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
