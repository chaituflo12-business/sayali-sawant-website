#!/usr/bin/env node
/**
 * Two parallel book_appointment RPCs for the same slot.
 * Expect exactly one ok:true. Requires live Supabase env.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.log("SKIP: set NEXT_PUBLIC_SUPABASE_URL to run this test.");
  process.exit(0);
}

if (!key) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY is required. book_appointment is granted to " +
      "service_role only, so the anon key cannot run this test.",
  );
  process.exit(1);
}

const supabase = createClient(url, key);
const from = new Date().toISOString();
const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const { data: slots, error } = await supabase.rpc("get_available_slots", {
  from_date: from,
  to_date: to,
});

if (error || !slots?.length) {
  console.error("No future slots returned. Materialise the OPD calendar first.");
  process.exit(1);
}

const slotId = slots[0].slot_id;

function payload(suffix) {
  return {
    p_slot_id: slotId,
    p_patient_name: `Test Patient ${suffix}`,
    p_whatsapp_e164: suffix === "A" ? "+918000000001" : "+918000000002",
    p_age: 30,
    p_gender: "female",
    p_visit_type: "new_consult",
    p_reason: "parallel booking test",
    p_source: "test",
  };
}

const [a, b] = await Promise.all([
  supabase.rpc("book_appointment", payload("A")),
  supabase.rpc("book_appointment", payload("B")),
]);

const results = [a.data, b.data];
const wins = results.filter((row) => row && row.ok === true);
const losses = results.filter((row) => row && row.ok === false);

console.log(JSON.stringify({ slotId, results }, null, 2));

if (wins.length !== 1) {
  console.error(`Expected exactly one success, got ${wins.length}`);
  process.exit(1);
}
if (!losses.some((row) => row.code === "SLOT_TAKEN")) {
  console.error("Expected the other call to return SLOT_TAKEN");
  process.exit(1);
}

console.log("PASS: exactly one of two parallel bookings succeeded.");
