"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";
import { ArrowChip } from "@/components/site/arrow-chip";

export function HeroActions({ directionsUrl }: { directionsUrl: string }) {
  const { scrollOrOpen } = useBooking();

  return (
    <div id="hero-cta" className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={scrollOrOpen}
        className={cn(buttonVariants({ size: "lg" }), "group gap-3 pr-5")}
      >
        Book OPD slot
        <ArrowChip />
      </button>
      <a
        href={directionsUrl}
        className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get directions
      </a>
    </div>
  );
}
