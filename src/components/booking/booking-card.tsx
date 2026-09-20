import { BookingFlow } from "@/components/booking/booking-flow";
import { BookingOpenButton } from "@/components/booking/booking-open-button";
import { WHATSAPP_AUTOMATION_LIVE } from "@/config/site";

export function BookingCard() {
  return (
    <section id="book" className="scroll-mt-24 py-14 md:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          Book an OPD appointment
        </h2>
        <p className="mt-2 text-base text-muted">
          Choose a day and time in Goregaon West.{" "}
          {WHATSAPP_AUTOMATION_LIVE
            ? "You will receive a WhatsApp message with directions."
            : "The clinic confirms your time on WhatsApp."}
        </p>
        <div className="bezel mt-8 hidden md:block">
          <div className="bezel-core bg-surface p-6">
            <BookingFlow />
          </div>
        </div>
        {/* A phone gets the action itself, not directions to a button elsewhere. */}
        <BookingOpenButton className="mt-5 md:hidden" />
      </div>
    </section>
  );
}
