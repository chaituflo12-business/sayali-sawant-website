import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { buttonVariants, cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <SiteShell showSticky={false}>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-muted">
          The page you asked for is not on this website.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-6")}>
          Back to home
        </Link>
      </div>
    </SiteShell>
  );
}
