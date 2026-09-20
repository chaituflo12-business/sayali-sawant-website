import { MEDICAL_DISCLAIMER } from "@/lib/disclaimer";

export function EmergencyDisclaimer() {
  return (
    <aside className="border-y border-warning bg-warning-soft px-4 py-4">
      <p className="mx-auto max-w-6xl text-sm leading-relaxed text-warning">
        {MEDICAL_DISCLAIMER}
      </p>
    </aside>
  );
}
