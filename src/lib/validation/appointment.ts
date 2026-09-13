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
