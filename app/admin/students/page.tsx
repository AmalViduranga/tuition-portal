import { createStudent } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminStudentsPage() {
  const { supabase } = await requireAdmin();
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Create Student Account</h2>
        <form action={createStudent} className="mt-4 space-y-3">
          <input name="full_name" placeholder="Student full name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Temporary password" required />
          <button type="submit">Create Account</button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Students</h2>
        <div className="mt-4 space-y-2">
          {(students ?? []).map((student) => (
            <article key={student.id} className="rounded-md border border-slate-200 p-3 text-sm">
              <p className="font-medium">{student.full_name ?? "Unnamed student"}</p>
              <p className="text-slate-500">{student.id}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
