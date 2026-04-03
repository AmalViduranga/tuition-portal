import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Card, Badge, DateFormat } from "@/components/ui";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import ClassRecordingsList from "@/components/recordings/ClassRecordingsList";

type Props = {
  params: Promise<{ classId: string }>;
};

export default async function ClassDetailPage({ params }: Props) {
  const { classId } = await params;
  const { supabase, user } = await requireUser();

  // Load recordings and materials for this specific class using the centralized source of truth
  const [recordingsPayload, materialsPayload, enrollRes] = await Promise.all([
    loadStudentRecordings(supabase, user.id, classId),
    loadStudentMaterials(supabase, user.id, classId),
    supabase.from("student_class_enrollments")
      .select("class_groups(name, description)")
      .eq("student_id", user.id)
      .eq("class_id", classId)
      .maybeSingle()
  ]);

  if (!enrollRes.data) {
    notFound();
  }

  const visibleRecordings = recordingsPayload.recordings;
  const visibleMaterials = materialsPayload.materials;
  const group = Array.isArray(enrollRes.data?.class_groups) 
    ? enrollRes.data.class_groups[0] 
    : enrollRes.data.class_groups;

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">{group?.name ?? "Class"}</h1>
        {group?.description && (
          <p className="mt-2 text-slate-600">{group.description}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="default" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100">
            Enrollment Active
          </Badge>
          <p className="text-xs text-slate-500">
            Access is based on your enrollment window and approved payments.
          </p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recordings</h2>
        <ClassRecordingsList recordings={visibleRecordings} />
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm text-slate-900">
        <h2 className="text-lg font-semibold">Materials</h2>
        <div className="mt-4 grid gap-3">
          {visibleMaterials.map((material) => (
            <article key={material.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{material.title}</p>
              <p className="text-sm text-slate-600">Released: {material.release_at}</p>
              <div className="mt-3 flex items-center gap-4">
                <a href={material.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  Open PDF
                </a>
                <a href={`${material.file_url}?download=`} download className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                  Download
                </a>
              </div>
            </article>
          ))}
          {visibleMaterials.length === 0 ? <p className="text-sm text-slate-600">No materials available yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
