import Link from "next/link";
import {
  CLINIC_ADDRESS,
  DOCTOR_NAME,
  MMC_REG_NO,
} from "@/config/site";
import { formatSession } from "@/lib/hours";
import { resolveOpdHours } from "@/lib/opd-hours";
import { BrandMark } from "@/components/site/brand-mark";

export async function Footer() {
  const hours = await resolveOpdHours();
  const open = hours.filter((d) => !d.closed);
  const closed = hours.filter((d) => d.closed);
  const dayRange =
    open.length === 0
      ? ""
      : open.length === 1
        ? open[0].label
        : `${open[0].label.slice(0, 3)}–${open[open.length - 1].label.slice(0, 3)}`;
  const timeLine = open[0]
    ? open[0].sessions.map(formatSession).join(", ")
    : "";
  const closedLine =
    closed.length === 0
      ? ""
      : ` ${closed.map((d) => d.label).join(", ")} closed.`;

  return (
    <footer className="border-t border-border bg-surface pb-24 md:pb-8">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <BrandMark size={44} className="mb-3" />
          <p className="font-display text-lg text-ink">{DOCTOR_NAME}</p>
          <p className="mt-1 text-sm text-muted">
            Maharashtra Medical Council Reg. No. {MMC_REG_NO}
          </p>
          <p className="mt-3 text-sm text-muted">{CLINIC_ADDRESS}</p>
          <p className="mt-2 text-sm text-muted">
            {dayRange} hours (IST): {timeLine}.{closedLine}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Locality pages</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/gynaecologist-goregaon-west"
                className="inline-flex min-h-11 items-center text-muted hover:text-primary"
              >
                Gynaecologist in Goregaon West
              </Link>
            </li>
            <li>
              <Link
                href="/ivf-specialist-goregaon-west"
                className="inline-flex min-h-11 items-center text-muted hover:text-primary"
              >
                IVF specialist in Goregaon West
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center text-muted hover:text-primary"
              >
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted">
          <p>Website for information and appointment booking only.</p>
          <p className="mt-3">
            Details you submit are used only for scheduling, in line with the
            Digital Personal Data Protection Act, 2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
