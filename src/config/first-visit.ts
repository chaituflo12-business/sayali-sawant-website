/**
 * What to bring to a first visit. Practical, not clinical — but Dr. Sawant
 * should still confirm it matches how she runs her OPD.
 */

export type ChecklistIcon = "Baby" | "Dna" | "Flower2";

export type VisitChecklist = {
  id: string;
  title: string;
  /** Short label for the tab; falls back to the title. */
  tabLabel?: string;
  forWhom: string;
  icon: ChecklistIcon;
  items: string[];
};

export const FIRST_VISIT_CHECKLISTS: VisitChecklist[] = [
  {
    id: "pregnancy",
    title: "Pregnancy",
    forWhom: "Newly pregnant, or moving your care here",
    icon: "Baby",
    items: [
      "The first day of your last period",
      "Any scans and blood reports from this pregnancy",
      "Records from previous pregnancies or deliveries",
      "A list of the medicines and supplements you take",
      "Your blood group card, if you have one",
    ],
  },
  {
    id: "fertility",
    title: "Fertility",
    forWhom: "Trying to conceive. Please come together if you can",
    icon: "Dna",
    items: [
      "Your period dates for the last three months",
      "Every previous report: hormones, scans, tube tests",
      "Your partner's semen analysis, if done",
      "Notes from any earlier IUI or IVF cycles",
      "A list of the medicines you both take",
    ],
  },
  {
    id: "gynae",
    title: "Periods, PCOS and other concerns",
    tabLabel: "Periods & PCOS",
    forWhom: "Irregular or heavy periods, pain, check-ups",
    icon: "Flower2",
    items: [
      "Your period dates, or your period-tracking app",
      "Previous ultrasound reports",
      "Recent blood reports such as thyroid, sugar and haemoglobin",
      "A list of the medicines you take",
      "Your questions, written down so none are forgotten",
    ],
  },
];
