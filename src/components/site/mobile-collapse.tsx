"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Collapsible on phones, always open from the lg breakpoint up.
 *
 * Long detail lists are what make a phone page feel endless, while on a wide
 * screen they sit side by side and cost nothing. The server renders the
 * collapsed state directly, so nothing jumps when the page hydrates.
 *
 * Opening animates the grid row from 0fr to 1fr so the text below slides
 * down instead of jumping. Visibility flips at the end of a close, which
 * keeps collapsed content out of the accessibility tree on phones.
 */
export function MobileCollapse({
  children,
  defaultOpen = false,
  showLabel,
  hideLabel = "Hide details",
  className,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  showLabel: string;
  hideLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={className}>
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows,opacity,visibility] duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] lg:visible lg:grid-rows-[1fr] lg:opacity-100",
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary lg:hidden"
      >
        {open ? hideLabel : showLabel}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
