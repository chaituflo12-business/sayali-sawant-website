"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";

export function Calendar({ className, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("card-soft rounded-2xl bg-surface p-3", className)}
      {...props}
    />
  );
}
