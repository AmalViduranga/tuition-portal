import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth";
import { getSessionExpiration } from "@/lib/auth/session";
import { SessionGuard } from "@/components/auth/SessionGuard";

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const expiresAt = await getSessionExpiration();

  return (
    <>
      <SessionGuard expiresAt={expiresAt} />
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}
