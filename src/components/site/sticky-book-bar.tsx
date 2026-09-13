"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";

export function StickyBookBar() {
  const { openBooking } = useBooking();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-3 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={openBooking}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Book OPD slot
      </button>
    </div>
  );
}
