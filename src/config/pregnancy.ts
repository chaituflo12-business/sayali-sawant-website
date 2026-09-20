/**
 * MEDICAL CONTENT — draft written from standard Indian antenatal practice.
 * Dr. Sawant must review and approve every line before this goes live.
 * Keep it general: no drug names, no doses, no outcome claims.
 */

export type JourneyItemKind = "visit" | "scan" | "test" | "vaccine" | "guidance";

export type JourneyItem = {
  kind: JourneyItemKind;
  when: string;
  title: string;
  body: string;
};

export type Trimester = {
  id: "first" | "second" | "third";
  name: string;
  weeks: string;
  /** Inclusive week range, used to draw the 40-week bar. */
  from: number;
  to: number;
  cadence: string;
  items: JourneyItem[];
};

export const TRIMESTERS: Trimester[] = [
  {
    id: "first",
    name: "First trimester",
    weeks: "Weeks 1 to 13",
    from: 1,
    to: 13,
    cadence: "A visit to confirm the pregnancy, then about monthly",
    items: [
      {
        kind: "visit",
        when: "Early",
        title: "Confirming the pregnancy",
        body: "A first consultation to go through your health, any past pregnancies and the medicines you take, and to plan the months ahead.",
      },
      {
        kind: "scan",
        when: "6 to 9 weeks",
        title: "Early pregnancy scan",
        body: "Confirms the pregnancy is in the womb, checks the heartbeat and dates the pregnancy.",
      },
      {
        kind: "test",
        when: "First visits",
        title: "First blood and urine tests",
        body: "Blood group, haemoglobin, thyroid, blood sugar and routine infection screening, as advised for your history.",
      },
      {
        kind: "scan",
        when: "11 to 14 weeks",
        title: "NT scan with screening blood test",
        body: "An early look at the baby's development, paired with a blood test that screens for some chromosomal conditions.",
      },
      {
        kind: "guidance",
        when: "Throughout",
        title: "Supplements and everyday care",
        body: "Guidance on folic acid, food, nausea, work and travel in the early weeks.",
      },
    ],
  },
  {
    id: "second",
    name: "Second trimester",
    weeks: "Weeks 14 to 27",
    from: 14,
    to: 27,
    cadence: "About once a month",
    items: [
      {
        kind: "scan",
        when: "18 to 22 weeks",
        title: "Anomaly scan",
        body: "A detailed scan of the baby's organs and growth, and the position of the placenta.",
      },
      {
        kind: "test",
        when: "24 to 28 weeks",
        title: "Sugar test for pregnancy diabetes",
        body: "A glucose test to pick up gestational diabetes, which is common and manageable when found early.",
      },
      {
        kind: "vaccine",
        when: "As scheduled",
        title: "Vaccinations",
        body: "Tetanus and diphtheria protection as per the national schedule, and other vaccines if recommended for you.",
      },
      {
        kind: "guidance",
        when: "Throughout",
        title: "Iron, calcium and blood pressure",
        body: "Supplements as advised, with your weight and blood pressure checked at every visit.",
      },
    ],
  },
  {
    id: "third",
    name: "Third trimester",
    weeks: "Weeks 28 to 40",
    from: 28,
    to: 40,
    cadence: "Every 2 weeks until 36 weeks, then weekly",
    items: [
      {
        kind: "scan",
        when: "28 to 36 weeks",
        title: "Growth scans",
        body: "Checks the baby's growth, the fluid around the baby and the baby's position, as needed.",
      },
      {
        kind: "guidance",
        when: "From 28 weeks",
        title: "Knowing your baby's movements",
        body: "How to notice your baby's usual pattern of movement, and what to do if it changes.",
      },
      {
        kind: "visit",
        when: "From 34 weeks",
        title: "Planning the birth",
        body: "Where and how you plan to deliver, what to pack, and when to set off for the hospital.",
      },
    ],
  },
];

/** Key moments drawn as markers on the 40-week bar. */
export const MILESTONES: { week: number; label: string }[] = [
  { week: 7.5, label: "Early scan" },
  { week: 12.5, label: "NT scan" },
  { week: 20, label: "Anomaly scan" },
  { week: 26, label: "Sugar test" },
  { week: 32, label: "Growth scan" },
  { week: 36, label: "Weekly visits" },
];

/** Shown prominently: these are not things to book an OPD slot for. */
export const WARNING_SIGNS: string[] = [
  "Bleeding from the vagina",
  "Leaking or gushing of fluid",
  "Your baby moving less than usual",
  "Regular, painful contractions before 37 weeks",
  "Severe headache, blurred vision or swelling of the face and hands",
  "Fever, or severe or constant pain in the abdomen",
];

export const SCAN_LEGAL_NOTE =
  "Ultrasound in pregnancy is done to check the baby's health. Determining the sex of the baby is prohibited by law in India and is not done.";
