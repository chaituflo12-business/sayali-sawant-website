import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { EmergencyDisclaimer } from "@/components/site/emergency-disclaimer";
import { StickyBookBar } from "@/components/site/sticky-book-bar";
import { BookingSheet } from "@/components/booking/booking-sheet";
import { MotionLayer } from "@/components/site/motion-layer";

export function SiteShell({
  children,
  showSticky = true,
}: {
  children: ReactNode;
  showSticky?: boolean;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:shadow-sm"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <EmergencyDisclaimer />
      <Footer />
      {showSticky ? <StickyBookBar /> : null}
      <BookingSheet />
      <MotionLayer />
    </>
  );
}
