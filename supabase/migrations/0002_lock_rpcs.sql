-- Supersedes the anon grants in 0001. 0001 is frozen; never edit an applied migration.
--
-- Lock write RPCs to service_role.
--
-- The anon key ships in the browser bundle, so anything granted to anon can be
-- called directly and would bypass the honeypot and rate limit in the server
-- action. Only get_available_slots stays public: it returns no personal data.

revoke execute on function book_appointment(
  uuid, text, text, smallint, gender_t, visit_type, text, text
) from anon, authenticated, public;

revoke execute on function reschedule_appointment(uuid, uuid)
  from anon, authenticated, public;

revoke execute on function cancel_appointment(uuid)
  from anon, authenticated, public;

revoke execute on function get_appointment_by_token(uuid)
  from anon, authenticated, public;

revoke execute on function assert_booking_rate_limit(text, int, int)
  from anon, authenticated, public;

grant execute on function book_appointment(
  uuid, text, text, smallint, gender_t, visit_type, text, text
) to service_role;

grant execute on function reschedule_appointment(uuid, uuid) to service_role;
grant execute on function cancel_appointment(uuid) to service_role;
grant execute on function get_appointment_by_token(uuid) to service_role;
grant execute on function assert_booking_rate_limit(text, int, int) to service_role;

grant execute on function get_upcoming_appointments(timestamptz, timestamptz) to service_role;
grant execute on function claim_webhook_outbox(int) to service_role;
grant execute on function materialise_slots(int) to service_role;
grant execute on function mark_no_shows() to service_role;

-- Public availability stays readable by the anon key.
grant execute on function get_available_slots(timestamptz, timestamptz) to anon, authenticated;
