"use client";

import { useState } from "react";
import {
  CLINIC_ADDRESS,
  GOOGLE_MAPS_DIR_URL,
  GOOGLE_MAPS_EMBED_QUERY,
  LANDMARKS,
  LOCALITY,
  NEAREST_STATION,
  PARKING_NOTE,
} from "@/config/site";
import { buttonVariants, cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

export function Location() {
  const [showMap, setShowMap] = useState(false);

  return (
    <section id="location" className="scroll-mt-24 bg-background py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Women&apos;s health clinic, Goregaon West
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink">{CLINIC_ADDRESS}</p>
          <p className="mt-2 text-base text-muted">{LANDMARKS}</p>
          <p className="mt-3 text-base text-muted">
            <span className="font-medium text-ink">Parking: </span>
            {PARKING_NOTE}
          </p>
          <p className="mt-2 text-base text-muted">
            <span className="font-medium text-ink">Nearest station: </span>
            {NEAREST_STATION}
          </p>
          <a
            href={GOOGLE_MAPS_DIR_URL}
            className={cn(buttonVariants(), "mt-6")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
          </a>
        </Reveal>

        <Reveal
          variant="scale"
          delay={160}
          className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
        >
          {showMap ? (
            <iframe
              title={`Map of Dr. Sayali Sawant clinic, ${LOCALITY}`}
              src={`https://www.google.com/maps?q=${GOOGLE_MAPS_EMBED_QUERY}&output=embed`}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="flex h-72 w-full flex-col items-center justify-center gap-2 bg-primary-soft px-4 text-center"
            >
              <span className="font-display text-base text-ink">
                Tap to load Google Maps
              </span>
              <span className="text-sm text-muted">
                The map is loaded only after you ask for it.
              </span>
            </button>
          )}
        </Reveal>
      </div>
    </section>
  );
}
