import { MEDICAL_DISCLAIMER } from "@/lib/disclaimer";

export function EmergencyDisclaimer() {
  return (
    <aside className="border-y border-warning/30 bg-[#FEF3C7] px-4 py-4">
      <p className="mx-auto max-w-6xl text-sm leading-relaxed text-ink">
        {MEDICAL_DISCLAIMER}
      </p>
    </aside>
  );
}
