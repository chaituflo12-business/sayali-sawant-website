"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { buttonVariants, cn } from "@/lib/utils";
import { BrandMark } from "@/components/site/brand-mark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setMessage("Supabase is not configured in this environment.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    if (error) {
      setMessage(
        "Could not send the sign-in email. Check that this address is on the staff list.",
      );
      return;
    }
    setSent(true);
    setMessage(null);
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      setMessage("That code is not valid. Try again or request a new email.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <BrandMark size={56} animate className="mb-4" />
      <h1 className="font-display text-2xl text-ink">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Enter the allow-listed email. You will receive a one-time code.
      </p>
      {!sent ? (
        <form onSubmit={sendCode} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-ink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3"
            />
          </label>
          {message ? <p className="text-sm text-error">{message}</p> : null}
          <button type="submit" className={cn(buttonVariants(), "w-full")}>
            Send sign-in email
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-ink">One-time code</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={8}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3"
            />
          </label>
          {message ? <p className="text-sm text-error">{message}</p> : null}
          <button type="submit" className={cn(buttonVariants(), "w-full")}>
            Sign in
          </button>
        </form>
      )}
    </div>
  );
}
