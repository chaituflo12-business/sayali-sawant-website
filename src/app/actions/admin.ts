"use server";

import { fail, ok, type ActionResult } from "@/lib/result";
import { requireStaff } from "@/lib/admin-auth";

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
