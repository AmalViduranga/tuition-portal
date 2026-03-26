import { createClass } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminClassesPage() {
  const { supabase } = await requireAdmin();
  const { data: classes } = await supabase
    .from("class_groups")
    .select("id, name, description, is_active")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Create Class Group</h2>
        <form action={createClass} className="mt-4 space-y-3">
          <input name="name" placeholder="2026 A/L Theory" required />
          <textarea name="description" placeholder="Optional description" rows={3} />
          <button type="submit">Create Class</button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Class Groups</h2>
        <div className="mt-4 space-y-2">
          {(classes ?? []).map((item) => (
            <article key={item.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
