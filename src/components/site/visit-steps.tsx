import { CalendarCheck, MessageCircle, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Book online in 30 seconds",
    body: "Pick a day and a 15-minute OPD slot, then share your name and WhatsApp number.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp confirmation with directions",
    body: "You receive a message with your reference, time, and a maps link to the clinic.",
  },
  {
    icon: Stethoscope,
    title: "Consultation",
    body: "Please bring previous reports, prescriptions and a photo ID. Arrive a few minutes early.",
  },
] as const;

export function VisitSteps() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          How a visit works
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 120}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <step.icon className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">
                Step {index + 1}
              </p>
              <h3 className="font-display mt-1 text-base text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
