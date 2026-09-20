"use client";

import { buttonVariants, cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";
import { ArrowChip } from "@/components/site/arrow-chip";

/**
 * A booking call to action for the middle of the page. On desktop it scrolls
 * to the booking card; on a phone it opens the booking sheet directly.
 */
export function BookCta({
  label,
  className,
  variant = "primary",
}: {
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const { scrollOrOpen } = useBooking();
  return (
    <button
      type="button"
      onClick={scrollOrOpen}
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        "group gap-3 pr-5",
        className,
      )}
    >
      {label}
      <ArrowChip className={variant === "secondary" ? "bg-primary-soft" : undefined} />
    </button>
  );
}
