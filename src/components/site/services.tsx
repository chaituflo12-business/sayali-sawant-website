import {
  Activity,
  Baby,
  CalendarHeart,
  ClipboardCheck,
  Dna,
  Flower2,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import { SERVICES, type ServiceIcon } from "@/config/services";

const ICONS: Record<ServiceIcon, typeof Baby> = {
  Baby,
  HeartPulse,
  CalendarHeart,
  Microscope,
  Dna,
  Activity,
  Stethoscope,
  ShieldCheck,
  Sun,
  Users,
  ClipboardCheck,
  Flower2,
};

// Four pastel tints from the palette, rotated so neighbours never match.
const TINTS = [
  { card: "bg-pastel_petal-800", disc: "bg-pastel_petal-500", ring: "border-pastel_petal-600" },
  { card: "bg-sky_blue-800", disc: "bg-sky_blue-500", ring: "border-sky_blue-600" },
  { card: "bg-thistle-800", disc: "bg-thistle-500", ring: "border-thistle-600" },
  { card: "bg-icy_blue-800", disc: "bg-icy_blue-500", ring: "border-icy_blue-600" },
] as const;
import { Reveal, RevealGroup } from "@/components/site/reveal";

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Gynaecology, pregnancy and fertility care in Goregaon West
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Outpatient consultations for women from Goregaon, Malad, Jogeshwari
            and Andheri West. Each visit is planned around your questions, not a
            list of packages.
          </p>
        </Reveal>
        <RevealGroup
          step={70}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service, index) => {
            const Icon = ICONS[service.icon];
            const tint = TINTS[index % TINTS.length];
            return (
              <article
                key={service.title}
                className={`service-card group flex h-full flex-col gap-4 rounded-2xl border p-5 ${tint.card} ${tint.ring}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${tint.disc} text-ink`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-base text-ink">{service.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted">
                    {service.body}
                  </p>
                </div>
              </article>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
