import { addMaterial } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminMaterialsPage() {
  const { supabase } = await requireAdmin();
  const { data: classes } = await supabase.from("class_groups").select("id, name").eq("is_active", true);
  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, file_url, release_at, class_groups(name)")
    .order("release_at", { ascending: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Add Material PDF</h2>
        <form action={addMaterial} className="mt-4 space-y-3">
          <select name="class_id" required>
            <option value="">Select class</option>
            {(classes ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Tute / Paper title" required />
          <input name="file_url" placeholder="Supabase Storage public URL" required />
          <input name="release_at" type="date" required />
          <button type="submit">Save Material</button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Materials</h2>
        <div className="mt-4 space-y-2">
          {(materials ?? []).map((material) => {
            const group = Array.isArray(material.class_groups) ? material.class_groups[0] : material.class_groups;
            return (
              <article key={material.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-medium">{material.title}</p>
                <p className="text-slate-600">{group?.name}</p>
                <p className="text-slate-500">{material.release_at}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
