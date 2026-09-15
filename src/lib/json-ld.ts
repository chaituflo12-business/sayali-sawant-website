import {
  CATCHMENT,
  CLINIC_ADDRESS,
  CITY,
  DOCTOR_NAME,
  GEO,
  GOOGLE_MAPS_URL,
  LANGUAGES,
  LOCALITY,
  MMC_REG_NO,
  OPD_HOURS,
  type OpdDay,
  PHONE,
  PINCODE,
  QUALIFICATIONS,
  SITE_URL,
  sameAs,
} from "@/config/site";
import { FAQ_ITEMS } from "@/config/faq";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function openingHoursSpecification(hours: OpdDay[]) {
  return hours.flatMap((day) =>
    day.sessions.map((session) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: WEEKDAY_NAMES[day.weekday],
      opens: session.start,
      closes: session.end,
    })),
  );
}

export function homeJsonLd(hours: OpdDay[] = OPD_HOURS) {
  const clinicId = `${SITE_URL}/#clinic`;
  const physicianId = `${SITE_URL}/#physician`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": clinicId,
        name: DOCTOR_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        telephone: PHONE.replace(/\s/g, ""),
        address: {
          "@type": "PostalAddress",
          streetAddress: CLINIC_ADDRESS,
          addressLocality: LOCALITY,
          addressRegion: "Maharashtra",
          postalCode: PINCODE,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: GEO.latitude,
          longitude: GEO.longitude,
        },
        openingHoursSpecification: openingHoursSpecification(hours),
        sameAs: sameAs(),
        availableLanguage: [...LANGUAGES],
        areaServed: [LOCALITY, CITY, ...CATCHMENT].map((name) => ({
          "@type": "AdministrativeArea",
          name,
        })),
        medicalSpecialty: [
          "Gynecologic",
          "Obstetric",
          "ReproductiveHealth",
        ],
        hasMap: GOOGLE_MAPS_URL,
        employee: { "@id": physicianId },
        potentialAction: {
          "@type": "ReserveAction",
          name: "Book OPD appointment",
          target: `${SITE_URL}/#book`,
        },
      },
      {
        "@type": "Physician",
        "@id": physicianId,
        name: DOCTOR_NAME,
        url: SITE_URL,
        telephone: PHONE.replace(/\s/g, ""),
        medicalSpecialty: [
          "Gynecologic",
          "Obstetric",
          "ReproductiveHealth",
        ],
        availableLanguage: [...LANGUAGES],
        address: {
          "@type": "PostalAddress",
          streetAddress: CLINIC_ADDRESS,
          addressLocality: LOCALITY,
          addressRegion: "Maharashtra",
          postalCode: PINCODE,
          addressCountry: "IN",
        },
        identifier: {
          "@type": "PropertyValue",
          name: "Maharashtra Medical Council Registration",
          value: MMC_REG_NO,
        },
        hasCredential: QUALIFICATIONS.map((q) => ({
          "@type": "EducationalOccupationalCredential",
          credentialCategory: q.degree,
          recognizedBy: {
            "@type": "Organization",
            name: q.institution,
          },
          dateCreated: String(q.year),
        })),
        worksFor: { "@id": clinicId },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
