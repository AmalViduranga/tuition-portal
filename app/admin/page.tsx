import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/admin/StatsCard";
import Card from "@/components/ui/Card";
import Link from "next/link";
import DateFormat from "@/components/ui/DateFormat";

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();

  const [
    { count: totalStudents },
    { count: totalClasses },
    { count: totalEnrollments },
    { count: recentRecordings },
    { count: recentMaterials },
    { data: studentsList },
    { data: recordingsList },
    { data: materialsList },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact" }).eq("role", "student"),
    supabase.from("class_groups").select("*", { count: "exact" }).eq("is_active", true),
    supabase.from("student_class_enrollments").select("*", { count: "exact" }),
    supabase.from("recordings").select("*", { count: "exact" }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("materials").select("*", { count: "exact" }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("profiles").select("id, full_name, created_at").eq("role", "student").order("created_at", { ascending: false }).limit(5),
    supabase.from("recordings").select("id, title, release_at, class_groups(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("materials").select("id, title, release_at, class_groups(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Students" value={totalStudents || 0} icon="👥" href="/admin/students" />
        <StatsCard title="Total Classes" value={totalClasses || 0} icon="📚" href="/admin/classes" />
        <StatsCard title="Active Enrollments" value={totalEnrollments || 0} icon="📝" href="/admin/enrollments" />
        <StatsCard title="Recent Recordings" value={recentRecordings || 0} icon="🎥" href="/admin/recordings" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Students</h2>
            <Link href="/admin/students" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          {studentsList && studentsList.length > 0 ? (
            <div className="space-y-3">
              {studentsList.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{student.full_name || "Unnamed"}</p>
                    <p className="text-xs text-slate-500">{student.id.slice(0, 8)}...</p>
                  </div>
                  <span className="text-sm text-slate-500">
                    <DateFormat date={student.created_at} format="short" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No students yet</p>
          )}
        </Card>

        {/* Recent Recordings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Recordings</h2>
            <Link href="/admin/recordings" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          {recordingsList && recordingsList.length > 0 ? (
            <div className="space-y-3">
              {recordingsList.map((rec) => (
                <div key={rec.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{rec.title}</p>
                      <p className="text-xs text-slate-500">{(rec.class_groups as any)?.name || Array.isArray(rec.class_groups) && (rec.class_groups as any)[0]?.name}</p>
                    </div>
                    <span className="text-sm text-slate-500">
                      <DateFormat date={rec.release_at} format="short" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recordings yet</p>
          )}
        </Card>

        {/* Recent Materials */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Materials</h2>
            <Link href="/admin/materials" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          {materialsList && materialsList.length > 0 ? (
            <div className="space-y-3">
              {materialsList.map((mat) => (
                <div key={mat.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{mat.title}</p>
                      <p className="text-xs text-slate-500">{(mat.class_groups as any)?.name || Array.isArray(mat.class_groups) && (mat.class_groups as any)[0]?.name}</p>
                    </div>
                    <span className="text-sm text-slate-500">
                      <DateFormat date={mat.release_at} format="short" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No materials yet</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/students"
              className="flex flex-col items-center rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium text-slate-700">Add Student</span>
            </Link>
            <Link
              href="/admin/classes"
              className="flex flex-col items-center rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-sm font-medium text-slate-700">Create Class</span>
            </Link>
            <Link
              href="/admin/recordings"
              className="flex flex-col items-center rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl mb-2">🎥</span>
              <span className="text-sm font-medium text-slate-700">Add Recording</span>
            </Link>
            <Link
              href="/admin/materials"
              className="flex flex-col items-center rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm font-medium text-slate-700">Upload Material</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
