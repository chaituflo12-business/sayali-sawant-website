-- Supersedes create_hold_appointment in 0003_automation.sql. 0003 is frozen.
--
-- The old version caught a violation of appointments_one_active_per_phone_day
-- and retried with created_at jittered by microseconds. That index keys on
-- date(created_at at time zone 'Asia/Kolkata'), so the jitter never changes the
-- key and the retry failed identically every time. The retry is gone: each
-- constraint now maps straight to its own code, and anything unexpected
-- re-raises instead of being reported as a duplicate phone number.

create or replace function create_hold_appointment(
  p_slot_id uuid,
  p_patient_name text,
  p_whatsapp_e164 text,
  p_age smallint,
  p_gender gender_t,
  p_visit_type visit_type,
  p_source text,
  p_hold_hours int default 48
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row appointments;
  v_slot slots;
  v_constraint text;
begin
  select * into v_slot from slots where id = p_slot_id;
  if not found or v_slot.blocked or v_slot.starts_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time is not available.');
  end if;

  begin
    insert into appointments (
      slot_id, patient_name, whatsapp_e164, age, gender, visit_type,
      source, hold_expires_at
    ) values (
      p_slot_id, p_patient_name, p_whatsapp_e164, p_age, p_gender, p_visit_type,
      p_source, now() + make_interval(hours => p_hold_hours)
    )
    returning * into v_row;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;

      if v_constraint ilike '%one_active_per_slot%' then
        return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time was just taken, please pick another');
      end if;

      if v_constraint ilike '%one_active_per_phone_day%' then
        return jsonb_build_object('ok', false, 'code', 'DUPLICATE_PHONE_TODAY', 'message', 'This number already has an active appointment booked today.');
      end if;

      raise;
  end;

  return jsonb_build_object(
    'ok', true,
    'id', v_row.id,
    'public_ref', v_row.public_ref,
    'manage_token', v_row.manage_token,
    'starts_at', v_slot.starts_at,
    'ends_at', v_slot.ends_at,
    'hold_expires_at', v_row.hold_expires_at
  );
end;
$$;

revoke all on function create_hold_appointment(uuid, text, text, smallint, gender_t, visit_type, text, int)
  from anon, authenticated, public;

grant execute on function create_hold_appointment(uuid, text, text, smallint, gender_t, visit_type, text, int) to service_role;
