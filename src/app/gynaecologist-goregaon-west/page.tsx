import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { buttonVariants, cn } from "@/lib/utils";
import { DOCTOR_NAME, LOCALITY, CITY } from "@/config/site";

const TITLE = "Gynaecologist in Goregaon West | Dr. Sayali Sawant";
const DESCRIPTION =
  "See Dr. Sayali Sawant, lady gynaecologist in Goregaon West, Mumbai, for pregnancy, PCOS and women's health. Book OPD appointment online.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/gynaecologist-goregaon-west" },
};

export default function GynaecologistGoregaonWestPage() {
  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gynaecologist in Goregaon West", path: "/gynaecologist-goregaon-west" },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-primary">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / Gynaecologist in Goregaon West
        </p>
        <h1 className="font-display mt-3 text-3xl text-ink">
          Gynaecologist in Goregaon West
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            {DOCTOR_NAME} is a Consultant Obstetrician and Gynaecologist
            practising in {LOCALITY}, {CITY}. Women from Goregaon East, Malad,
            Jogeshwari, Andheri West, Kandivali and Borivali come to this
            outpatient clinic for period problems, pregnancy follow-up, and
            routine women&apos;s health visits. The clinic has no separate brand
            name: the practice is listed under the doctor&apos;s name.
          </p>
          <p>
            If you are looking for a female gynaecologist in Goregaon West, a
            first visit is a conversation. You describe what is worrying you,
            share any reports you already have, and leave with a plan you
            understand. Consultations are in English, Hindi or Marathi.
            Appointments are 15 minutes and are booked online or on WhatsApp,
            which is more reliable than walking in.
          </p>
          <h2 className="font-display pt-2 text-xl text-ink">
            Services at this OPD
          </h2>
          <p>
            The clinic offers antenatal care and pregnancy follow-up, monitoring
            when a pregnancy is high-risk, and delivery planning with the
            hospital you choose. Gynaecology visits cover PCOS and menstrual
            disorders, fibroids, ovarian cysts, abnormal uterine bleeding,
            contraception, menopause care, adolescent gynaecology, and a routine
            women&apos;s health check-up. Infertility evaluation and IUI or IVF
            consultation are available on a separate visit type if that is why
            you are coming.
          </p>
          <h2 className="font-display pt-2 text-xl text-ink">
            What happens at the first visit
          </h2>
          <p>
            Please bring previous prescriptions, ultrasound or blood reports,
            and a photo ID. You do not fill a medical-history form on this
            website. The doctor will ask about your concern, review the papers
            you bring, and explain options in plain language. If further tests
            or a hospital visit are needed, that is discussed with you before
            anything is arranged. This is an outpatient clinic, not a labour
            room or emergency department.
          </p>
          <h2 className="font-display pt-2 text-xl text-ink">
            Directions and catchment
          </h2>
          <p>
            The OPD is in Goregaon West, Mumbai 400104, with parking notes and
            the nearest station listed on the location section of the home page.
            Use Get directions for walking or driving from Goregaon station or
            from Malad and Jogeshwari. Patients travelling from Andheri West
            often use the Western line or the metro and then a short auto ride.
            Confirm the final pin location on WhatsApp if you are visiting for
            the first time.
          </p>
          <p>
            For labour pain, heavy bleeding, severe abdominal pain, or any
            emergency, go to the nearest hospital emergency department or call
            108 / 112. Use this site to read about the practice and to book OPD
            appointment slots only.
          </p>
        </div>
        <Link href="/#book" className={cn(buttonVariants(), "mt-8")}>
          Book OPD slot
        </Link>
      </article>
    </SiteShell>
  );
}
