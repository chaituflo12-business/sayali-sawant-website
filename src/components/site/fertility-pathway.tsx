import { CircleCheck, Clock, Search } from "lucide-react";
import { FERTILITY_STAGES, WHEN_TO_SEEK_HELP } from "@/config/fertility";
import { Reveal } from "@/components/site/reveal";
import { BookCta } from "@/components/booking/book-cta";
import { MobileCollapse } from "@/components/site/mobile-collapse";

export function FertilityPathway() {
  return (
    <section id="fertility-pathway" className="scroll-mt-24 py-16 md:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            The fertility pathway, one step at a time
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Treatment starts with a clear evaluation and moves forward only when
            it needs to. Many couples never reach the later steps.
          </p>
        </Reveal>

        <ol className="relative mt-12 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {/* The thread joining the four steps, drawn behind their numbers. */}
          <span
            className="absolute left-[12.5%] right-[12.5%] top-0 hidden h-px bg-thistle-600 lg:block"
            aria-hidden
          />
          {FERTILITY_STAGES.map((stage, index) => (
            <Reveal
              key={stage.step}
              as="li"
              delay={index * 130}
              className="card-soft relative flex flex-col rounded-2xl bg-surface p-5"
            >
              <span className="font-display relative mx-auto -mt-11 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-lg text-white">
                {stage.step}
              </span>
              <h3 className="font-display mt-4 text-lg text-ink">
                {stage.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {stage.summary}
              </p>
              <MobileCollapse showLabel="What this involves">
                <ul className="mt-4 space-y-2">
                  {stage.involves.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-ink">
                      <CircleCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </MobileCollapse>
              <p className="mt-auto flex items-center gap-2 pt-5 text-sm text-muted">
                <Clock className="h-4 w-4 text-primary" aria-hidden />
                {stage.duration}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal
          delay={120}
          className="card-soft mt-8 grid gap-6 rounded-2xl bg-sky_blue-900 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
        >
          <div className="flex gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky_blue-700 text-ink"
              aria-hidden
            >
              <Search className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg text-ink">
                {WHEN_TO_SEEK_HELP.title}
              </p>
              <ul className="mt-2 space-y-1.5 text-base text-ink">
                {WHEN_TO_SEEK_HELP.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <BookCta
            label="Book OPD slot"
            className="w-full md:w-auto"
          />
        </Reveal>
      </div>
    </section>
  );
}
