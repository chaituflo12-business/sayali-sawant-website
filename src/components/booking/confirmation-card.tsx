import type { BookedAppointment } from "@/lib/slot-types";
import { buttonVariants, cn } from "@/lib/utils";
import { WHATSAPP_AUTOMATION_LIVE } from "@/config/site";

export function ConfirmationCard({
  appointment,
}: {
  appointment: BookedAppointment;
}) {
  return (
    <div className="rounded-xl border border-accent bg-accent-soft p-5">
      <p role="status" className="text-sm font-medium text-accent">
        {WHATSAPP_AUTOMATION_LIVE ? "Appointment confirmed" : "Appointment booked"}
      </p>
      <p className="font-display mt-2 text-xl text-ink">
        Reference {appointment.ref}
      </p>
      <p className="mt-2 text-sm text-ink">{appointment.display} IST</p>
      <p className="mt-4 text-sm text-muted">
        {WHATSAPP_AUTOMATION_LIVE
          ? "You'll get a WhatsApp confirmation within a minute."
          : "The clinic will confirm your time on WhatsApp. Keep your reference handy."}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a
          href={appointment.mapsUrl}
          className={cn(buttonVariants())}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps
        </a>
        {appointment.icsDataUri ? (
          <a
            href={appointment.icsDataUri}
            download={`opd-${appointment.ref}.ics`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Add to calendar
          </a>
        ) : null}
      </div>
    </div>
  );
}
