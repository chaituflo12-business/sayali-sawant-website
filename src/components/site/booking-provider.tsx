"use client";

import * as React from "react";

type BookingContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openBooking: () => void;
  scrollOrOpen: () => void;
};

const BookingContext = React.createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const openBooking = React.useCallback(() => setOpen(true), []);

  const scrollOrOpen = React.useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setOpen(true);
    }
  }, []);

  const value = React.useMemo(
    () => ({ open, setOpen, openBooking, scrollOrOpen }),
    [open, openBooking, scrollOrOpen],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return ctx;
}
