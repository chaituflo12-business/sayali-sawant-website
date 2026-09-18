import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookUrl = Deno.env.get("AUTOMATION_WEBHOOK_URL") ?? "";
  const secret = Deno.env.get("WEBHOOK_SECRET") ?? "";

  if (!webhookUrl || !secret) {
    return new Response(
      JSON.stringify({ ok: false, message: "Missing AUTOMATION_WEBHOOK_URL or WEBHOOK_SECRET" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: rows, error } = await supabase.rpc("claim_webhook_outbox", {
    batch_size: 20,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const claimed = rows ?? [];
  let delivered = 0;

  for (const row of claimed) {
    const body = JSON.stringify(row.payload);
    const signature = `sha256=${await hmacSha256Hex(secret, body)}`;
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${await response.text()}`);
      }
      await supabase
        .from("webhook_outbox")
        .update({ delivered_at: new Date().toISOString(), last_error: null })
        .eq("id", row.id);
      delivered += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "deliver failed";
      await supabase
        .from("webhook_outbox")
        .update({ last_error: message.slice(0, 500) })
        .eq("id", row.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, claimed: claimed.length, delivered }), {
    headers: { "Content-Type": "application/json" },
  });
});
