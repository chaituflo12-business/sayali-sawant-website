-- Dr. Sayali Sawant OPD — initial schema, RLS, RPCs, triggers, cron.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists clinic_settings (
  id smallint primary key default 1 check (id = 1),
  doctor_name text not null default 'Dr. Sayali Sawant',
  address text not null,
  maps_url text not null,
  site_url text not null
);

insert into clinic_settings (id, address, maps_url, site_url)
values (
  1,
  '[Clinic address to be confirmed], Goregaon West, Mumbai 400104',
  'https://www.google.com/maps/dir/?api=1&destination_place_id=PLACEHOLDER_GOOGLE_PLACE_ID',
  'https://www.drsayalisawant.com'
)
on conflict (id) do nothing;

create table opd_schedule (
  id smallserial primary key,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes smallint not null default 15,
  capacity_per_slot smallint not null default 1,
  active boolean not null default true
);

create table slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity smallint not null default 1,
  blocked boolean not null default false,
  block_reason text,
  unique (starts_at)
);

create type appt_status as enum ('booked','rescheduled','cancelled','completed','no_show');
create type visit_type as enum ('new_consult','follow_up','antenatal','infertility','procedure_review','other');
create type gender_t as enum ('female','male','other','prefer_not_to_say');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  slot_id uuid not null references slots(id),
  patient_name text not null check (char_length(patient_name) between 2 and 80),
  whatsapp_e164 text not null check (whatsapp_e164 ~ '^\+91[6-9][0-9]{9}$'),
  age smallint not null check (age between 1 and 110),
  gender gender_t not null,
  visit_type visit_type not null,
  reason text check (char_length(reason) <= 160),
  status appt_status not null default 'booked',
  manage_token uuid not null default gen_random_uuid(),
  consent_at timestamptz not null default now(),
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index appointments_one_active_per_slot
  on appointments (slot_id)
  where status in ('booked','rescheduled');

create unique index appointments_one_active_per_phone_day
  on appointments (whatsapp_e164, (date(created_at at time zone 'Asia/Kolkata')))
  where status in ('booked','rescheduled');

create table webhook_outbox (
  id bigserial primary key,
  event text not null,
  payload jsonb not null,
  attempts smallint not null default 0,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table staff (
  user_id uuid primary key references auth.users(id),
  role text not null check (role in ('doctor','reception')),
  display_name text not null
);

create table booking_attempts (
  id bigserial primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index booking_attempts_ip_created
  on booking_attempts (ip_hash, created_at);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create or replace function format_slot_display(p_start timestamptz, p_end timestamptz)
returns text
language sql
immutable
as $$
  select
    to_char(p_start at time zone 'Asia/Kolkata', 'Dy DD Mon')
    || ', '
    || trim(to_char(p_start at time zone 'Asia/Kolkata', 'HH12:MI AM'))
    || '–'
    || trim(to_char(p_end at time zone 'Asia/Kolkata', 'HH12:MI AM'));
$$;

create or replace function ist_iso(p_ts timestamptz)
returns text
language sql
immutable
as $$
  select to_char(p_ts at time zone 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS') || '+05:30';
$$;

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
    v_event := 'appointment.created';
  elsif new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    v_event := 'appointment.cancelled';
  elsif new.slot_id is distinct from old.slot_id or new.status = 'rescheduled' then
    v_event := 'appointment.rescheduled';
  else
    return new;
  end if;

  insert into webhook_outbox (event, payload)
  values (v_event, appointment_webhook_payload(v_event, new));
  return new;
end;
$$;

create trigger appointments_outbox
  after insert or update on appointments
  for each row execute function appointments_webhook_outbox();

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

create or replace function get_available_slots(from_date timestamptz, to_date timestamptz)
returns table (
  slot_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  remaining smallint
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.starts_at,
    s.ends_at,
    (s.capacity - coalesce((
      select count(*)::smallint
      from appointments a
      where a.slot_id = s.id
        and a.status in ('booked', 'rescheduled')
    ), 0)) as remaining
  from slots s
  where s.blocked = false
    and s.starts_at >= greatest(from_date, now())
    and s.starts_at < to_date
    and (s.capacity - coalesce((
      select count(*)::smallint
      from appointments a
      where a.slot_id = s.id
        and a.status in ('booked', 'rescheduled')
    ), 0)) > 0
  order by s.starts_at;
$$;

create or replace function book_appointment(
  p_slot_id uuid,
  p_patient_name text,
  p_whatsapp_e164 text,
  p_age smallint,
  p_gender gender_t,
  p_visit_type visit_type,
  p_reason text default null,
  p_source text default 'web'
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

  insert into appointments (
    slot_id, patient_name, whatsapp_e164, age, gender, visit_type, reason, source
  ) values (
    p_slot_id, p_patient_name, p_whatsapp_e164, p_age, p_gender, p_visit_type, nullif(p_reason, ''), p_source
  )
  returning * into v_row;

  return jsonb_build_object(
    'ok', true,
    'id', v_row.id,
    'public_ref', v_row.public_ref,
    'manage_token', v_row.manage_token,
    'starts_at', v_slot.starts_at,
    'ends_at', v_slot.ends_at
  );
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint ilike '%one_active_per_slot%' or v_constraint ilike '%slots_starts_at%' then
      return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time was just taken, please pick another');
    end if;
    if v_constraint ilike '%one_active_per_phone_day%' then
      return jsonb_build_object('ok', false, 'code', 'DUPLICATE_PHONE_TODAY', 'message', 'This number already has an appointment today.');
    end if;
    return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time was just taken, please pick another');
end;
$$;

create or replace function reschedule_appointment(p_token uuid, p_new_slot_id uuid)
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
  select * into v_row from appointments where manage_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Appointment not found.');
  end if;
  if v_row.status not in ('booked', 'rescheduled') then
    return jsonb_build_object('ok', false, 'code', 'NOT_ACTIVE', 'message', 'This appointment can no longer be changed.');
  end if;

  select * into v_slot from slots where id = p_new_slot_id;
  if not found or v_slot.blocked or v_slot.starts_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time is not available.');
  end if;

  update appointments
  set slot_id = p_new_slot_id, status = 'rescheduled'
  where id = v_row.id
  returning * into v_row;

  return jsonb_build_object(
    'ok', true,
    'public_ref', v_row.public_ref,
    'manage_token', v_row.manage_token,
    'starts_at', v_slot.starts_at,
    'ends_at', v_slot.ends_at
  );
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint ilike '%one_active_per_slot%' then
      return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time was just taken, please pick another');
    end if;
    return jsonb_build_object('ok', false, 'code', 'SLOT_TAKEN', 'message', 'That time was just taken, please pick another');
end;
$$;

create or replace function cancel_appointment(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row appointments;
begin
  select * into v_row from appointments where manage_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Appointment not found.');
  end if;
  if v_row.status not in ('booked', 'rescheduled') then
    return jsonb_build_object('ok', false, 'code', 'NOT_ACTIVE', 'message', 'This appointment is already closed.');
  end if;

  update appointments
  set status = 'cancelled'
  where id = v_row.id
  returning * into v_row;

  return jsonb_build_object('ok', true, 'public_ref', v_row.public_ref);
end;
$$;

create or replace function get_appointment_by_token(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row appointments;
  v_slot slots;
begin
  select * into v_row from appointments where manage_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  end if;
  select * into v_slot from slots where id = v_row.slot_id;
  return jsonb_build_object(
    'ok', true,
    'public_ref', v_row.public_ref,
    'patient_name', v_row.patient_name,
    'status', v_row.status,
    'visit_type', v_row.visit_type,
    'starts_at', v_slot.starts_at,
    'ends_at', v_slot.ends_at
  );
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
    'ends_at', s.ends_at,
    'status', a.status,
    'visit_type', a.visit_type
  ) order by s.starts_at), '[]'::jsonb)
  from appointments a
  join slots s on s.id = a.slot_id
  where a.status in ('booked', 'rescheduled')
    and s.starts_at >= from_date
    and s.starts_at < to_date;
$$;

create or replace function assert_booking_rate_limit(
  p_ip_hash text,
  p_max int default 5,
  p_minutes int default 10
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  delete from booking_attempts
  where created_at < now() - make_interval(mins => p_minutes);

  select count(*) into v_count
  from booking_attempts
  where ip_hash = p_ip_hash
    and created_at >= now() - make_interval(mins => p_minutes);

  if v_count >= p_max then
    return false;
  end if;

  insert into booking_attempts (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

create or replace function materialise_slots(days_ahead int default 21)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d date;
  sch opd_schedule%rowtype;
  slot_start timestamptz;
  slot_end timestamptz;
  day_end timestamptz;
begin
  for d in
    select generate_series(
      (timezone('Asia/Kolkata', now()))::date,
      (timezone('Asia/Kolkata', now()))::date + days_ahead,
      interval '1 day'
    )::date
  loop
    for sch in
      select * from opd_schedule
      where active and weekday = extract(dow from d)::smallint
    loop
      slot_start := (d::timestamp + sch.start_time) at time zone 'Asia/Kolkata';
      day_end := (d::timestamp + sch.end_time) at time zone 'Asia/Kolkata';
      while slot_start + make_interval(mins => sch.slot_minutes) <= day_end loop
        slot_end := slot_start + make_interval(mins => sch.slot_minutes);
        insert into slots (starts_at, ends_at, capacity)
        values (slot_start, slot_end, sch.capacity_per_slot)
        on conflict (starts_at) do nothing;
        slot_start := slot_end;
      end loop;
    end loop;
  end loop;
end;
$$;

create or replace function mark_no_shows()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update appointments a
  set status = 'no_show'
  from slots s
  where a.slot_id = s.id
    and a.status in ('booked', 'rescheduled')
    and s.ends_at < now() - interval '2 hours';
end;
$$;

create or replace function claim_webhook_outbox(batch_size int default 20)
returns setof webhook_outbox
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select id
    from webhook_outbox
    where delivered_at is null
      and attempts < 8
      and (
        attempts = 0
        or created_at + make_interval(mins => (2 ^ attempts)::int) < now()
      )
    order by id
    limit batch_size
    for update skip locked
  )
  update webhook_outbox w
  set attempts = w.attempts + 1
  from picked
  where w.id = picked.id
  returning w.*;
end;
$$;

alter table opd_schedule enable row level security;
alter table slots enable row level security;
alter table appointments enable row level security;
alter table webhook_outbox enable row level security;
alter table staff enable row level security;
alter table clinic_settings enable row level security;
alter table booking_attempts enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Public availability only. The write RPCs are service_role, so the anon key in
-- the browser bundle cannot skip the honeypot and rate limit in the server
-- action (0002_lock_rpcs.sql restates this for existing projects).
grant execute on function get_available_slots(timestamptz, timestamptz) to anon, authenticated;
grant execute on function book_appointment(uuid, text, text, smallint, gender_t, visit_type, text, text) to service_role;
grant execute on function reschedule_appointment(uuid, uuid) to service_role;
grant execute on function cancel_appointment(uuid) to service_role;
grant execute on function get_appointment_by_token(uuid) to service_role;
grant execute on function assert_booking_rate_limit(text, int, int) to service_role;

revoke all on function get_upcoming_appointments(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function claim_webhook_outbox(int) from public, anon, authenticated;
revoke all on function materialise_slots(int) from public, anon, authenticated;
revoke all on function mark_no_shows() from public, anon, authenticated;
revoke all on function appointment_webhook_payload(text, appointments) from public, anon, authenticated;

grant select, insert, update, delete on opd_schedule, slots, appointments, webhook_outbox, clinic_settings, booking_attempts to authenticated;
grant select on staff to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy staff_select_schedule on opd_schedule
  for select to authenticated using (is_staff());
create policy staff_write_schedule on opd_schedule
  for all to authenticated using (is_staff()) with check (is_staff());

create policy staff_select_slots on slots
  for select to authenticated using (is_staff());
create policy staff_write_slots on slots
  for all to authenticated using (is_staff()) with check (is_staff());

create policy staff_select_appointments on appointments
  for select to authenticated using (is_staff());
create policy staff_write_appointments on appointments
  for all to authenticated using (is_staff()) with check (is_staff());

create policy staff_select_outbox on webhook_outbox
  for select to authenticated using (is_staff());

create policy staff_select_settings on clinic_settings
  for select to authenticated using (is_staff());
create policy staff_write_settings on clinic_settings
  for all to authenticated using (is_staff()) with check (is_staff());

create policy staff_select_staff on staff
  for select to authenticated using (is_staff());

create policy staff_attempts on booking_attempts
  for all to authenticated using (is_staff()) with check (is_staff());

insert into opd_schedule (weekday, start_time, end_time, slot_minutes, capacity_per_slot, active)
values
  (1, '10:00', '13:00', 15, 1, true),
  (1, '17:30', '20:30', 15, 1, true),
  (2, '10:00', '13:00', 15, 1, true),
  (2, '17:30', '20:30', 15, 1, true),
  (3, '10:00', '13:00', 15, 1, true),
  (3, '17:30', '20:30', 15, 1, true),
  (4, '10:00', '13:00', 15, 1, true),
  (4, '17:30', '20:30', 15, 1, true),
  (5, '10:00', '13:00', 15, 1, true),
  (5, '17:30', '20:30', 15, 1, true),
  (6, '10:00', '13:00', 15, 1, true),
  (6, '17:30', '20:30', 15, 1, true);

select materialise_slots(21);

select cron.schedule(
  'materialise-slots-nightly',
  '15 20 * * *',
  $$select materialise_slots(21)$$
);

select cron.schedule(
  'mark-no-shows',
  '*/20 * * * *',
  $$select mark_no_shows()$$
);

-- The deliver-webhooks schedule lives in 0004_cron_webhooks.sql, which reads
-- the function URL and service key from Vault.
