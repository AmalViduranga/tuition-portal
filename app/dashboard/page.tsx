import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase
      .from("student_class_enrollments")
      .select("class_id, start_access_date, class_groups(id, name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Student Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome, {profile?.full_name ?? "Student"}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.role === "admin" ? (
              <Link href="/admin" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                Open Admin
              </Link>
            ) : null}
            <Link href="/portal" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              Legacy Portal
            </Link>
            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Your Classes</h2>
        <div className="mt-4 grid gap-3">
          {(enrollments ?? []).map((enrollment) => {
            const group = Array.isArray(enrollment.class_groups)
              ? enrollment.class_groups[0]
              : enrollment.class_groups;
            return (
              <article
                key={`${enrollment.class_id}-${enrollment.start_access_date}`}
                className="rounded-md border border-slate-200 p-3"
              >
                <p className="font-medium">{group?.name ?? "Class"}</p>
                <p className="text-sm text-slate-600">Start access: {enrollment.start_access_date ?? "Not set"}</p>
                <Link href={`/portal/class/${enrollment.class_id}`} className="mt-2 inline-block text-blue-600">
                  Open class materials
                </Link>
              </article>
            );
          })}
          {enrollments?.length === 0 ? <p className="text-sm text-slate-600">No class enrollments yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
