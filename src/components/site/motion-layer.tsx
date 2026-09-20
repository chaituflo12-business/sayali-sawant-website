"use client";

import { useEffect, useRef } from "react";
import { useBooking } from "@/components/site/booking-provider";
import { startMotion, type MotionHandle } from "@/lib/motion";

export function MotionLayer() {
  const { open } = useBooking();
  const handle = useRef<MotionHandle | null>(null);

  useEffect(() => {
    let cancelled = false;
    startMotion()
      .then((motion) => {
        if (cancelled) {
          motion?.destroy();
          return;
        }
        handle.current = motion;
      })
      .catch(() => {
        // Decoration only. A failed chunk load must never break the page.
      });
    return () => {
      cancelled = true;
      handle.current?.destroy();
      handle.current = null;
    };
  }, []);

  // The booking sheet scrolls itself; the page behind it must stay put.
  useEffect(() => {
    const lenis = handle.current?.lenis;
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open]);

  return null;
}
