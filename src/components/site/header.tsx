"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone } from "lucide-react";
import { INSTAGRAM_URL, telHref, whatsappHref } from "@/config/site";
import { buttonVariants } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useBooking } from "@/components/site/booking-provider";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { InstagramIcon } from "@/components/site/instagram-icon";
import { BrandLockup } from "@/components/site/brand-mark";

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
        <Link href="/" className="min-h-11 min-w-0" aria-label="Home">
          <BrandLockup size={40} animate />
        </Link>

        <nav className="hidden items-center lg:flex xl:gap-1" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-2 text-sm text-muted hover:bg-primary-soft hover:text-ink xl:px-3"
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
          <a
            href={INSTAGRAM_URL}
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "hidden sm:inline-flex",
            )}
            aria-label="Dr. Sayali Sawant on Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={scrollOrOpen}
            className={cn(buttonVariants(), "hidden whitespace-nowrap md:inline-flex")}
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
            {/* Three lines that fold into an X rather than swapping icons. */}
            <span
              className="flex h-3.5 w-5 flex-col justify-between"
              aria-hidden
            >
              <span
                className={cn(
                  "h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  menuOpen && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-5 rounded-full bg-ink transition-opacity duration-200",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  menuOpen && "-translate-y-[6px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className="menu-drop border-t border-border bg-surface px-4 py-3 lg:hidden"
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
            <li className="sm:hidden">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 text-sm text-ink"
                onClick={() => setMenuOpen(false)}
              >
                <InstagramIcon className="h-4 w-4 text-primary" />
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
