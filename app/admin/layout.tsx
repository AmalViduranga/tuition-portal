import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminLayout>{children}</AdminLayout>;
}
