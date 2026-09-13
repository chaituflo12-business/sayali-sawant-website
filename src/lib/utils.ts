import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium min-h-11 min-w-11 px-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary:
          "bg-surface text-ink border border-border hover:bg-primary-soft",
        ghost: "text-ink hover:bg-primary-soft",
        whatsapp: "bg-[#0F766E] text-white hover:bg-[#0D9488]",
        danger: "bg-error text-white hover:bg-primary-hover",
      },
      size: {
        default: "px-4",
        lg: "px-6 text-base",
        icon: "px-0 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
