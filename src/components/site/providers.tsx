"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { BookingProvider } from "@/components/site/booking-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <BookingProvider>{children}</BookingProvider>
    </ToastProvider>
  );
}
