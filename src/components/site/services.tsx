import { SERVICES } from "@/config/services";

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          Gynaecology, pregnancy and fertility care in Goregaon West
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Outpatient consultations for women from Goregaon, Malad, Jogeshwari
          and Andheri West. Each visit is planned around your questions, not a
          list of packages.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <h3 className="font-display text-base text-ink">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {service.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
