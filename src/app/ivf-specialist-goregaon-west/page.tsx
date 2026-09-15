import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { buttonVariants, cn } from "@/lib/utils";
import { DOCTOR_NAME, PRIOR_CENTRES } from "@/config/site";
import { Reveal } from "@/components/site/reveal";

const TITLE = "IVF Specialist in Goregaon West | Dr. Sayali Sawant";
const DESCRIPTION =
  "Consult Dr. Sayali Sawant, IVF and infertility specialist in Goregaon West, Mumbai, for evaluation and cycle planning. Book OPD appointment online.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/ivf-specialist-goregaon-west" },
};

export default function IvfSpecialistGoregaonWestPage() {
  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "IVF specialist in Goregaon West", path: "/ivf-specialist-goregaon-west" },
        ])}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-primary">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / IVF specialist in Goregaon West
        </p>
        <h1 className="font-display mt-3 text-3xl text-ink">
          IVF specialist in Goregaon West
        </h1>
        <Reveal className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            {DOCTOR_NAME} is an IVF/Infertility Specialist and obstetrician
            practising in Goregaon West, Mumbai. Couples from Goregaon, Malad,
            Jogeshwari and Andheri West can book an OPD appointment for
            infertility evaluation, IUI or IVF consultation, and cycle planning.
            This page describes the outpatient visit. Procedures that need an
            embryology laboratory are coordinated with a fertility centre after
            counselling.
          </p>
          <p>
            She completed MBBS at Maharashtra University of Health Sciences,
            Nashik (2017) and DNB Obstetrics & Gynaecology at the National
            Board of Examinations (2020). Before independent OPD practice she
            worked at {PRIOR_CENTRES[0]} and {PRIOR_CENTRES[1]}. Those roles
            involved infertility evaluation and assisted-reproduction
            counselling — the same areas covered in this clinic&apos;s fertility
            visits.
          </p>
          <h2 className="font-display pt-2 text-xl text-ink">
            What a fertility consultation includes
          </h2>
          <p>
            A first infertility visit is unhurried. Bring previous hormone
            tests, ultrasound scans, semen analysis if you have them,
            prescriptions, and photo ID. The doctor reviews what has already
            been done, explains what is still unclear, and     discusses whether
            further tests, timed intercourse, IUI, or IVF consultation is the
            reasonable next step for your situation. This website does not
            publish outcome percentages, and no treatment is started through the
            booking form.
          </p>
          <p>
            Follow-up visits can cover cycle planning, injection teaching
            referrals, and review of results. Pregnancy after treatment is
            followed in the antenatal clinic if you choose to continue care
            here. Pre-conception counselling is available if you are planning a
            pregnancy and want to discuss existing conditions first.
          </p>
          <h2 className="font-display pt-2 text-xl text-ink">
            First visit and directions
          </h2>
          <p>
            Book an OPD slot online and select the infertility visit type. You
            will receive a WhatsApp confirmation with directions to the Goregaon
            West clinic. Parking and the nearest station are listed on the home
            page. Patients travelling from Kandivali or Borivali can use the
            Western line to Goregaon and then a short local ride.
          </p>
          <p>
            This website is for general information and to book OPD appointment
            times. It is not a substitute for a clinical consultation. For
            severe pain, heavy bleeding, or any emergency, go to the nearest
            hospital emergency department or call 108 / 112.
          </p>
        </Reveal>
        <Link href="/#book" className={cn(buttonVariants(), "mt-8")}>
          Book OPD slot
        </Link>
      </article>
    </SiteShell>
  );
}
