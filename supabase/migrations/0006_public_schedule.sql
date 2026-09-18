-- Publish the weekly OPD template so the public page, the footer and the
-- SEO schema read the same hours the doctor edits in /admin/schedule.
--
-- Without this the site had two sources of truth: the hardcoded OPD_HOURS in
-- src/config/site.ts drove everything a patient sees, while opd_schedule drove
-- the bookable slots. Editing the schedule in admin changed the slots but left
-- the advertised hours stale.

create or replace function get_opd_schedule()
returns table (
  weekday smallint,
  start_time time,
  end_time time
)
language sql
stable
security definer
set search_path = public
as $$
  select s.weekday, s.start_time, s.end_time
  from opd_schedule s
  where s.active
  order by s.weekday, s.start_time;
$$;

revoke all on function get_opd_schedule() from public;
grant execute on function get_opd_schedule() to anon, authenticated, service_role;

-- Current OPD: evenings only, Monday to Saturday, Sunday closed.
-- Seeded here so a fresh project matches the live clinic; the doctor can
-- change it from /admin/schedule afterwards and this file is never re-run.
delete from opd_schedule;

insert into opd_schedule (weekday, start_time, end_time, slot_minutes, capacity_per_slot, active)
values
  (1, '18:00', '20:00', 15, 1, true),
  (2, '18:00', '20:00', 15, 1, true),
  (3, '18:00', '20:00', 15, 1, true),
  (4, '18:00', '20:00', 15, 1, true),
  (5, '18:00', '20:00', 15, 1, true),
  (6, '18:00', '20:00', 15, 1, true);

-- Drop slots that belonged to the old template and rebuild from the new one.
delete from slots
where starts_at > now()
  and blocked = false
  and id not in (
    select slot_id from appointments where status in ('booked', 'rescheduled')
  );

select materialise_slots(21);
