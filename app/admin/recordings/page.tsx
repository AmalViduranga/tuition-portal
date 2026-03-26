import { addRecording } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminRecordingsPage() {
  const { supabase } = await requireAdmin();
  const { data: classes } = await supabase.from("class_groups").select("id, name").eq("is_active", true);
  const { data: recordings } = await supabase
    .from("recordings")
    .select("id, title, youtube_video_id, release_at, class_groups(name)")
    .order("release_at", { ascending: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Add Recording</h2>
        <form action={addRecording} className="mt-4 space-y-3">
          <select name="class_id" required>
            <option value="">Select class</option>
            {(classes ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Lesson title" required />
          <input name="youtube_video_id" placeholder="YouTube video ID" required />
          <input name="release_at" type="date" required />
          <button type="submit">Save Recording</button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Recordings</h2>
        <div className="mt-4 space-y-2">
          {(recordings ?? []).map((recording) => {
            const group = Array.isArray(recording.class_groups) ? recording.class_groups[0] : recording.class_groups;
            return (
              <article key={recording.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-medium">{recording.title}</p>
                <p className="text-slate-600">{group?.name}</p>
                <p className="text-slate-500">{recording.release_at}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
