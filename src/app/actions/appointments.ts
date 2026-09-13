"use server";

import {
  appointmentFormSchema,
  cancelSchema,
  rescheduleSchema,
  waitlistFormSchema,
} from "@/lib/validation/appointment";
import { fail, ok, type ActionResult } from "@/lib/result";
import { assertBookingRateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";
import { getSlotSummary, getSlotsForDay } from "@/lib/slots";
import type { BookedAppointment, BookingBoard, PublicSlot } from "@/lib/slot-types";
import { CLINIC_ADDRESS, DOCTOR_NAME, GOOGLE_MAPS_DIR_URL, SITE_URL } from "@/config/site";
import { formatSlotDisplay } from "@/lib/datetime";
import { buildAppointmentIcs } from "@/lib/ics";

const NOT_CONFIGURED =
  "Online booking is not connected yet. Please use WhatsApp or phone.";

function rpcRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function str(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

export async function loadBookingBoard(): Promise<ActionResult<BookingBoard>> {
  try {
    const summary = await getSlotSummary();
    return ok({
      live: summary.live,
      days: summary.days,
      nextAvailable: summary.nextAvailable,
    });
  } catch {
    return fail("BOARD_ERROR", "Could not load availability. Please try again.");
  }
}

export async function loadSlotsForDay(
  dateIst: string,
): Promise<ActionResult<{ live: boolean; slots: PublicSlot[] }>> {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIst)) {
      return fail("INVALID_DATE", "Please pick a valid day.");
    }
    const result = await getSlotsForDay(dateIst);
    return ok(result);
  } catch {
    return fail("SLOTS_ERROR", "Could not load times for that day.");
  }
}

export async function createAppointment(
  input: unknown,
): Promise<ActionResult<BookedAppointment>> {
  try {
    const parsed = appointmentFormSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form.";
      return fail("VALIDATION", message);
    }

    if (parsed.data.website) {
      return fail("VALIDATION", "Please check the form.");
    }

    const { allowed } = await assertBookingRateLimit();
    if (!allowed) {
      return fail(
        "RATE_LIMIT",
        "Too many attempts from this network. Please wait a few minutes.",
      );
    }

    // book_appointment is service_role only, so the browser cannot reach it
    // directly and skip the checks above.
    const supabase = createServiceClient();
    if (!supabase) {
      return fail("NOT_CONFIGURED", NOT_CONFIGURED);
    }

    const { data, error } = await supabase.rpc("book_appointment", {
      p_slot_id: parsed.data.slotId,
      p_patient_name: parsed.data.name,
      p_whatsapp_e164: `+91${parsed.data.whatsapp}`,
      p_age: parsed.data.age,
      p_gender: parsed.data.gender,
      p_visit_type: parsed.data.visitType,
      p_reason: parsed.data.reason ? parsed.data.reason : null,
      p_source: "web",
    });

    if (error) {
      return fail("BOOKING_ERROR", "Could not complete the booking. Please try again.");
    }

    const record = rpcRecord(data);
    if (!record) {
      return fail("BOOKING_ERROR", "Could not complete the booking. Please try again.");
    }
    if (record.ok === false) {
      const code = typeof record.code === "string" ? record.code : "BOOKING_ERROR";
      const message =
        typeof record.message === "string"
          ? record.message
          : "Could not complete the booking.";
      return fail(code, message);
    }

    const startsAt = str(record, "starts_at");
    const endsAt = str(record, "ends_at");
    const ref = str(record, "public_ref");
    const token = str(record, "manage_token");
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    const ics = buildAppointmentIcs({
      uid: ref,
      startsAt: startDate,
      endsAt: endDate,
      location: CLINIC_ADDRESS,
      description: `OPD with ${DOCTOR_NAME}. Manage: ${SITE_URL}/manage/${token}`,
    });

    return ok({
      ref,
      token,
      startsAt,
      endsAt,
      display: formatSlotDisplay(startDate, endDate),
      mapsUrl: GOOGLE_MAPS_DIR_URL,
      icsDataUri: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
    });
  } catch {
    return fail("BOOKING_ERROR", "Could not complete the booking. Please try again.");
  }
}

export async function rescheduleAppointment(
  input: unknown,
): Promise<ActionResult<BookedAppointment>> {
  try {
    const parsed = rescheduleSchema.safeParse(input);
    if (!parsed.success) {
      return fail("VALIDATION", "Please pick another time.");
    }
    const supabase = createServiceClient();
    if (!supabase) {
      return fail("NOT_CONFIGURED", "Online changes are not connected yet.");
    }
    const { data, error } = await supabase.rpc("reschedule_appointment", {
      p_token: parsed.data.token,
      p_new_slot_id: parsed.data.slotId,
    });
    if (error) {
      return fail("RESCHEDULE_ERROR", "Could not reschedule. Please try another time.");
    }
    const record = rpcRecord(data);
    if (!record) {
      return fail("RESCHEDULE_ERROR", "Could not reschedule. Please try another time.");
    }
    if (record.ok === false) {
      return fail(
        typeof record.code === "string" ? record.code : "RESCHEDULE_ERROR",
        typeof record.message === "string" ? record.message : "Could not reschedule.",
      );
    }
    const startsAt = str(record, "starts_at");
    const endsAt = str(record, "ends_at");
    return ok({
      ref: str(record, "public_ref"),
      token: parsed.data.token,
      startsAt,
      endsAt,
      display: formatSlotDisplay(new Date(startsAt), new Date(endsAt)),
      mapsUrl: GOOGLE_MAPS_DIR_URL,
      icsDataUri: "",
    });
  } catch {
    return fail("RESCHEDULE_ERROR", "Could not reschedule. Please try another time.");
  }
}

export async function cancelAppointment(
  input: unknown,
): Promise<ActionResult<{ ref: string }>> {
  try {
    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return fail("VALIDATION", "This manage link is not valid.");
    }
    const supabase = createServiceClient();
    if (!supabase) {
      return fail("NOT_CONFIGURED", "Online changes are not connected yet.");
    }
    const { data, error } = await supabase.rpc("cancel_appointment", {
      p_token: parsed.data.token,
    });
    if (error) {
      return fail("CANCEL_ERROR", "Could not cancel this appointment.");
    }
    const record = rpcRecord(data);
    if (!record) {
      return fail("CANCEL_ERROR", "Could not cancel this appointment.");
    }
    if (record.ok === false) {
      return fail(
        typeof record.code === "string" ? record.code : "CANCEL_ERROR",
        typeof record.message === "string"
          ? record.message
          : "Could not cancel this appointment.",
      );
    }
    return ok({ ref: str(record, "public_ref") });
  } catch {
    return fail("CANCEL_ERROR", "Could not cancel this appointment.");
  }
}

export async function joinWaitlist(
  input: unknown,
): Promise<ActionResult<{ already: boolean }>> {
  try {
    const parsed = waitlistFormSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form.";
      return fail("VALIDATION", message);
    }
    if (parsed.data.website) {
      return fail("VALIDATION", "Please check the form.");
    }

    const { allowed } = await assertBookingRateLimit();
    if (!allowed) {
      return fail(
        "RATE_LIMIT",
        "Too many attempts from this network. Please wait a few minutes.",
      );
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return fail("NOT_CONFIGURED", NOT_CONFIGURED);
    }

    const { data, error } = await supabase.rpc("join_waitlist", {
      p_patient_name: parsed.data.name,
      p_whatsapp_e164: `+91${parsed.data.whatsapp}`,
      p_preferred_date: parsed.data.preferredDate,
      p_visit_type: parsed.data.visitType,
    });

    if (error) {
      return fail("WAITLIST_ERROR", "Could not join the waitlist. Please try again.");
    }
    const record = rpcRecord(data);
    if (!record) {
      return fail("WAITLIST_ERROR", "Could not join the waitlist. Please try again.");
    }
    if (record.ok === false) {
      return fail(
        typeof record.code === "string" ? record.code : "WAITLIST_ERROR",
        typeof record.message === "string"
          ? record.message
          : "Could not join the waitlist.",
      );
    }
    return ok({ already: record.already === true });
  } catch {
    return fail("WAITLIST_ERROR", "Could not join the waitlist. Please try again.");
  }
}
