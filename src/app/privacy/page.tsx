import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { DPDP_CONSENT } from "@/lib/disclaimer";
import { DOCTOR_NAME, EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Dr. Sayali Sawant's Goregaon West clinic uses booking details under the DPDP Act 2023. Book OPD appointment on the home page.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SiteShell showSticky={false}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl text-ink">Privacy</h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
          <p>
            {DOCTOR_NAME}&apos;s website collects only the details needed to
            schedule an outpatient visit: name, WhatsApp mobile number, age,
            gender, visit type, and an optional one-line reason. We do not ask
            for medical history, reports, last menstrual period, or pregnancy
            status on this form.
          </p>
          <p>
            {DPDP_CONSENT} Messages about your slot, directions, rescheduling
            and cancellation are sent on WhatsApp or SMS. We do not sell
            personal data. Staff at the clinic can see bookings in order to run
            the OPD list.
          </p>
          <p>
            Manage links in confirmation messages let you reschedule or cancel
            without creating a patient login. To ask for a copy or deletion of
            booking records, write to {EMAIL}.
          </p>
          <p>
            This notice is written to align with the Digital Personal Data
            Protection Act, 2023, for a small outpatient booking system.
          </p>
          <p>
            <Link href="/" className="text-primary underline">
              Return home
            </Link>
          </p>
        </div>
      </article>
    </SiteShell>
  );
}
