export const DOCTOR_NAME = "Dr. Sayali Sawant";
export const SPECIALITY_SHORT = "Obstetrician & Gynaecologist";

export const SPECIALITY_LINE =
  "Obstetrician · Gynaecologist · IVF Specialist";
export const PRACTICE_START_YEAR = 2017;
export const MMC_REG_NO = "2017/08/3926";

/**
 * Flip to true only once AiSensy templates are Meta-approved and Make is
 * sending messages on its own. Until then the site must not promise an
 * automatic WhatsApp message, because none will arrive.
 */
export const WHATSAPP_AUTOMATION_LIVE = false;

export type Qualification = {
  degree: string;
  /** The body that confers the degree. */
  institution: string;
  /** Where the training or residency was done, when it differs. */
  trainedAt?: string;
  year: number;
};

export const QUALIFICATIONS: ReadonlyArray<Qualification> = [
  {
    degree: "MBBS",
    institution: "Maharashtra University of Health Sciences, Nashik",
    year: 2017,
  },
  {
    degree: "DNB Obstetrics & Gynaecology",
    institution: "National Board of Examinations",
    trainedAt: "KEM Hospital, Pune",
    year: 2020,
  },
];

export const LOCALITY = "Goregaon West";
export const CITY = "Mumbai";
export const PINCODE = "400104";
export const CATCHMENT = [
  "Goregaon East",
  "Malad",
  "Jogeshwari",
  "Andheri West",
  "Kandivali",
  "Borivali",
] as const;

export const LANGUAGES = ["English", "Hindi", "Marathi"] as const;

export const CLINIC_ADDRESS =
  "Divya Jyothi Cooperative Housing Society, 25/4, Shastri Nagar Rd Number 2, Azad Nagar, Mitha Nagar, Goregaon West, Mumbai, Maharashtra 400104";

export const LANDMARKS =
  "On Shastri Nagar Road Number 2, off Azad Nagar, Goregaon West.";

export const PARKING_NOTE =
  "Street parking near the clinic. Confirm on WhatsApp before you arrive if you are driving.";

export const NEAREST_STATION =
  "Goregaon station (Western line) and Goregaon Metro. Autos run to Shastri Nagar Road Number 2 — use Get directions.";

export const GOOGLE_PLACE_ID = "PLACEHOLDER_GOOGLE_PLACE_ID";

export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CLINIC_ADDRESS)}`;

// A Place ID gives the most accurate pin, but until the Google Business
// Profile is claimed the address query is the only link that actually works.
export const GOOGLE_MAPS_DIR_URL = GOOGLE_PLACE_ID.startsWith("PLACEHOLDER")
  ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CLINIC_ADDRESS)}`
  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CLINIC_ADDRESS)}&destination_place_id=${GOOGLE_PLACE_ID}`;

export const GOOGLE_MAPS_EMBED_QUERY = encodeURIComponent(CLINIC_ADDRESS);

export const GEO = {
  latitude: 19.1663,
  longitude: 72.8493,
};

export const WHATSAPP_NUMBER = "+919000000000";
export const PHONE = "+91 90000 00000";
export const EMAIL = "appointments@drsayalisawant.com";

export const CONSULT_FEE: number | null = null;

export const PROFILE_PHOTO = "/images/dr-sayali-sawant.png";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/placeholder-dr-sayali-sawant",
  practo: "https://www.practo.com/mumbai/doctor/placeholder-dr-sayali-sawant",
  justdial: "https://www.justdial.com/Mumbai/placeholder-Dr-Sayali-Sawant",
  googleBusiness: "https://maps.google.com/?cid=placeholder",
} as const;

export const EMERGENCY_HOSPITAL_NAME =
  "Nearest hospital emergency department";
export const EMERGENCY_PHONE = "108";

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SessionHours = {
  start: string;
  end: string;
};

export type OpdDay = {
  weekday: WeekdayIndex;
  label: string;
  closed: boolean;
  sessions: SessionHours[];
  breakLabel?: string;
};

export const OPD_HOURS: OpdDay[] = [
  { weekday: 0, label: "Sunday", closed: true, sessions: [] },
  {
    weekday: 1,
    label: "Monday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
  {
    weekday: 2,
    label: "Tuesday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
  {
    weekday: 3,
    label: "Wednesday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
  {
    weekday: 4,
    label: "Thursday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
  {
    weekday: 5,
    label: "Friday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
  {
    weekday: 6,
    label: "Saturday",
    closed: false,
    sessions: [{ start: "18:00", end: "20:00" }],
  },
];

export const SLOT_MINUTES = 15;
export const SLOT_CAPACITY = 1;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.drsayalisawant.com";

export function yearsInPractice(now = new Date()): number {
  return Math.max(0, now.getFullYear() - PRACTICE_START_YEAR);
}

export function telHref(): string {
  return `tel:${PHONE.replace(/\s/g, "")}`;
}

export function whatsappHref(text?: string): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function sameAs(): string[] {
  return [
    SOCIAL_LINKS.linkedin,
    SOCIAL_LINKS.practo,
    SOCIAL_LINKS.justdial,
    SOCIAL_LINKS.googleBusiness,
  ];
}

export const HOME_TITLE =
  "Dr. Sayali Sawant | Gynaecologist & IVF, Goregaon West";

export const HOME_DESCRIPTION =
  "Consult Dr. Sayali Sawant, gynaecologist in Goregaon West, Mumbai, for pregnancy, fertility and women's health. Book OPD appointment online.";
