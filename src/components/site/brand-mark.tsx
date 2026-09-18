import {
  DOCTOR_NAME,
  SPECIALITY_LINE,
  SPECIALITY_SHORT,
} from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The SS monogram: a dark disc with a petal-pink accent and the initials.
 * Pure SVG so it stays crisp at 16px and can be animated with CSS classes.
 */
export function BrandMark({
  size = 40,
  animate = false,
  className,
  title = DOCTOR_NAME,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
  title?: string;
}) {
  const id = "bm-clip";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn(animate && "mark-anim", className)}
    >
      <defs>
        <clipPath id={id}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="32" fill="#2b1a36" className="mark-disc" />
      <g clipPath={`url(#${id})`}>
        <circle
          cx="52"
          cy="12"
          r="19"
          fill="#ffafcc"
          opacity="0.92"
          className="mark-dot"
        />
      </g>
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontSize="30"
        fontWeight="700"
        letterSpacing="-2"
        fill="#ffffff"
        fontFamily="var(--font-heading)"
        className="mark-text"
      >
        SS
      </text>
    </svg>
  );
}

/** Mark + name + speciality line, used in the header and footer. */
export function BrandLockup({
  size = 40,
  animate = false,
  showLine = true,
  className,
}: {
  size?: number;
  animate?: boolean;
  showLine?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark size={size} animate={animate} className="shrink-0" />
      <span className="min-w-0">
        <span className="font-display block text-base leading-tight text-ink md:text-lg">
          {DOCTOR_NAME}
        </span>
        {showLine ? (
          <span className="block text-xs leading-snug text-muted md:text-sm">
            <span className="sm:hidden">{SPECIALITY_SHORT}</span>
            <span className="hidden sm:inline">{SPECIALITY_LINE}</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
