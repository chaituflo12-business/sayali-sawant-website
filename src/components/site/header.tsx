"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { DOCTOR_NAME, SPECIALITY_LINE, telHref, whatsappHref } from "@/config/site";
import { buttonVariants } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

const NAV = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#opd-hours", label: "OPD Hours" },
  { href: "/#location", label: "Location" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function Header() {
  const { scrollOrOpen } = useBooking();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="min-h-11 min-w-0">
          <span className="font-display block text-base leading-tight text-ink md:text-lg">
            {DOCTOR_NAME}
          </span>
          <span className="block text-xs text-muted md:text-sm">
            {SPECIALITY_LINE}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm text-muted hover:bg-primary-soft hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref()}
            className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}
            aria-label="Call the clinic"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={whatsappHref("Hello, I would like to book an OPD slot with Dr. Sayali Sawant.")}
            className={cn(buttonVariants({ variant: "whatsapp", size: "icon" }))}
            aria-label="WhatsApp the clinic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={scrollOrOpen}
            className={cn(buttonVariants(), "hidden md:inline-flex")}
          >
            Book OPD slot
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className="border-t border-border bg-surface px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center text-sm text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
