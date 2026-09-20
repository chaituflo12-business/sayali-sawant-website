"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBooking } from "@/components/site/booking-provider";
import { BookingFlow } from "@/components/booking/booking-flow";

export function BookingSheet() {
  const { open, setOpen } = useBooking();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="overflow-y-auto" data-lenis-prevent>
        <SheetHeader>
          <SheetTitle>Book OPD slot</SheetTitle>
          <SheetDescription>
            Pick a day, a 15-minute time in IST, then your details.
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-8 pt-2">
          <BookingFlow compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
