import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { BlockForm } from "@/components/admin/block-form";

export const dynamic = "force-dynamic";

export default async function BlockPage() {
  const gate = await requireStaff();
  if (!gate.supabase || !gate.staff) redirect("/admin/login");
  return <BlockForm />;
}
