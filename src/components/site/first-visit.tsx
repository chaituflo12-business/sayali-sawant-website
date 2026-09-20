import { Reveal } from "@/components/site/reveal";
import { FirstVisitTabs } from "@/components/site/first-visit-tabs";

export function FirstVisit() {
  return (
    <section
      id="first-visit"
      className="scroll-mt-24 py-16 md:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            What to bring to your first visit
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            The right papers let the first consultation focus on you. Bring
            whatever you have; nothing here is required to book.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <FirstVisitTabs />
        </Reveal>
      </div>
    </section>
  );
}
