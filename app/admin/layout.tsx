import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <header className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/students" className="text-blue-600">
            Students
          </Link>
          <Link href="/admin/classes" className="text-blue-600">
            Classes
          </Link>
          <Link href="/admin/recordings" className="text-blue-600">
            Recordings
          </Link>
          <Link href="/admin/materials" className="text-blue-600">
            Materials
          </Link>
          <Link href="/admin/enrollments" className="text-blue-600">
            Access & Payments
          </Link>
          <Link href="/admin/site-content" className="text-blue-600">
            Public Content
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
