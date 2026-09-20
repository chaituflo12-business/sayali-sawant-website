export type ServiceIcon =
  | "Baby"
  | "HeartPulse"
  | "CalendarHeart"
  | "Microscope"
  | "Dna"
  | "Activity"
  | "Stethoscope"
  | "ShieldCheck"
  | "Sun"
  | "Users"
  | "ClipboardCheck"
  | "Flower2";

export type ServiceGroup = "pregnancy" | "fertility" | "gynae";

export const SERVICES: ReadonlyArray<{
  title: string;
  body: string;
  icon: ServiceIcon;
  group: ServiceGroup;
}> = [
  {
    title: "Antenatal care and pregnancy follow-up",
    group: "pregnancy",
    icon: "Baby",
    body: "Scheduled visits through pregnancy to review your health, baby's growth on reports you bring, and the next steps in your care plan.",
  },
  {
    title: "High-risk pregnancy monitoring",
    group: "pregnancy",
    icon: "HeartPulse",
    body: "Closer follow-up when pregnancy is complicated by conditions such as hypertension, diabetes, previous losses, or other medical history.",
  },
  {
    title: "Delivery planning and counselling",
    group: "pregnancy",
    icon: "CalendarHeart",
    body: "A discussion of place of birth, timing, and what to expect, so you can plan with your family and the hospital team.",
  },
  {
    title: "Infertility evaluation",
    group: "fertility",
    icon: "Microscope",
    body: "A structured review of history, previous tests, and a clear plan for further evaluation. No tests are ordered through this website.",
  },
  {
    title: "IUI / IVF consultation and cycle planning",
    group: "fertility",
    icon: "Dna",
    body: "Counselling on when IUI or IVF may be considered, what a cycle involves, and how to coordinate with a fertility centre.",
  },
  {
    title: "PCOS and menstrual disorders",
    group: "gynae",
    icon: "Activity",
    body: "Assessment of irregular periods, PCOS-related concerns, and heavy or painful bleeding, with options explained in plain language.",
  },
  {
    title: "Fibroids, ovarian cysts and abnormal uterine bleeding",
    group: "gynae",
    icon: "Stethoscope",
    body: "Evaluation of common gynaecological conditions using your history and existing scans, and a discussion of medical or surgical options.",
  },
  {
    title: "Contraception and family planning",
    group: "gynae",
    icon: "ShieldCheck",
    body: "Information on contraceptive methods suited to your health and plans, including spacing after pregnancy.",
  },
  {
    title: "Menopause care",
    group: "gynae",
    icon: "Sun",
    body: "Support for perimenopause and menopause symptoms, bone and heart-health discussion, and hormone therapy where it is appropriate.",
  },
  {
    title: "Adolescent gynaecology",
    group: "gynae",
    icon: "Users",
    body: "Confidential consultations for young women with period problems, delayed periods, or questions about puberty and menstrual health.",
  },
  {
    title: "Pre-conception counselling",
    group: "gynae",
    icon: "ClipboardCheck",
    body: "A visit before you try to conceive, covering existing conditions, medicines, vaccinations, and tests that may be useful.",
  },
  {
    title: "Routine women's health check-up",
    group: "gynae",
    icon: "Flower2",
    body: "A general gynaecology visit for screening discussion, breast awareness, and concerns that do not need emergency care.",
  },
];
