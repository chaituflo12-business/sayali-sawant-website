"use client";

import { useEffect, useState } from "react";
import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";

export function StickyBookBar() {
  const { openBooking } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Two identical buttons on one screen reads as a mistake, so the bar only
    // appears once the hero's own button has scrolled out of view. Watching the
    // button itself keeps this correct whatever the hero's height turns out to
    // be on a given phone.
    const hero = document.getElementById("hero-cta");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    // Fail open. If the observer never reports — a browser quirk, a
    // backgrounded tab, a hero that never rendered — show the bar rather than
    // leave a phone with no way to book.
    let reported = false;
    const fallback = window.setTimeout(() => {
      if (!reported) setVisible(true);
    }, 1000);

    const io = new IntersectionObserver(
      ([entry]) => {
        reported = true;
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(hero);

    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-3 backdrop-blur transition-all duration-300 md:hidden",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={openBooking}
        tabIndex={visible ? 0 : -1}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Book OPD slot
      </button>
    </div>
  );
}
