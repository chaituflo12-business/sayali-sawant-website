import { BookingFlow } from "@/components/booking/booking-flow";

export function BookingCard() {
  return (
    <section id="book" className="scroll-mt-24 py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          Book an OPD appointment
        </h2>
        <p className="mt-2 text-sm text-muted">
          Choose a day and time in Goregaon West. You will receive a WhatsApp
          message with directions.
        </p>
        <div className="mt-6 hidden rounded-xl border border-border bg-surface p-6 shadow-sm md:block">
          <BookingFlow />
        </div>
        <p className="mt-4 text-sm text-muted md:hidden">
          Use the Book OPD slot button at the bottom of the screen.
        </p>
      </div>
    </section>
  );
}
