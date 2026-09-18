import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { TrustStrip } from "@/components/site/trust-strip";
import { Services } from "@/components/site/services";
import { VisitSteps } from "@/components/site/visit-steps";
import { OpdHours } from "@/components/site/opd-hours";
import { Location } from "@/components/site/location";
import { About } from "@/components/site/about";
import { Faq } from "@/components/site/faq";
import { SiteShell } from "@/components/site/site-shell";
import { JsonLd } from "@/components/site/json-ld";
import { BookingCard } from "@/components/booking/booking-card";
import { getSlotSummary } from "@/lib/slots";
import { resolveOpdHours } from "@/lib/opd-hours";
import { homeJsonLd } from "@/lib/json-ld";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [summary, hours] = await Promise.all([
    getSlotSummary(),
    resolveOpdHours(),
  ]);

  return (
    <SiteShell>
      <JsonLd data={homeJsonLd(hours)} />
      <Hero summary={summary} />
      <TrustStrip />
      <Services />
      <VisitSteps />
      <OpdHours summary={summary} hours={hours} />
      <BookingCard />
      <Location />
      <About />
      <Faq />
    </SiteShell>
  );
}
