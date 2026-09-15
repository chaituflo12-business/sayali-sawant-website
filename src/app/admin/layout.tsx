import Link from "next/link";
import { ToastProvider } from "@/components/ui/toast";
import { BrandMark } from "@/components/site/brand-mark";

const LINKS = [
  { href: "/admin", label: "Today" },
  { href: "/admin/week", label: "Week" },
  { href: "/admin/block", label: "Block time" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/reminders", label: "Reminders" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/export", label: "Export CSV" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3">
            <p className="flex items-center gap-2">
              <BrandMark size={28} />
              <span className="font-display text-base text-ink">OPD admin</span>
            </p>
            <nav className="flex gap-1 overflow-x-auto" aria-label="Admin">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm text-muted hover:bg-primary-soft hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      </div>
    </ToastProvider>
  );
}
