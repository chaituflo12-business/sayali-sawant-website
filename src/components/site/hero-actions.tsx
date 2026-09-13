"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";

export function HeroActions({ directionsUrl }: { directionsUrl: string }) {
  const { scrollOrOpen } = useBooking();

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={scrollOrOpen}
        className={cn(buttonVariants({ size: "lg" }))}
      >
        Book OPD slot
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
