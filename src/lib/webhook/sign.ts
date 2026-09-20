import { createHmac, timingSafeEqual } from "node:crypto";

export function signBody(body: string, secret: string): string {
  const hex = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${hex}`;
}

export function verifySignature(
  body: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header) return false;
  const expected = signBody(body, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
