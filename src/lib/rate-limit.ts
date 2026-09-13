import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { createSupabaseServer } from "@/lib/supabase/server";

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
  const ip = await clientIp();
  const ipHash = hashIp(ip);
  const service = createServiceClient();
  const client = service ?? (await createSupabaseServer());
  if (!client) return { allowed: true };

  const { data, error } = await client.rpc("assert_booking_rate_limit", {
    p_ip_hash: ipHash,
    p_max: MAX_ATTEMPTS,
    p_minutes: WINDOW_MINUTES,
  });

  if (error) {
    return { allowed: true };
  }

  return { allowed: data !== false };
}
