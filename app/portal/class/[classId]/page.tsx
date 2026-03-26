import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

type Props = {
  params: Promise<{ classId: string }>;
};

export default async function ClassDetailPage({ params }: Props) {
  const { classId } = await params;
  const { supabase, user } = await requireUser();

  const { data: enrollment } = await supabase
    .from("student_class_enrollments")
    .select("class_id, start_access_date, class_groups(name)")
    .eq("student_id", user.id)
    .eq("class_id", classId)
    .maybeSingle();

  if (!enrollment) {
    notFound();
  }

  const { data: recordings } = await supabase
    .from("recordings")
    .select("id, title, youtube_video_id, release_at")
    .eq("class_id", classId)
    .order("release_at", { ascending: false });

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, file_url, release_at")
    .eq("class_id", classId)
    .order("release_at", { ascending: false });

  const { data: paidPeriods } = await supabase
    .from("student_class_payment_periods")
    .select("start_date, end_date")
    .eq("student_id", user.id)
    .eq("class_id", classId);

  const { data: manualRecordingUnlocks } = await supabase
    .from("recording_manual_unlocks")
    .select("recording_id")
    .eq("student_id", user.id);

  const { data: manualMaterialUnlocks } = await supabase
    .from("material_manual_unlocks")
    .select("material_id")
    .eq("student_id", user.id);

  const startAccessDate = enrollment.start_access_date ?? "1900-01-01";
  const unlockedRecordingIds = new Set((manualRecordingUnlocks ?? []).map((x) => x.recording_id));
  const unlockedMaterialIds = new Set((manualMaterialUnlocks ?? []).map((x) => x.material_id));

  const isDateWithinPaidPeriods = (releaseAt: string) =>
    (paidPeriods ?? []).some((period) => releaseAt >= period.start_date && releaseAt <= period.end_date);

  const canAccess = (id: string, releaseAt: string, manualSet: Set<string>) =>
    manualSet.has(id) || (releaseAt >= startAccessDate && isDateWithinPaidPeriods(releaseAt));

  const visibleRecordings = (recordings ?? []).filter((item) =>
    canAccess(item.id, item.release_at, unlockedRecordingIds),
  );
  const visibleMaterials = (materials ?? []).filter((item) =>
    canAccess(item.id, item.release_at, unlockedMaterialIds),
  );

  const group = Array.isArray(enrollment.class_groups)
    ? enrollment.class_groups[0]
    : enrollment.class_groups;

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{group?.name ?? "Class"}</h1>
        <p className="mt-2 text-sm text-slate-600">
          You can view recordings/materials released during your approved paid period. Old unlocked content remains
          available.
        </p>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recordings</h2>
        <div className="mt-4 grid gap-4">
          {visibleRecordings.map((recording) => (
            <article key={recording.id} className="rounded-md border border-slate-200 p-4">
              <h3 className="font-medium">{recording.title}</h3>
              <p className="text-sm text-slate-600">Released: {recording.release_at}</p>
              <div className="mt-3 aspect-video w-full overflow-hidden rounded-md">
                <iframe
                  title={recording.title}
                  src={`https://www.youtube.com/embed/${recording.youtube_video_id}`}
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </article>
          ))}
          {visibleRecordings.length === 0 ? <p className="text-sm text-slate-600">No recordings available yet.</p> : null}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Materials</h2>
        <div className="mt-4 grid gap-3">
          {visibleMaterials.map((material) => (
            <article key={material.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{material.title}</p>
              <p className="text-sm text-slate-600">Released: {material.release_at}</p>
              <a href={material.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-blue-600">
                Open PDF
              </a>
            </article>
          ))}
          {visibleMaterials.length === 0 ? <p className="text-sm text-slate-600">No materials available yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
