"use server";

import { fail, ok, type ActionResult } from "@/lib/result";
import { requireStaff } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { cycleReminderSchema } from "@/lib/validation/appointment";
import { addIstDays, formatSlotDisplay, startOfIstDay } from "@/lib/datetime";

export async function markAppointmentStatus(
  id: string,
  status: "completed" | "no_show",
): Promise<ActionResult<{ id: string }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    const { error } = await gate.supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);
    if (error) return fail("UPDATE_ERROR", "Could not update the appointment.");
    return ok({ id });
  } catch {
    return fail("UPDATE_ERROR", "Could not update the appointment.");
  }
}

export async function blockRange(input: {
  startIso: string;
  endIso: string;
  reason: string;
}): Promise<ActionResult<{ count: number }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    const start = new Date(input.startIso);
    const end = new Date(input.endIso);
    if (!(start < end)) {
      return fail("VALIDATION", "The end time must be after the start time.");
    }

    const { data: existing } = await gate.supabase
      .from("slots")
      .select("id")
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString());

    if (existing && existing.length > 0) {
      const { error } = await gate.supabase
        .from("slots")
        .update({ blocked: true, block_reason: input.reason })
        .in(
          "id",
          existing.map((row) => row.id),
        );
      if (error) return fail("BLOCK_ERROR", "Could not block those times.");
      return ok({ count: existing.length });
    }

    const { error } = await gate.supabase.from("slots").insert({
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      blocked: true,
      block_reason: input.reason,
      capacity: 1,
    });
    if (error) return fail("BLOCK_ERROR", "Could not block those times.");
    return ok({ count: 1 });
  } catch {
    return fail("BLOCK_ERROR", "Could not block those times.");
  }
}

export async function saveScheduleRow(input: {
  id?: number;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  capacity_per_slot: number;
  active: boolean;
}): Promise<ActionResult<{ id: number }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    if (input.id) {
      const { error } = await gate.supabase
        .from("opd_schedule")
        .update({
          weekday: input.weekday,
          start_time: input.start_time,
          end_time: input.end_time,
          slot_minutes: input.slot_minutes,
          capacity_per_slot: input.capacity_per_slot,
          active: input.active,
        })
        .eq("id", input.id);
      if (error) return fail("SCHEDULE_ERROR", "Could not save the template.");
      return ok({ id: input.id });
    }
    const { data, error } = await gate.supabase
      .from("opd_schedule")
      .insert({
        weekday: input.weekday,
        start_time: input.start_time,
        end_time: input.end_time,
        slot_minutes: input.slot_minutes,
        capacity_per_slot: input.capacity_per_slot,
        active: input.active,
      })
      .select("id")
      .single();
    if (error || !data) return fail("SCHEDULE_ERROR", "Could not save the template.");
    return ok({ id: data.id });
  } catch {
    return fail("SCHEDULE_ERROR", "Could not save the template.");
  }
}

export async function deleteScheduleRow(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    const { error } = await gate.supabase.from("opd_schedule").delete().eq("id", id);
    if (error) return fail("SCHEDULE_ERROR", "Could not delete the row.");
    return ok({ id });
  } catch {
    return fail("SCHEDULE_ERROR", "Could not delete the row.");
  }
}

export async function toggleReportReady(
  id: string,
  ready: boolean,
): Promise<ActionResult<{ id: string; ready: boolean }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    const { error } = await gate.supabase
      .from("appointments")
      .update({ report_ready_at: ready ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return fail("UPDATE_ERROR", "Could not update the report flag.");
    return ok({ id, ready });
  } catch {
    return fail("UPDATE_ERROR", "Could not update the report flag.");
  }
}

async function firstFreeSlotFrom(from: Date) {
  const service = createServiceClient();
  if (!service) return null;
  const to = addIstDays(startOfIstDay(from), 21);
  const { data } = await service.rpc("get_available_slots", {
    from_date: from.toISOString(),
    to_date: to.toISOString(),
  });
  const slot = (data ?? []).find((row) => row.remaining > 0);
  return slot ?? null;
}

export async function suggestNextVisit(
  id: string,
  weeks: 1 | 2 | 4,
): Promise<ActionResult<{ display: string; holdHours: number }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");

    const { data: appt } = await gate.supabase
      .from("appointments")
      .select("id, patient_name, whatsapp_e164, age, gender, visit_type")
      .eq("id", id)
      .maybeSingle();
    if (!appt) return fail("NOT_FOUND", "Could not find that appointment.");

    const target = addIstDays(startOfIstDay(new Date()), weeks * 7);
    const slot = await firstFreeSlotFrom(target);
    if (!slot) {
      return fail("NO_SLOT", "No free slot on or after that date. Add OPD hours first.");
    }

    const service = createServiceClient();
    if (!service) {
      return fail("NOT_CONFIGURED", "Holds need the service role key.");
    }

    const { data, error } = await service.rpc("create_hold_appointment", {
      p_slot_id: slot.slot_id,
      p_patient_name: appt.patient_name,
      p_whatsapp_e164: appt.whatsapp_e164,
      p_age: appt.age,
      p_gender: appt.gender,
      p_visit_type: "antenatal",
      p_source: "antenatal_nudge",
      p_hold_hours: 48,
    });
    if (error) return fail("HOLD_ERROR", "Could not hold that slot.");

    const record =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : null;
    if (!record || record.ok === false) {
      return fail(
        typeof record?.code === "string" ? record.code : "HOLD_ERROR",
        typeof record?.message === "string"
          ? record.message
          : "Could not hold that slot.",
      );
    }

    await gate.supabase
      .from("appointments")
      .update({ next_visit_suggested_at: new Date().toISOString() })
      .eq("id", id);

    return ok({
      display: formatSlotDisplay(new Date(slot.starts_at), new Date(slot.ends_at)),
      holdHours: 48,
    });
  } catch {
    return fail("HOLD_ERROR", "Could not hold that slot.");
  }
}

export async function createCycleReminder(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = cycleReminderSchema.safeParse(input);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form.";
      return fail("VALIDATION", message);
    }
    const gate = await requireStaff();
    if (!gate.supabase || !gate.staff) {
      return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    }
    const { data, error } = await gate.supabase
      .from("cycle_reminders")
      .insert({
        patient_name: parsed.data.patientName,
        whatsapp_e164: `+91${parsed.data.whatsapp}`,
        kind: parsed.data.kind,
        remind_on: parsed.data.remindOn,
        remind_at: parsed.data.remindAt,
        note: parsed.data.note ? parsed.data.note : null,
        created_by: gate.staff.user_id,
      })
      .select("id")
      .single();
    if (error || !data) return fail("REMINDER_ERROR", "Could not save the reminder.");
    return ok({ id: data.id });
  } catch {
    return fail("REMINDER_ERROR", "Could not save the reminder.");
  }
}

export async function deleteCycleReminder(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");
    const { error } = await gate.supabase.from("cycle_reminders").delete().eq("id", id);
    if (error) return fail("REMINDER_ERROR", "Could not delete the reminder.");
    return ok({ id });
  } catch {
    return fail("REMINDER_ERROR", "Could not delete the reminder.");
  }
}

export async function offerWaitlistSlot(
  id: string,
): Promise<ActionResult<{ display: string }>> {
  try {
    const gate = await requireStaff();
    if (!gate.supabase) return gate.error ?? fail("FORBIDDEN", "Not allowed.");

    const { data: row } = await gate.supabase
      .from("waitlist")
      .select("id, patient_name, whatsapp_e164, preferred_date, visit_type, notified_at")
      .eq("id", id)
      .maybeSingle();
    if (!row) return fail("NOT_FOUND", "Could not find that waitlist entry.");
    if (row.notified_at) return fail("ALREADY_OFFERED", "This entry was already offered a slot.");

    const dayStart = startOfIstDay(new Date(`${row.preferred_date}T00:00:00+05:30`));
    const now = new Date();
    const from = dayStart < now ? now : dayStart;
    const dayEnd = addIstDays(dayStart, 1);
    if (from >= dayEnd) {
      return fail("DAY_PAST", "That day has passed. Ask the patient for a new date.");
    }

    const service = createServiceClient();
    if (!service) return fail("NOT_CONFIGURED", "Holds need the service role key.");

    const { data: slots } = await service.rpc("get_available_slots", {
      from_date: from.toISOString(),
      to_date: dayEnd.toISOString(),
    });
    const slot = (slots ?? []).find((candidate) => candidate.remaining > 0);
    if (!slot) return fail("NO_SLOT", "No free slot left on that day.");

    const { data, error } = await service.rpc("create_hold_appointment", {
      p_slot_id: slot.slot_id,
      p_patient_name: row.patient_name,
      p_whatsapp_e164: row.whatsapp_e164,
      p_age: 30,
      p_gender: "female",
      p_visit_type: row.visit_type,
      p_source: "waitlist",
      p_hold_hours: 2,
    });
    if (error) return fail("HOLD_ERROR", "Could not hold that slot.");

    const record =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : null;
    if (!record || record.ok === false) {
      return fail(
        typeof record?.code === "string" ? record.code : "HOLD_ERROR",
        typeof record?.message === "string"
          ? record.message
          : "Could not hold that slot.",
      );
    }

    await gate.supabase
      .from("waitlist")
      .update({
        notified_at: new Date().toISOString(),
        hold_expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", id);

    return ok({
      display: formatSlotDisplay(new Date(slot.starts_at), new Date(slot.ends_at)),
    });
  } catch {
    return fail("HOLD_ERROR", "Could not hold that slot.");
  }
}
