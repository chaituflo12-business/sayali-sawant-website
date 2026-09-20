import {
  Activity,
  ArrowRight,
  Baby,
  CalendarHeart,
  ClipboardCheck,
  Dna,
  Flower2,
  HeartPulse,
  Microscope,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
} from "lucide-react";
import {
  SERVICES,
  type ServiceGroup,
  type ServiceIcon,
} from "@/config/services";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const ICONS: Record<ServiceIcon, typeof Baby> = {
  Baby,
  HeartPulse,
  CalendarHeart,
  Microscope,
  Dna,
  Activity,
  Stethoscope,
  ShieldCheck,
  Sun,
  Users,
  ClipboardCheck,
  Flower2,
};

// Four pastel tints from the palette, rotated so neighbours never match.
const TINTS = [
  {
    card: "bg-pastel_petal-800",
    disc: "bg-pastel_petal-500",
  },
  {
    card: "bg-sky_blue-800",
    disc: "bg-sky_blue-500",
  },
  {
    card: "bg-thistle-800",
    disc: "bg-thistle-500",
  },
  {
    card: "bg-icy_blue-800",
    disc: "bg-icy_blue-500",
  },
] as const;

type Feature = {
  group: Exclude<ServiceGroup, "gynae">;
  eyebrow: string;
  title: string;
  lead: string;
  href: string;
  linkLabel: string;
  icon: typeof Baby;
  card: string;
  disc: string;
  watermark: string;
  place: string;
};

// The two areas most patients come for get feature cards; everything else
// sits around them as smaller tiles. Grid placement: pregnancy fills the
// upper left, fertility the lower right, and dense flow packs the tiles.
const FEATURES: Feature[] = [
  {
    group: "pregnancy",
    eyebrow: "Pregnancy care",
    title: "From the first scan to planning the birth",
    lead: "Regular antenatal visits, closer watch when a pregnancy needs it, and a clear plan for the delivery.",
    href: "#pregnancy-journey",
    linkLabel: "See the pregnancy timeline",
    icon: Baby,
    card: "bg-pastel_petal-900",
    disc: "bg-pastel_petal-600",
    watermark: "text-pastel_petal-600",
    place: "md:col-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    group: "fertility",
    eyebrow: "Fertility care",
    title: "Evaluation first, then the right next step",
    lead: "A structured work-up for both partners, followed by treatment planned one step at a time.",
    href: "#fertility-pathway",
    linkLabel: "See the fertility pathway",
    icon: Dna,
    card: "bg-sky_blue-900",
    disc: "bg-sky_blue-600",
    watermark: "text-sky_blue-600",
    place: "md:col-span-2 lg:col-span-2 lg:col-start-2 lg:row-span-2",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const items = SERVICES.filter((s) => s.group === feature.group);
  return (
    <div className="bezel h-full">
    <article
      className={cn(
        "bezel-core relative flex h-full flex-col overflow-hidden p-6 md:p-7",
        feature.card,
      )}
    >
      <Icon
        className={cn(
          "pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 opacity-40",
          feature.watermark,
        )}
        strokeWidth={1}
        aria-hidden
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-ink",
            feature.disc,
          )}
          aria-hidden
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          {feature.eyebrow}
        </p>
      </div>
      <h3 className="font-display relative mt-5 text-2xl leading-snug text-ink">
        {feature.title}
      </h3>
      <p className="relative mt-2 max-w-md text-base leading-relaxed text-muted">
        {feature.lead}
      </p>
      <ul className="relative mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((service) => (
          <li
            key={service.title}
            className="rounded-2xl bg-surface/80 px-4 py-3 md:p-4"
          >
            <p className="font-medium text-ink">{service.title}</p>
            <p className="mt-1 hidden text-sm leading-relaxed text-muted md:block">
              {service.body}
            </p>
          </li>
        ))}
      </ul>
      <a
        href={feature.href}
        className="relative mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-medium text-primary hover:underline"
      >
        {feature.linkLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </article>
    </div>
  );
}

function Tile({
  index,
  service,
}: {
  index: number;
  service: (typeof SERVICES)[number];
}) {
  const Icon = ICONS[service.icon];
  const tint = TINTS[index % TINTS.length];
  return (
    <article
      className={cn(
        "service-card flex h-full flex-col gap-4 rounded-2xl p-5",
        tint.card,
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full text-ink",
          tint.disc,
        )}
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="font-display text-base text-ink">{service.title}</h3>
        <p className="mt-2 text-base leading-relaxed text-muted">
          {service.body}
        </p>
      </div>
    </article>
  );
}

export function Services() {
  const tiles = SERVICES.filter((s) => s.group === "gynae");
  // DOM order that, with dense flow, lands pregnancy upper left, three tiles
  // beside and below it, fertility lower right, and the rest after.
  const cells: { key: string; node: React.ReactNode; place: string }[] = [
    {
      key: "pregnancy",
      node: <FeatureCard feature={FEATURES[0]} />,
      place: FEATURES[0].place,
    },
    ...tiles.slice(0, 3).map((service, i) => ({
      key: service.title,
      node: <Tile index={i} service={service} />,
      place: "",
    })),
    {
      key: "fertility",
      node: <FeatureCard feature={FEATURES[1]} />,
      place: FEATURES[1].place,
    },
    ...tiles.slice(3).map((service, i) => ({
      key: service.title,
      node: <Tile index={i + 3} service={service} />,
      place: "",
    })),
  ];

  return (
    <section id="services" className="scroll-mt-24 py-14 md:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Gynaecology, pregnancy and fertility care in Goregaon West
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Outpatient consultations for women from Goregaon, Malad, Jogeshwari
            and Andheri West. Each visit is planned around your questions, not a
            list of packages.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-flow-dense md:grid-cols-2 lg:grid-cols-3">
          {cells.map((cell, index) => (
            <Reveal
              key={cell.key}
              delay={Math.min(index * 70, 560)}
              className={cell.place}
            >
              {cell.node}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
