import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

const WINDOW_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function hashIp(ip: string): string {
  const salt = process.env.WEBHOOK_SECRET ?? "local-dev-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

export async function assertBookingRateLimit(): Promise<{
  allowed: boolean;
}> {
  const service = createServiceClient();

  // assert_booking_rate_limit is service_role only. Without that key there is
  // no counter to consult, so production refuses rather than waving bookings
  // through; local development stays usable.
  if (!service) {
    return { allowed: process.env.NODE_ENV !== "production" };
  }

  const ip = await clientIp();
  const { data, error } = await service.rpc("assert_booking_rate_limit", {
    p_ip_hash: hashIp(ip),
    p_max: MAX_ATTEMPTS,
    p_minutes: WINDOW_MINUTES,
  });

  if (error) {
    return { allowed: process.env.NODE_ENV !== "production" };
  }

  return { allowed: data !== false };
}
