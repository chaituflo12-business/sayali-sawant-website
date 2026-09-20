import type Lenis from "lenis";

export type MotionHandle = {
  lenis: Lenis;
  destroy: () => void;
};

/**
 * Site-wide motion: smooth wheel scrolling, masked section headings and
 * scroll-linked parallax on decorative layers.
 *
 * Loaded lazily after first paint, so none of this can delay the hero or the
 * booking button. Everything here is decoration: if it never loads, or the
 * visitor asks for reduced motion, the page is complete without it.
 */
export async function startMotion(): Promise<MotionHandle | null> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: LenisCtor }] =
    await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/SplitText"),
      import("lenis"),
    ]);

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Wheel scrolling only. Touch keeps the phone's native momentum, which is
  // what patients on a phone expect and cannot be improved on.
  const lenis = new LenisCtor({
    lerp: 0.1,
    // Sections already reserve scroll-mt-24 for the sticky header.
    anchors: { offset: -96 },
  });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const splits: { revert: () => void }[] = [];

  const ctx = gsap.context(() => {
    // Section headings rise line by line from behind a mask. Only the display
    // headings: the small uppercase labels in the credentials strip are H2s
    // too, and a mask reveal on a one-word label reads as a glitch.
    // autoSplit re-measures when the webfont lands or the width changes, so
    // lines are never split against the fallback font.
    document
      .querySelectorAll<HTMLElement>("main h2.font-display")
      .forEach((heading) => {
        splits.push(
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 105,
                duration: 0.95,
                stagger: 0.09,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 88%",
                  once: true,
                },
              });
            },
          }),
        );
      });

    // Decorative layers drift against the scroll. Text and controls are
    // never given data-parallax.
    document
      .querySelectorAll<HTMLElement>("[data-parallax]")
      .forEach((layer) => {
        const distance = Number(layer.dataset.parallax) || 0;
        gsap.to(layer, {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: layer.closest("section") ?? layer,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
  });

  return {
    lenis,
    destroy() {
      ctx.revert();
      splits.forEach((split) => split.revert());
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
