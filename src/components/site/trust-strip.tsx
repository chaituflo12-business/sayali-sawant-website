import {
  LANGUAGES,
  MMC_REG_NO,
  PRACTICE_START_YEAR,
  yearsInPractice,
} from "@/config/site";

export function TrustStrip() {
  const years = yearsInPractice();
  const tiles = [
    {
      label: "Qualifications",
      value: "MBBS (2017), DNB Obstetrics & Gynaecology (2020)",
    },
    {
      label: "Registration",
      value: `Maharashtra Medical Council ${MMC_REG_NO}`,
    },
    {
      label: "Languages spoken",
      value: LANGUAGES.join(", "),
    },
    {
      label: "Years in practice",
      value: `Since ${PRACTICE_START_YEAR} (${years} ${years === 1 ? "year" : "years"})`,
    },
  ];

  return (
    <section aria-label="Credentials" className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <article
            key={tile.label}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <h2 className="text-xs font-medium uppercase tracking-wide text-primary">
              {tile.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">{tile.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
