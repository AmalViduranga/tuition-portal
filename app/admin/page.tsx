import { requireAdmin } from "@/lib/auth";
import StatsCard from "@/components/admin/StatsCard";
import Card from "@/components/ui/Card";
import Link from "next/link";
import DateFormat from "@/components/ui/DateFormat";
import { Users, BookOpen, CreditCard, Video, FileText, ArrowRight, UserPlus, FolderPlus } from "lucide-react";

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalStudents },
    { count: totalClasses },
    { count: totalEnrollments },
    { count: recentRecordings },
    /* recentMaterials */,
    { data: studentsList },
    { data: recordingsList },
    { data: materialsList },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact" }).eq("role", "student"),
    supabase.from("class_groups").select("*", { count: "exact" }).eq("is_active", true),
    supabase.from("student_class_enrollments").select("*", { count: "exact" }),
    supabase.from("recordings").select("*", { count: "exact" }).gte("created_at", sevenDaysAgo),
    supabase.from("materials").select("*", { count: "exact" }).gte("created_at", sevenDaysAgo),
    supabase.from("profiles").select("id, full_name, created_at").eq("role", "student").order("created_at", { ascending: false }).limit(5),
    supabase.from("recordings").select("id, title, release_at, class_groups(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("materials").select("id, title, release_at, class_groups(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-8">
      {/* 1. Header welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and management controls for Amal Viduranga tuition system.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={totalStudents || 0}
          icon={<Users className="h-6 w-6" />}
          href="/admin/students"
          description="Registered student accounts"
        />
        <StatsCard
          title="Active Classes"
          value={totalClasses || 0}
          icon={<BookOpen className="h-6 w-6" />}
          href="/admin/classes"
          description="Active batch streams"
        />
        <StatsCard
          title="Class Enrollments"
          value={totalEnrollments || 0}
          icon={<CreditCard className="h-6 w-6" />}
          href="/admin/enrollments"
          description="Active & verified access"
        />
        <StatsCard
          title="Recent Recordings"
          value={recentRecordings || 0}
          icon={<Video className="h-6 w-6" />}
          href="/admin/recordings"
          description="Uploaded in last 7 days"
        />
      </div>

      {/* 3. Operational Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Students</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Newly created accounts</p>
            </div>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {studentsList && studentsList.length > 0 ? (
            <div className="space-y-2.5">
              {studentsList.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs">
                      {student.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {student.full_name || "Unnamed Student"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        ID: {student.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <DateFormat date={student.created_at} format="short" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No students found</div>
          )}
        </Card>

        {/* Recent Recordings */}
        <Card>
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Recordings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest class video uploads</p>
            </div>
            <Link
              href="/admin/recordings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recordingsList && recordingsList.length > 0 ? (
            <div className="space-y-2.5">
              {recordingsList.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold text-xs">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {rec.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {Array.isArray(rec.class_groups)
                          ? (rec.class_groups[0] as { name?: string })?.name
                          : (rec.class_groups as { name?: string })?.name || "General Class"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 ml-3">
                    <DateFormat date={rec.release_at} format="short" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No recordings available</div>
          )}
        </Card>

        {/* Recent Materials */}
        <Card>
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Materials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lecture notes and past papers</p>
            </div>
            <Link
              href="/admin/materials"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {materialsList && materialsList.length > 0 ? (
            <div className="space-y-2.5">
              {materialsList.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {mat.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {Array.isArray(mat.class_groups)
                          ? (mat.class_groups[0] as { name?: string })?.name
                          : (mat.class_groups as { name?: string })?.name || "General Material"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 ml-3">
                    <DateFormat date={mat.release_at} format="short" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No materials uploaded</div>
          )}
        </Card>

        {/* Quick Management Actions */}
        <Card>
          <div className="mb-5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct shortcuts to frequent admin workflows</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/students"
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2.5">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Register Student</span>
            </Link>

            <Link
              href="/admin/classes"
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2.5">
                <FolderPlus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Manage Classes</span>
            </Link>

            <Link
              href="/admin/recordings"
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-2.5">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Publish Recording</span>
            </Link>

            <Link
              href="/admin/materials"
              className="flex flex-col items-center text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2.5">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Material</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
