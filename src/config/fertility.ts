/**
 * MEDICAL CONTENT — draft written from standard fertility practice.
 * Dr. Sawant must review and approve every line before this goes live.
 * No outcome figures or success claims: those are prohibited, and they vary
 * too much between couples to be honest in a general page anyway.
 */

export type FertilityStage = {
  step: number;
  title: string;
  summary: string;
  involves: string[];
  duration: string;
};

export const FERTILITY_STAGES: FertilityStage[] = [
  {
    step: 1,
    title: "Evaluation, for both partners",
    summary:
      "Finding out what may be making conception harder, before choosing any treatment.",
    involves: [
      "A detailed history of cycles, past pregnancies and health",
      "Pelvic ultrasound and hormone blood tests",
      "Semen analysis for the male partner",
      "A test of the fallopian tubes, when it is needed",
    ],
    duration: "Usually over one or two cycles",
  },
  {
    step: 2,
    title: "Treating the cause and timing ovulation",
    summary:
      "Many couples need only this: correcting what was found and helping ovulation happen on time.",
    involves: [
      "Managing thyroid, PCOS or other findings",
      "Tablets or injections to help ovulation, where needed",
      "Follicle scans to time intercourse",
    ],
    duration: "A few cycles, reviewed at each step",
  },
  {
    step: 3,
    title: "IUI",
    summary:
      "Prepared sperm is placed in the uterus at the time of ovulation. It suits couples with open tubes and suitable sperm.",
    involves: [
      "Follicle monitoring through the cycle",
      "A short, simple procedure in the clinic setting",
      "A pregnancy test about two weeks later",
    ],
    duration: "One cycle at a time, usually tried for a few cycles",
  },
  {
    step: 4,
    title: "IVF and ICSI",
    summary:
      "Eggs are collected, fertilised in the laboratory and an embryo is placed in the uterus. Dr. Sawant plans the cycle with you and coordinates with the IVF centre.",
    involves: [
      "Counselling on whether IVF is the right next step",
      "Planning the stimulation and monitoring",
      "Follow-up care after the embryo transfer",
    ],
    duration: "About four to six weeks per cycle",
  },
];

export const WHEN_TO_SEEK_HELP = {
  title: "When to ask for an evaluation",
  points: [
    "After a year of trying without success, if the woman is under 35",
    "After six months of trying, if the woman is 35 or older",
    "Sooner with very irregular periods, known PCOS or endometriosis, past pelvic surgery, or known concerns in either partner",
  ],
};
