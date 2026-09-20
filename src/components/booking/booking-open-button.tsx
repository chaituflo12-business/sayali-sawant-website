"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";
import { ArrowChip } from "@/components/site/arrow-chip";

export function BookingOpenButton({ className }: { className?: string }) {
  const { openBooking } = useBooking();
  return (
    <button
      type="button"
      onClick={openBooking}
      className={cn(
        buttonVariants({ size: "lg" }),
        "group w-full gap-3 pr-5",
        className,
      )}
    >
      Book OPD slot
      <ArrowChip />
    </button>
  );
}
