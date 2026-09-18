"use client";

import { useState } from "react";
import {
  cancelAppointment,
  rescheduleAppointment,
} from "@/app/actions/appointments";
import { BookingFlow } from "@/components/booking/booking-flow";
import { ConfirmationCard } from "@/components/booking/confirmation-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants, cn } from "@/lib/utils";
import type { BookedAppointment } from "@/lib/slot-types";

export function ManageAppointment({
  token,
  status,
  initialAction,
}: {
  token: string;
  status: string;
  initialAction?: "cancel";
}) {
  const [mode, setMode] = useState<"view" | "reschedule" | "cancelled">(
    "view",
  );
  const [cancelOpen, setCancelOpen] = useState(initialAction === "cancel");
  const [message, setMessage] = useState<string | null>(null);
  const [updated, setUpdated] = useState<BookedAppointment | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = status === "cancelled" || status === "completed" || status === "no_show";

  async function onReschedule(slotId: string) {
    setBusy(true);
    const result = await rescheduleAppointment({ token, slotId });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setUpdated(result.data);
    setMode("view");
  }

  async function onCancel() {
    setBusy(true);
    const result = await cancelAppointment({ token });
    setBusy(false);
    setCancelOpen(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMode("cancelled");
  }

  if (mode === "cancelled") {
    return (
      <p className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-ink">
        This appointment has been cancelled. You can book a new slot from the
        home page if you still need a visit.
      </p>
    );
  }

  if (updated) {
    return (
      <div className="mt-6">
        <ConfirmationCard appointment={updated} />
      </div>
    );
  }

  if (locked) {
    return (
      <p className="mt-6 text-sm text-muted">
        This appointment can no longer be changed online.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {message ? <p className="text-sm text-error">{message}</p> : null}
      {mode === "view" ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={cn(buttonVariants())}
            onClick={() => setMode("reschedule")}
          >
            Reschedule
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "secondary" }))}
            onClick={() => setCancelOpen(true)}
          >
            Cancel appointment
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-ink">Pick a new time</p>
          <BookingFlow manageToken={token} onReschedule={onReschedule} />
          <button
            type="button"
            className="mt-3 text-sm text-muted underline"
            onClick={() => setMode("view")}
            disabled={busy}
          >
            Back
          </button>
        </div>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this appointment?</DialogTitle>
            <DialogDescription>
              The slot will be released. You can book again from the website if
              you still need a visit.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
              onClick={() => setCancelOpen(false)}
            >
              Keep appointment
            </button>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "danger" }), "flex-1")}
              onClick={onCancel}
              disabled={busy}
            >
              Confirm cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
