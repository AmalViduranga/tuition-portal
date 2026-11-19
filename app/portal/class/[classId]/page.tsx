import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video, FileText, Download, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import { getStudentAccessContext, isClassAccessActive } from "@/lib/recordings/access-logic";
import ClassRecordingsList from "@/components/recordings/ClassRecordingsList";
import { MaterialOpenLink } from "@/components/materials/MaterialOpenLink";

type Props = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ highlight?: string }>;
};

export default async function ClassDetailPage({ params, searchParams }: Props) {
  const { classId } = await params;
  const { highlight } = await searchParams;
  const { supabase, user } = await requireUser();

  // Load recordings, materials, access context, and non-revoked enrollments for this class.
  const [recordingsPayload, materialsPayload, accessContext, enrollRes] = await Promise.all([
    loadStudentRecordings(supabase, user.id, classId),
    loadStudentMaterials(supabase, user.id, classId),
    getStudentAccessContext(supabase, user.id),
    supabase
      .from("student_class_enrollments")
      .select("start_access_date, access_end_date, class_groups(id, name, description, is_active)")
      .eq("student_id", user.id)
      .eq("class_id", classId)
      .is("revoked_at", null)
      .order("start_access_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (enrollRes.error) {
    console.error("Failed to load class enrollment:", enrollRes.error);
    notFound();
  }

  const activeEnrollmentRows = (enrollRes.data ?? []).filter((row) => {
    const cg = Array.isArray(row.class_groups) ? row.class_groups[0] : row.class_groups;
    return cg?.is_active === true;
  });

  const isAccessActive = isClassAccessActive(classId, accessContext);
  const visibleRecordings = recordingsPayload.recordings;
  const visibleMaterials = materialsPayload.materials;

  // Prefer an enrollment row with an active/valid class_group; fall back to access via existing grants.
  const preferredEnrollment =
    activeEnrollmentRows.find((row) => {
      const today = new Date().toISOString().split("T")[0];
      let end = row.access_end_date;
      if (!end) {
        const d = new Date(row.start_access_date);
        d.setDate(d.getDate() + 40);
        end = d.toISOString().split("T")[0];
      }
      return today >= row.start_access_date && today <= end;
    }) ?? activeEnrollmentRows[0];

  const group = preferredEnrollment
    ? Array.isArray(preferredEnrollment.class_groups)
      ? preferredEnrollment.class_groups[0]
      : preferredEnrollment.class_groups
    : null;

  if (!group?.is_active) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/portal/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Classes
        </Link>
        <div className="rounded-lg bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={isAccessActive ? "success" : "warning"} className="font-semibold text-xs">
                  {isAccessActive ? "Enrollment Active" : "Access Window Inactive"}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {group?.name ?? "Class"}
              </h1>
              {group?.description ? (
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
                  {group.description}
                </p>
              ) : (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Access is based on your enrollment window and approved payments.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-lg bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Class Recordings</h2>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 ml-auto">
            {visibleRecordings.length}
          </span>
        </div>
        <ClassRecordingsList recordings={visibleRecordings} highlight={highlight} />
      </section>

      <section className="rounded-lg bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Class Materials</h2>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 ml-auto">
            {visibleMaterials.length}
          </span>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {visibleMaterials.map((material) => (
            <article 
              key={material.id} 
              id={material.id}
              className={`rounded-lg border p-4 transition-all duration-200 ${
                highlight === material.id 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500' 
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/30 dark:hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{material.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Released: {material.release_at}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                <MaterialOpenLink 
                  materialId={material.id} 
                  action="view" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                </MaterialOpenLink>
                <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                <MaterialOpenLink 
                  materialId={material.id} 
                  action="download" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </MaterialOpenLink>
              </div>
            </article>
          ))}
          {visibleMaterials.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No materials uploaded for this class yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

