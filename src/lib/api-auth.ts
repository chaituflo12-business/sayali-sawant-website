import "server-only";
import { timingSafeEqual } from "node:crypto";

export type ApiAuth =
  | { ok: true }
  | { ok: false; status: 401 | 503; code: string; message: string };

export function authorizeMakeRequest(request: Request): ApiAuth {
  const expected = process.env.MAKE_READ_TOKEN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      code: "NOT_CONFIGURED",
      message: "MAKE_READ_TOKEN is not set.",
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : "";

  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "Invalid bearer token.",
    };
  }

  return { ok: true };
}
