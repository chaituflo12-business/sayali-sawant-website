"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  loadBookingBoard,
  loadSlotsForDay,
} from "@/app/actions/appointments";
import type { BookedAppointment, DaySummary, PublicSlot } from "@/lib/slot-types";
import { formatIstTime } from "@/lib/datetime";
import { buttonVariants, cn } from "@/lib/utils";
import { DPDP_CONSENT } from "@/lib/disclaimer";
import {
  genderLabels,
  genderValues,
  visitTypeLabels,
  visitTypeValues,
} from "@/lib/validation/appointment";
import { GOOGLE_MAPS_DIR_URL } from "@/config/site";
import { ConfirmationCard } from "@/components/booking/confirmation-card";
import { WaitlistForm } from "@/components/booking/waitlist-form";

type Step = 1 | 2 | 3;

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

function dayTone(status: DaySummary["status"]) {
  if (status === "available") return "border-accent bg-accent-soft";
  if (status === "limited") return "border-highlight bg-highlight-soft text-ink";
  return "border-border bg-background text-muted";
}

export function BookingFlow({
  compact = false,
  manageToken,
  onReschedule,
}: {
  compact?: boolean;
  manageToken?: string;
  onReschedule?: (slotId: string) => Promise<void>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [live, setLive] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookedAppointment | null>(
    null,
  );

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<(typeof genderValues)[number]>("female");
  const [visitType, setVisitType] =
    useState<(typeof visitTypeValues)[number]>("new_consult");
  const [reason, setReason] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    void loadBookingBoard().then((result) => {
      if (result.ok) {
        setDays(result.data.days);
        setLive(result.data.live);
        const firstOpen = result.data.days.find(
          (d) => d.status === "available" || d.status === "limited",
        );
        if (firstOpen) setSelectedDate(firstOpen.date);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    void loadSlotsForDay(selectedDate).then((result) => {
      setLoadingSlots(false);
      if (result.ok) {
        setSlots(result.data.slots);
        setLive(result.data.live);
      }
    });
  }, [selectedDate]);

  const progress = useMemo(() => [1, 2, 3] as const, []);
  const noneRemaining = useMemo(
    () => slots.every((slot) => slot.remaining <= 0),
    [slots],
  );

  async function refetchSelectedDay() {
    if (!selectedDate) return;
    const result = await loadSlotsForDay(selectedDate);
    if (result.ok) setSlots(result.data.slots);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;
    setFormError(null);
    setSlotTaken(false);

    if (manageToken && onReschedule) {
      setSubmitting(true);
      try {
        await onReschedule(selectedSlot.slotId);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    const result = await createAppointment({
      name,
      whatsapp,
      age: Number(age),
      gender,
      visitType,
      reason: reason || undefined,
      slotId: selectedSlot.slotId,
      consent,
      website,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.code === "SLOT_TAKEN") {
        setSlotTaken(true);
        setSelectedSlot(null);
        setStep(2);
        await refetchSelectedDay();
        return;
      }
      setFormError(result.message);
      return;
    }
    setConfirmation(result.data);
  }

  if (confirmation) {
    return <ConfirmationCard appointment={confirmation} />;
  }

  return (
    <div className={cn("flex flex-col gap-5", compact ? "" : "p-1")}>
      {!live ? (
        <p className="rounded-xl border border-border bg-primary-soft px-3 py-2 text-xs text-ink">
          Showing typical OPD times. Live booking opens once the clinic calendar
          is connected.
        </p>
      ) : null}

      <div className="flex items-center justify-center gap-2" aria-hidden>
        {progress.map((item) => (
          <span
            key={item}
            className={cn(
              "h-2 w-2 rounded-full",
              item <= step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-center text-xs text-muted">
        Step {step} of 3 · {step === 1 ? "Pick day" : step === 2 ? "Pick time" : "Your details"}
      </p>

      {step === 1 ? (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const disabled = day.status === "closed" || day.status === "full";
              const selected = selectedDate === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "min-h-11 min-w-[4.5rem] rounded-xl border px-2 text-xs font-medium",
                    dayTone(day.status),
                    selected && "ring-2 ring-primary",
                    disabled && "opacity-50",
                  )}
                >
                  {dayLabel(day.date)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={cn(buttonVariants(), "mt-4 w-full")}
            disabled={!selectedDate}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          {slotTaken ? (
            <p className="mb-3 rounded-xl border border-error bg-highlight-soft px-3 py-2 text-sm text-error">
              That time was just taken, please pick another
            </p>
          ) : null}
          {loadingSlots ? (
            <p className="text-sm text-muted">Loading times…</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const taken = slot.remaining <= 0;
                const selected = selectedSlot?.slotId === slot.slotId;
                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={taken}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "min-h-11 rounded-xl border px-2 text-xs",
                      taken
                        ? "cursor-not-allowed border-border bg-background text-muted line-through"
                        : "border-accent bg-accent-soft text-ink",
                      selected && "ring-2 ring-primary",
                    )}
                  >
                    {formatIstTime(new Date(slot.startsAt))}
                    <span className="mt-0.5 block text-[10px] text-muted">IST</span>
                  </button>
                );
              })}
            </div>
          )}
          {noneRemaining && !loadingSlots ? (
            <>
              <p className="text-sm text-muted">No open times on this day.</p>
              {!manageToken && selectedDate ? (
                <WaitlistForm
                  dateIst={selectedDate}
                  dayLabel={dayLabel(selectedDate)}
                  visitType={visitType}
                />
              ) : null}
            </>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className={cn(buttonVariants(), "flex-1")}
              disabled={!selectedSlot}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />
          {!manageToken ? (
            <>
              <label className="block text-sm">
                <span className="text-ink">Name</span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
                />
              </label>
              <label className="block text-sm">
                <span className="text-ink">WhatsApp mobile</span>
                <span className="mt-1 flex overflow-hidden rounded-xl border border-border">
                  <span className="inline-flex min-h-11 items-center bg-primary-soft px-3 text-sm text-ink">
                    +91
                  </span>
                  <input
                    required
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    value={whatsapp}
                    onChange={(e) =>
                      setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="min-h-11 w-full px-3 text-ink"
                    placeholder="9XXXXXXXXX"
                  />
                </span>
              </label>
              <label className="block text-sm">
                <span className="text-ink">Age</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={110}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
                />
              </label>
              <fieldset>
                <legend className="text-sm text-ink">Gender</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {genderValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGender(value)}
                      className={cn(
                        "min-h-11 rounded-xl border px-2 text-xs",
                        gender === value
                          ? "border-primary bg-primary-soft text-ink"
                          : "border-border bg-surface text-muted",
                      )}
                    >
                      {genderLabels[value]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm">
                <span className="text-ink">Visit type</span>
                <select
                  value={visitType}
                  onChange={(e) =>
                    setVisitType(e.target.value as (typeof visitTypeValues)[number])
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
                >
                  {visitTypeValues.map((value) => (
                    <option key={value} value={value}>
                      {visitTypeLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-ink">Reason (optional, one line)</span>
                <input
                  maxLength={160}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-ink"
                />
              </label>
              <label className="flex items-start gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5"
                  required
                />
                <span>{DPDP_CONSENT}</span>
              </label>
            </>
          ) : (
            <p className="text-sm text-muted">
              Confirm the new time. Your existing details stay the same.
            </p>
          )}
          {formError ? (
            <p className="text-sm text-error">{formError}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              type="submit"
              className={cn(buttonVariants(), "flex-1")}
              disabled={submitting}
            >
              {submitting
                ? "Please wait…"
                : manageToken
                  ? "Confirm new time"
                  : "Confirm booking"}
            </button>
          </div>
        </form>
      ) : null}

      <p className="text-xs text-muted">
        Maps:{" "}
        <a className="text-primary underline" href={GOOGLE_MAPS_DIR_URL}>
          Get directions
        </a>
      </p>
    </div>
  );
}
