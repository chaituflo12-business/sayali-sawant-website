#!/usr/bin/env node
// Reminders must stay date prompts. This guards the denylist that keeps drug
// names and doses out of WhatsApp messages.

const MEDICINE_DENYLIST =
  /\b(mg|iu|units?|inject(ion)?|dose|tablets?|hcg|fsh|lh|letrozole|clomiphene|progesterone|trigger|gonal|menopur|lupride|cetrotide|ovitrelle)\b/i;

const cases = [
  { note: "150 IU", allowed: false },
  { note: "letrozole", allowed: false },
  { note: "Take 2 tablets tonight", allowed: false },
  { note: "Injection due", allowed: false },
  { note: "Day 9 scan", allowed: true },
  { note: "Review visit after scan", allowed: true },
  { note: "Bring previous reports", allowed: true },
];

let failures = 0;

for (const { note, allowed } of cases) {
  const rejected = MEDICINE_DENYLIST.test(note);
  const pass = rejected === !allowed;
  if (!pass) failures += 1;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${allowed ? "accept" : "reject"}  "${note}"`,
  );
}

const source = await import("node:fs/promises").then((fs) =>
  fs.readFile(new URL("../src/lib/validation/appointment.ts", import.meta.url), "utf8"),
);

if (!source.includes(MEDICINE_DENYLIST.source)) {
  failures += 1;
  console.log("FAIL  denylist in src/lib/validation/appointment.ts has drifted");
} else {
  console.log("PASS  denylist matches src/lib/validation/appointment.ts");
}

if (failures > 0) {
  console.error(`\n${failures} denylist check(s) failed.`);
  process.exit(1);
}

console.log("\nAll denylist checks passed.");
