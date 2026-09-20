"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/actions/appointments";
import { buttonVariants, cn } from "@/lib/utils";
import { DPDP_CONSENT } from "@/lib/disclaimer";
import type { visitTypeValues } from "@/lib/validation/appointment";

export function WaitlistForm({
  dateIst,
  dayLabel,
  visitType,
}: {
  dateIst: string;
  dayLabel: string;
  visitType: (typeof visitTypeValues)[number];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await joinWaitlist({
      name,
      whatsapp,
      visitType,
      preferredDate: dateIst,
      consent,
      website,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setJoined(true);
  }

  if (joined) {
    return (
      <p className="mt-4 rounded-xl border border-accent bg-accent-soft px-3 py-2 text-sm text-accent">
        We&apos;ll message you if a slot opens on {dayLabel}.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "secondary" }), "mt-4 w-full")}
      >
        Join waitlist for this day
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-soft mt-4 space-y-3 rounded-2xl bg-surface p-3"
    >
      <p className="text-sm text-ink">Join the waitlist for {dayLabel}</p>
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
      <label className="block text-sm">
        <span className="text-ink">Name</span>
        <input
          required
          name="name"
          autoComplete="name"
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
            type="tel"
            name="whatsapp"
            autoComplete="tel-national"
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
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
          onClick={() => setOpen(false)}
        >
          Close
        </button>
        <button
          type="submit"
          className={cn(buttonVariants(), "flex-1")}
          disabled={submitting}
        >
          {submitting ? "Please wait…" : "Join waitlist"}
        </button>
      </div>
    </form>
  );
}
