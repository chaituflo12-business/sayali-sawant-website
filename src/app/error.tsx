"use client";

import Link from "next/link";
import { buttonVariants, cn } from "@/lib/utils";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl text-ink">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">
        Please try again, or return home to book an OPD appointment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className={cn(buttonVariants())}>
          Try again
        </button>
        <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
          Home
        </Link>
      </div>
    </div>
  );
}
