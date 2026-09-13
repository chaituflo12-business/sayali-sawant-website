import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { EmergencyDisclaimer } from "@/components/site/emergency-disclaimer";
import { StickyBookBar } from "@/components/site/sticky-book-bar";
import { BookingSheet } from "@/components/booking/booking-sheet";

export function SiteShell({
  children,
  showSticky = true,
}: {
  children: ReactNode;
  showSticky?: boolean;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <EmergencyDisclaimer />
      <Footer />
      {showSticky ? <StickyBookBar /> : null}
      <BookingSheet />
    </>
  );
}
