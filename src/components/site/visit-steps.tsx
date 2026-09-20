import { CalendarCheck, MessageCircle, Stethoscope } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/site/reveal";
import { WHATSAPP_AUTOMATION_LIVE } from "@/config/site";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Book online",
    body: "Pick a day and a 15-minute OPD slot, then share your name and WhatsApp number.",
  },
  {
    icon: MessageCircle,
    title: WHATSAPP_AUTOMATION_LIVE
      ? "WhatsApp confirmation with directions"
      : "Confirmation on WhatsApp",
    body: WHATSAPP_AUTOMATION_LIVE
      ? "You receive a message with your reference, time, and a maps link to the clinic."
      : "The clinic confirms your time on WhatsApp and shares a maps link to the clinic.",
  },
  {
    icon: Stethoscope,
    title: "Consultation",
    body: "Please bring previous reports, prescriptions and a photo ID. Arrive a few minutes early.",
  },
] as const;

export function VisitSteps() {
  return (
    <section className="py-14 md:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            How a visit works
          </h2>
        </Reveal>
        <RevealGroup
          as="ol"
          itemAs="li"
          step={180}
          className="mt-8 grid gap-4 md:grid-cols-3"
        >
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="card-soft h-full rounded-2xl bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm text-primary">
                  {index + 1}
                </span>
                <step.icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h3 className="font-display mt-4 text-base text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
