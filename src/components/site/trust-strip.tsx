import { LANGUAGES } from "@/config/site";
import { Reveal } from "@/components/site/reveal";

export function TrustStrip() {
  const tiles = [
    {
      label: "Qualifications",
      value: "MBBS (2017), DNB Obstetrics & Gynaecology (2020)",
    },
    {
      label: "Trained at",
      value: "KEM Hospital, Pune",
    },
    {
      label: "Languages spoken",
      value: LANGUAGES.join(", "),
    },
  ];

  // A plain row of facts split by hairlines, not a fourth grid of cards.
  return (
    <section aria-label="Credentials" className="border-y border-border bg-background">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-4 py-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-border lg:py-10">
        {tiles.map((tile, index) => (
          <Reveal
            key={tile.label}
            delay={index * 110}
            className="first:col-span-2 lg:px-6 lg:first:col-span-1 lg:first:pl-0 lg:last:pr-0"
          >
            <dt className="text-sm text-muted">{tile.label}</dt>
            <dd className="font-display mt-1 text-base leading-snug text-ink md:text-lg">
              {tile.value}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
