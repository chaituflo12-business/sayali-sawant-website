-- Automation surface: hold/opt-out columns, waitlist, cycle reminders,
-- message log, opt-outs, and the rewritten outbox trigger.

alter table appointments
  add column if not exists report_ready_at timestamptz,
  add column if not exists review_requested_at timestamptz,
  add column if not exists next_visit_suggested_at timestamptz,
  add column if not exists no_show_followup_at timestamptz,
  add column if not exists hold_expires_at timestamptz,
  add column if not exists opted_out boolean not null default false;

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null check (char_length(patient_name) between 2 and 80),
  whatsapp_e164 text not null check (whatsapp_e164 ~ '^\+91[6-9][0-9]{9}$'),
  preferred_date date not null,
  visit_type visit_type not null,
  opted_out boolean not null default false,
  notified_at timestamptz,
  hold_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_pending
  on waitlist (preferred_date)
  where notified_at is null;

do $$
begin
  create type reminder_kind as enum ('scan_day','injection_day','review_visit','custom');
exception
  when duplicate_object then null;
end $$;

create table if not exists cycle_reminders (
  id uuid primary key default gen_random_uuid(),
  whatsapp_e164 text not null check (whatsapp_e164 ~ '^\+91[6-9][0-9]{9}$'),
  patient_name text not null,
  kind reminder_kind not null,
  remind_on date not null,
  remind_at time not null default '08:00',
  note text check (char_length(note) <= 120),
  created_by uuid references staff(user_id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists cycle_reminders_due
  on cycle_reminders (remind_on, remind_at)
  where sent_at is null;

create table if not exists message_log (
  id bigserial primary key,
  whatsapp_e164 text not null,
  template text not null,
  appointment_id uuid references appointments(id),
  make_execution_id text,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create index if not exists message_log_recent on message_log (created_at desc);

create table if not exists opt_outs (
  whatsapp_e164 text primary key,
  created_at timestamptz not null default now()
);

-- Payload builder now carries opted_out at the payload root so Make can filter
-- without a second lookup.
create or replace function appointment_webhook_payload(p_event text, p_appt appointments)
returns jsonb
language plpgsql
stable
as $$
declare
  v_slot slots;
  v_clinic clinic_settings;
begin
  select * into v_slot from slots where id = p_appt.slot_id;
  select * into v_clinic from clinic_settings where id = 1;
  return jsonb_build_object(
    'event', p_event,
    'ref', p_appt.public_ref,
    'opted_out', p_appt.opted_out,
    'patient', jsonb_build_object(
      'name', p_appt.patient_name,
      'whatsapp', p_appt.whatsapp_e164,
      'age', p_appt.age,
      'gender', p_appt.gender::text,
      'visit_type', p_appt.visit_type::text,
      'reason', coalesce(p_appt.reason, '')
    ),
    'slot', jsonb_build_object(
      'starts_at_ist', ist_iso(v_slot.starts_at),
      'ends_at_ist', ist_iso(v_slot.ends_at),
      'display', format_slot_display(v_slot.starts_at, v_slot.ends_at)
    ),
    'hold', jsonb_build_object(
      'expires_at_ist', case when p_appt.hold_expires_at is null then null else ist_iso(p_appt.hold_expires_at) end
    ),
    'clinic', jsonb_build_object(
      'maps_url', v_clinic.maps_url,
      'address', v_clinic.address
    ),
    'links', jsonb_build_object(
      'reschedule', v_clinic.site_url || '/manage/' || p_appt.manage_token::text,
      'cancel', v_clinic.site_url || '/manage/' || p_appt.manage_token::text || '?action=cancel'
    ),
    'doctor', v_clinic.doctor_name
  );
end;
$$;

-- Offers a freed slot to the first pending waitlist row for that IST date.
create or replace function offer_slot_to_waitlist(p_slot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot slots;
  v_row waitlist;
  v_clinic clinic_settings;
begin
  select * into v_slot from slots where id = p_slot_id;
  if not found or v_slot.starts_at <= now() then
    return;
  end if;

  select w.* into v_row
  from waitlist w
  where w.notified_at is null
    and w.opted_out = false
    and w.preferred_date = (v_slot.starts_at at time zone 'Asia/Kolkata')::date
    and not exists (select 1 from opt_outs o where o.whatsapp_e164 = w.whatsapp_e164)
  order by w.created_at
  limit 1
  for update skip locked;

  if not found then
    return;
  end if;

  select * into v_clinic from clinic_settings where id = 1;

  update waitlist
  set notified_at = now(), hold_expires_at = now() + interval '2 hours'
  where id = v_row.id;

  insert into webhook_outbox (event, payload)
  values (
    'slot.freed',
    jsonb_build_object(
      'event', 'slot.freed',
      'opted_out', false,
      'waitlist_id', v_row.id,
      'patient', jsonb_build_object(
        'name', v_row.patient_name,
        'whatsapp', v_row.whatsapp_e164,
        'visit_type', v_row.visit_type::text
      ),
      'slot', jsonb_build_object(
        'starts_at_ist', ist_iso(v_slot.starts_at),
        'ends_at_ist', ist_iso(v_slot.ends_at),
        'display', format_slot_display(v_slot.starts_at, v_slot.ends_at)
      ),
      'clinic', jsonb_build_object(
        'maps_url', v_clinic.maps_url,
        'address', v_clinic.address
      ),
      'doctor', v_clinic.doctor_name
    )
  );
end;
$$;

-- Event is chosen strictly by what changed, so a later edit to a rescheduled
-- row (mark completed, updated_at touch) no longer re-sends the reschedule
-- message.
create or replace function appointments_webhook_outbox()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event text;
begin
  if tg_op = 'INSERT' then
    if new.source = 'antenatal_nudge' then
      v_event := 'appointment.hold_created';
    else
      v_event := 'appointment.created';
    end if;
  elsif old.status <> 'cancelled' and new.status = 'cancelled' then
    v_event := 'appointment.cancelled';
  elsif new.slot_id is distinct from old.slot_id then
    v_event := 'appointment.rescheduled';
  elsif old.status <> 'completed' and new.status = 'completed' then
    v_event := 'appointment.completed';
  elsif old.status <> 'no_show' and new.status = 'no_show' then
    v_event := 'appointment.no_show';
  elsif old.report_ready_at is null and new.report_ready_at is not null then
    v_event := 'appointment.report_ready';
  else
    return new;
  end if;

  insert into webhook_outbox (event, payload)
  values (v_event, appointment_webhook_payload(v_event, new));

  if v_event = 'appointment.cancelled' then
    perform offer_slot_to_waitlist(new.slot_id);
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_outbox on appointments;
create trigger appointments_outbox
  after insert or update on appointments
  for each row execute function appointments_webhook_outbox();

create or replace function emit_due_cycle_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row cycle_reminders;
  v_count integer := 0;
begin
  for v_row in
    select r.*
    from cycle_reminders r
    where r.sent_at is null
      and ((r.remind_on + r.remind_at) at time zone 'Asia/Kolkata') <= now()
      and not exists (select 1 from opt_outs o where o.whatsapp_e164 = r.whatsapp_e164)
    order by r.remind_on, r.remind_at
    for update skip locked
  loop
    insert into webhook_outbox (event, payload)
    values (
      'reminder.cycle_due',
      jsonb_build_object(
        'event', 'reminder.cycle_due',
        'opted_out', false,
        'patient', jsonb_build_object(
          'name', v_row.patient_name,
          'whatsapp', v_row.whatsapp_e164
        ),
        'kind', v_row.kind::text,
        'remind_on', to_char(v_row.remind_on, 'YYYY-MM-DD'),
        'remind_at', to_char(v_row.remind_at, 'HH24:MI'),
        'note', coalesce(v_row.note, '')
      )
    );

    update cycle_reminders set sent_at = now() where id = v_row.id;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function emit_daily_digest()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Kolkata')::date;
  v_items jsonb;
  v_clinic clinic_settings;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', a.public_ref,
    'patient_name', a.patient_name,
    'whatsapp', a.whatsapp_e164,
    'starts_at_ist', ist_iso(s.starts_at),
    'visit_type', a.visit_type::text
  ) order by s.starts_at), '[]'::jsonb)
  into v_items
  from appointments a
  join slots s on s.id = a.slot_id
  where a.status in ('booked', 'rescheduled')
    and (s.starts_at at time zone 'Asia/Kolkata')::date = v_day;

  select * into v_clinic from clinic_settings where id = 1;

  insert into webhook_outbox (event, payload)
  values (
    'digest.daily',
    jsonb_build_object(
      'event', 'digest.daily',
      'opted_out', false,
      'date_ist', to_char(v_day, 'YYYY-MM-DD'),
      'count', jsonb_array_length(v_items),
      'appointments', v_items,
      'doctor', v_clinic.doctor_name
    )
  );

  return jsonb_array_length(v_items);
end;
$$;

-- Cancelling a lapsed hold fires appointments_webhook_outbox, which emits
-- appointment.cancelled and offers the slot to the waitlist, so there is no
-- second slot.freed insert here.
create or replace function expire_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row appointments;
  v_count integer := 0;
begin
  for v_row in
    select *
    from appointments
    where hold_expires_at is not null
      and hold_expires_at < now()
      and status = 'booked'
      and source in ('antenatal_nudge', 'waitlist')
    for update skip locked
  loop
    update appointments set status = 'cancelled' where id = v_row.id;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

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

      -- One retry with a jittered created_at in case two holds for the same
      -- number raced within the same statement.
      begin
        insert into appointments (
          slot_id, patient_name, whatsapp_e164, age, gender, visit_type,
          source, hold_expires_at, created_at
        ) values (
          p_slot_id, p_patient_name, p_whatsapp_e164, p_age, p_gender, p_visit_type,
          p_source, now() + make_interval(hours => p_hold_hours),
          now() + (interval '1 microsecond' * (random() * 1000)::int)
        )
        returning * into v_row;
      exception
        when unique_violation then
          return jsonb_build_object('ok', false, 'code', 'DUPLICATE_PHONE_TODAY', 'message', 'This number already has an appointment today.');
      end;
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

create or replace function record_message_status(
  p_whatsapp text,
  p_template text,
  p_status text,
  p_make_execution_id text default null,
  p_appointment_ref text default null,
  p_opt_out boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment_id uuid;
begin
  if p_appointment_ref is not null then
    select id into v_appointment_id from appointments where public_ref = p_appointment_ref;
  end if;

  insert into message_log (whatsapp_e164, template, appointment_id, make_execution_id, status)
  values (p_whatsapp, p_template, v_appointment_id, p_make_execution_id, p_status);

  if p_opt_out then
    insert into opt_outs (whatsapp_e164)
    values (p_whatsapp)
    on conflict (whatsapp_e164) do nothing;

    update appointments set opted_out = true
    where whatsapp_e164 = p_whatsapp and opted_out = false;

    update waitlist set opted_out = true
    where whatsapp_e164 = p_whatsapp and opted_out = false;
  end if;

  if p_template = 'review_request' and p_status in ('sent', 'delivered', 'read')
     and v_appointment_id is not null then
    update appointments
    set review_requested_at = coalesce(review_requested_at, now())
    where id = v_appointment_id;
  end if;

  return jsonb_build_object('ok', true, 'appointment_id', v_appointment_id);
end;
$$;

create or replace function join_waitlist(
  p_patient_name text,
  p_whatsapp_e164 text,
  p_preferred_date date,
  p_visit_type visit_type
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if exists (select 1 from opt_outs where whatsapp_e164 = p_whatsapp_e164) then
    return jsonb_build_object('ok', false, 'code', 'OPTED_OUT', 'message', 'This number has opted out of messages.');
  end if;

  select id into v_id
  from waitlist
  where whatsapp_e164 = p_whatsapp_e164
    and preferred_date = p_preferred_date
    and notified_at is null;

  if v_id is not null then
    return jsonb_build_object('ok', true, 'id', v_id, 'already', true);
  end if;

  insert into waitlist (patient_name, whatsapp_e164, preferred_date, visit_type)
  values (p_patient_name, p_whatsapp_e164, p_preferred_date, p_visit_type)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id, 'already', false);
end;
$$;

create or replace function get_upcoming_appointments(from_date timestamptz, to_date timestamptz)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', a.public_ref,
    'patient_name', a.patient_name,
    'whatsapp', a.whatsapp_e164,
    'starts_at', s.starts_at,
    'starts_at_ist', ist_iso(s.starts_at),
    'ends_at', s.ends_at,
    'display', format_slot_display(s.starts_at, s.ends_at),
    'status', a.status,
    'visit_type', a.visit_type::text,
    'opted_out', a.opted_out
  ) order by s.starts_at), '[]'::jsonb)
  from appointments a
  join slots s on s.id = a.slot_id
  where a.status in ('booked', 'rescheduled')
    and s.starts_at >= from_date
    and s.starts_at < to_date;
$$;

create or replace function get_no_shows_today()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', a.public_ref,
    'patient_name', a.patient_name,
    'whatsapp', a.whatsapp_e164,
    'starts_at_ist', ist_iso(s.starts_at),
    'visit_type', a.visit_type::text,
    'opted_out', a.opted_out
  ) order by s.starts_at), '[]'::jsonb)
  from appointments a
  join slots s on s.id = a.slot_id
  where a.status = 'no_show'
    and a.no_show_followup_at is null
    and (s.starts_at at time zone 'Asia/Kolkata')::date = (now() at time zone 'Asia/Kolkata')::date;
$$;

create or replace function mark_no_show_followed_up(p_ref text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update appointments
  set no_show_followup_at = coalesce(no_show_followup_at, now())
  where public_ref = p_ref
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Unknown reference.');
  end if;

  return jsonb_build_object('ok', true, 'ref', p_ref);
end;
$$;

create or replace function get_pending_waitlist(p_date date)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', w.id,
    'patient_name', w.patient_name,
    'whatsapp', w.whatsapp_e164,
    'preferred_date', to_char(w.preferred_date, 'YYYY-MM-DD'),
    'visit_type', w.visit_type::text,
    'opted_out', w.opted_out
  ) order by w.created_at)
  , '[]'::jsonb)
  from waitlist w
  where w.notified_at is null
    and w.opted_out = false
    and w.preferred_date = p_date;
$$;

alter table waitlist enable row level security;
alter table cycle_reminders enable row level security;
alter table message_log enable row level security;
alter table opt_outs enable row level security;

revoke all on waitlist, cycle_reminders, message_log, opt_outs from anon, authenticated, public;
grant select, insert, update, delete on waitlist, cycle_reminders to authenticated;
grant select on message_log, opt_outs to authenticated;
grant usage, select on sequence message_log_id_seq to authenticated;

drop policy if exists staff_all_waitlist on waitlist;
create policy staff_all_waitlist on waitlist
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists staff_all_cycle_reminders on cycle_reminders;
create policy staff_all_cycle_reminders on cycle_reminders
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists staff_select_message_log on message_log;
create policy staff_select_message_log on message_log
  for select to authenticated using (is_staff());

drop policy if exists staff_select_opt_outs on opt_outs;
create policy staff_select_opt_outs on opt_outs
  for select to authenticated using (is_staff());

revoke all on function emit_due_cycle_reminders() from anon, authenticated, public;
revoke all on function emit_daily_digest() from anon, authenticated, public;
revoke all on function expire_holds() from anon, authenticated, public;
revoke all on function offer_slot_to_waitlist(uuid) from anon, authenticated, public;
revoke all on function create_hold_appointment(uuid, text, text, smallint, gender_t, visit_type, text, int)
  from anon, authenticated, public;
revoke all on function record_message_status(text, text, text, text, text, boolean)
  from anon, authenticated, public;
revoke all on function join_waitlist(text, text, date, visit_type) from anon, authenticated, public;
revoke all on function get_no_shows_today() from anon, authenticated, public;
revoke all on function mark_no_show_followed_up(text) from anon, authenticated, public;
revoke all on function get_pending_waitlist(date) from anon, authenticated, public;

grant execute on function emit_due_cycle_reminders() to service_role;
grant execute on function emit_daily_digest() to service_role;
grant execute on function expire_holds() to service_role;
grant execute on function offer_slot_to_waitlist(uuid) to service_role;
grant execute on function create_hold_appointment(uuid, text, text, smallint, gender_t, visit_type, text, int) to service_role;
grant execute on function record_message_status(text, text, text, text, text, boolean) to service_role;
grant execute on function join_waitlist(text, text, date, visit_type) to service_role;
grant execute on function get_no_shows_today() to service_role;
grant execute on function mark_no_show_followed_up(text) to service_role;
grant execute on function get_pending_waitlist(date) to service_role;

-- cron.schedule updates the job when the name already exists (pg_cron >= 1.4).
select cron.schedule(
  'emit-due-cycle-reminders',
  '*/15 * * * *',
  $$select emit_due_cycle_reminders()$$
);

select cron.schedule(
  'emit-daily-digest',
  '15 1 * * *',
  $$select emit_daily_digest()$$
);

select cron.schedule(
  'expire-holds',
  '*/5 * * * *',
  $$select expire_holds()$$
);
