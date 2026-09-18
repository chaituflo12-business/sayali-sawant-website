import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { buttonVariants, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows } = await gate.supabase
    .from("message_log")
    .select("id, whatsapp_e164, template, status, make_execution_id, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const items = rows ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Delivery log written by Make, last 30 days. Read-only.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No messages logged.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-ink">
                {row.template} · {row.status}
              </p>
              <p className="mt-1 text-xs text-muted">
                {row.whatsapp_e164} ·{" "}
                {new Date(row.created_at).toLocaleString("en-GB", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
                {row.make_execution_id ? ` · ${row.make_execution_id}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2">
        {page > 1 ? (
          <Link
            href={`/admin/messages?page=${page - 1}`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Previous
          </Link>
        ) : null}
        {items.length === PAGE_SIZE ? (
          <Link
            href={`/admin/messages?page=${page + 1}`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
