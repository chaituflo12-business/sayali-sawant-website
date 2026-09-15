"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Variant = "fade-up" | "fade" | "scale";
const BASE_DELAY = 140;
type Tag = "div" | "section" | "li" | "article" | "figure";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reveals its children once when they scroll into view.
 * Server components can render it; the observer only runs in the browser.
 * Under prefers-reduced-motion the content is shown immediately.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: Tag;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      setShown(true);
      return;
    }

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setShown(true);
      cleanup();
    };

    // IntersectionObserver misses elements that jump straight past the
    // viewport (anchor links, fast flicks), so a passive scroll check also
    // reveals anything whose upper edge has already crossed the viewport bottom.
    // Each element unsubscribes once shown, so the per-scroll cost stays tiny.
    const catchUp = () => {
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      if (viewport > 0 && el.getBoundingClientRect().y < viewport) show();
    };
    const onScroll = () => catchUp();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) show();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    function cleanup() {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }

    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    catchUp();

    return cleanup;
  }, []);

  const Component = as;
  // A short base delay lets the eye land on the section before it moves.
  const style: CSSProperties = { transitionDelay: `${BASE_DELAY + delay}ms` };

  return (
    <Component
      ref={ref as never}
      data-reveal={variant}
      data-shown={shown ? "true" : "false"}
      style={style}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers a list of children. Each child gets its own Reveal with an
 * increasing delay, capped so long grids never feel slow.
 */
export function RevealGroup({
  children,
  step = 90,
  maxDelay = 720,
  variant = "fade-up",
  className,
  as = "div",
  itemAs = "div",
}: {
  children: ReactNode;
  step?: number;
  maxDelay?: number;
  variant?: Variant;
  className?: string;
  as?: Tag | "ol" | "ul";
  itemAs?: Tag;
}) {
  const Wrapper = as;
  const items = Children.toArray(children);
  return (
    <Wrapper className={className}>
      {items.map((child, i) => (
        <Reveal
          key={i}
          as={itemAs}
          variant={variant}
          delay={Math.min(i * step, maxDelay)}
        >
          {child}
        </Reveal>
      ))}
    </Wrapper>
  );
}
