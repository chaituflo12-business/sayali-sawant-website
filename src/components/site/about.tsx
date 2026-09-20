import { DOCTOR_NAME, QUALIFICATIONS } from "@/config/site";
import { Reveal } from "@/components/site/reveal";

export function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-surface-warm py-14 md:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          About {DOCTOR_NAME}
        </h2>
        <Reveal className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <article className="space-y-4 text-base leading-relaxed text-muted">
            <p>
              {DOCTOR_NAME} is a Consultant Obstetrician and Gynaecologist and
              IVF/Infertility Specialist practising in Goregaon West, Mumbai. She
              completed her MBBS at Maharashtra University of Health Sciences,
              Nashik in 2017, and her DNB in Obstetrics & Gynaecology in 2020,
              training at KEM Hospital, Pune.
            </p>
            <p>
              Her consultation style is unhurried and evidence-based. She
              explains options in plain language so that patients can take part
              in decisions about antenatal care, fertility treatment, and
              gynaecological conditions. She sees patients from Goregaon, Malad,
              Jogeshwari, Andheri West, Kandivali and Borivali.
            </p>
            <p>
              A first visit typically includes a discussion of your concerns, a
              review of previous reports if you have them, and a clear plan for
              the next steps. This clinic is an outpatient (OPD) practice;
              emergencies are directed to hospital emergency departments.
            </p>
          </article>
          <ol className="card-soft rounded-2xl bg-surface p-5">
            {QUALIFICATIONS.map((item) => (
              <li
                key={item.degree}
                className="border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
              >
                <p className="font-display text-base text-ink">{item.degree}</p>
                {item.trainedAt ? (
                  <p className="mt-1 text-sm text-ink">{item.trainedAt}</p>
                ) : null}
                <p className="mt-1 text-sm text-muted">
                  {item.institution} ({item.year})
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
