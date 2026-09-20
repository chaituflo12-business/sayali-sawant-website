import { Minus, Plus } from "lucide-react";
import { FAQ_ITEMS } from "@/config/faq";
import { Reveal } from "@/components/site/reveal";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-background py-14 md:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Questions patients ask before booking
          </h2>
        </Reveal>
        <Reveal delay={140} className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="faq-item card-soft group rounded-2xl bg-surface px-4 py-2"
            >
              <summary className="cursor-pointer list-none py-3 font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex min-h-11 items-center justify-between gap-3">
                  {item.question}
                  <Plus
                    className="h-5 w-5 shrink-0 text-primary group-open:hidden"
                    aria-hidden
                  />
                  <Minus
                    className="hidden h-5 w-5 shrink-0 text-primary group-open:block"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="pb-4 text-base leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
