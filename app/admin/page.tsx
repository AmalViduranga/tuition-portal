import Link from "next/link";

export default function AdminHomePage() {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Manage Tuition Portal</h2>
      <p className="mt-2 text-sm text-slate-600">
        Use the sections above to create student accounts, control access, and manage class content.
      </p>
      <Link href="/admin/students" className="mt-4 inline-block text-blue-600">
        Go to student management
      </Link>
    </section>
  );
}
