import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The trailing arrow on a primary pill button, set in its own small circle.
 * The parent button needs the `group` class; on devices with a real pointer
 * the circle nudges forward on hover.
 */
export function ArrowChip({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "-mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105",
        className,
      )}
    >
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
