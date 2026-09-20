import { z } from "zod";

export const genderValues = [
  "female",
  "male",
  "other",
  "prefer_not_to_say",
] as const;

export const visitTypeValues = [
  "new_consult",
  "follow_up",
  "antenatal",
  "infertility",
  "procedure_review",
  "other",
] as const;

export const genderLabels: Record<(typeof genderValues)[number], string> = {
  female: "Female",
  male: "Male",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export const visitTypeLabels: Record<(typeof visitTypeValues)[number], string> =
  {
    new_consult: "New consultation",
    follow_up: "Follow-up",
    antenatal: "Antenatal visit",
    infertility: "Infertility",
    procedure_review: "Procedure review",
    other: "Other",
  };

export const appointmentFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  age: z.coerce.number().int().min(1).max(110),
  gender: z.enum(genderValues),
  visitType: z.enum(visitTypeValues),
  reason: z.string().trim().max(160).optional(),
  slotId: z.string().uuid(),
  consent: z.literal(true, {
    error: "Consent is required to book an appointment",
  }),
  website: z.string().max(0).optional(),
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;

export const rescheduleSchema = z.object({
  token: z.string().uuid(),
  slotId: z.string().uuid(),
});

export const cancelSchema = z.object({
  token: z.string().uuid(),
});

export const waitlistFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  visitType: z.enum(visitTypeValues),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid day"),
  consent: z.literal(true, {
    error: "Consent is required to join the waitlist",
  }),
  website: z.string().max(0).optional(),
});

export type WaitlistFormInput = z.infer<typeof waitlistFormSchema>;

export const reminderKindValues = [
  "scan_day",
  "injection_day",
  "review_visit",
  "custom",
] as const;

export const reminderKindLabels: Record<
  (typeof reminderKindValues)[number],
  string
> = {
  scan_day: "Scan day",
  injection_day: "Injection day",
  review_visit: "Review visit",
  custom: "Custom",
};

// Reminders are date prompts only. Anything that looks like a drug name or a
// dose is rejected so the clinic never sends treatment instructions over
// WhatsApp.
export const MEDICINE_DENYLIST =
  /\b(mg|iu|units?|inject(ion)?|dose|tablets?|hcg|fsh|lh|letrozole|clomiphene|progesterone|trigger|gonal|menopur|lupride|cetrotide|ovitrelle)\b/i;

export const reminderNoteSchema = z
  .string()
  .trim()
  .max(120)
  .refine((value) => !MEDICINE_DENYLIST.test(value), {
    message: "Notes must not contain medicine names or doses.",
  });

export const cycleReminderSchema = z.object({
  patientName: z.string().trim().min(2).max(80),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  kind: z.enum(reminderKindValues),
  remindOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  remindAt: z.string().regex(/^\d{2}:\d{2}$/, "Pick a valid time"),
  note: reminderNoteSchema.optional().or(z.literal("")),
});

export const messageStatusSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+91[6-9][0-9]{9}$/, "whatsapp must be E.164, e.g. +919000000000"),
  template: z.string().trim().min(1).max(80),
  status: z.string().trim().min(1).max(40),
  make_execution_id: z.string().trim().max(120).optional(),
  appointment_ref: z.string().trim().max(20).optional(),
  opt_out: z.boolean().optional(),
});
