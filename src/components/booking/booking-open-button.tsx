"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";

export function BookingOpenButton({ className }: { className?: string }) {
  const { openBooking } = useBooking();
  return (
    <button
      type="button"
      onClick={openBooking}
      className={cn(buttonVariants({ size: "lg" }), "w-full", className)}
    >
      Book OPD slot
    </button>
  );
}
