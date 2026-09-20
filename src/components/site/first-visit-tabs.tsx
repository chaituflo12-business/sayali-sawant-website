"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Baby, CircleCheck, Dna, Flower2 } from "lucide-react";
import {
  FIRST_VISIT_CHECKLISTS,
  type ChecklistIcon,
} from "@/config/first-visit";
import { cn } from "@/lib/utils";

const ICONS: Record<ChecklistIcon, typeof Baby> = { Baby, Dna, Flower2 };

const TONES = [
  { panel: "bg-pastel_petal-900", disc: "bg-pastel_petal-600" },
  { panel: "bg-sky_blue-900", disc: "bg-sky_blue-600" },
  { panel: "bg-thistle-900", disc: "bg-thistle-600" },
] as const;

/**
 * One checklist at a time, chosen by tab. Three identical cards side by side
 * made the section read like every other grid on the page.
 */
export function FirstVisitTabs() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = FIRST_VISIT_CHECKLISTS[active];
  const tone = TONES[active % TONES.length];
  const Icon = ICONS[list.icon];

  // Arrow keys move between tabs, as screen-reader users expect.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const count = FIRST_VISIT_CHECKLISTS.length;
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % count;
    else if (event.key === "ArrowLeft") next = (active - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Checklist for"
        onKeyDown={onKeyDown}
        className="card-soft inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1"
      >
        {FIRST_VISIT_CHECKLISTS.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-200",
                selected
                  ? "bg-primary text-white"
                  : "text-ink hover:bg-primary-soft",
              )}
            >
              {item.tabLabel ?? item.title}
            </button>
          );
        })}
      </div>

      <div
        key={list.id}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${list.id}`}
        className={cn(
          "card-soft step-in-forward mt-5 grid gap-6 rounded-2xl p-5 md:grid-cols-[14rem_1fr] md:p-7",
          tone.panel,
        )}
      >
        <div className="flex items-center gap-3 md:flex-col md:items-start">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink",
              tone.disc,
            )}
            aria-hidden
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-xl text-ink">{list.title}</h3>
            <p className="mt-1 text-sm text-muted">{list.forWhom}</p>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl bg-surface/70 px-4 py-3 text-base text-ink"
            >
              <CircleCheck
                className="mt-1 h-4 w-4 shrink-0 text-accent"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
