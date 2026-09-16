import Image from "next/image";
import Link from "next/link";
import { 
  Video, 
  BookOpen, 
  BarChart2, 
  Sunrise, 
  Sun, 
  Moon, 
  ArrowRight, 
  Play, 
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui";
import { extractYouTubeVideoId } from "@/lib/recordings/youtube";
import { uniqueBy } from "@/lib/utils/arrays";

export default async function PortalHomePage() {
  const { supabase, user } = await requireUser();

  const adminDb = createAdminClient();

  const [{ data: enrollments }, { data: recentRecordings }] = await Promise.all([
    supabase
      .from("student_class_enrollments")
      .select("class_id, start_access_date, class_groups(id, name, is_active)")
      .eq("student_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
    adminDb
      .from("recordings")
      .select(`
        id,
        title,
        youtube_video_id,
        release_at,
        class_groups (id, name, is_active)
      `)
      .eq("published", true)
      .lte("release_at", new Date().toISOString().split("T")[0])
      .order("release_at", { ascending: false })
      .limit(6),
  ]);

  const activeEnrollments = (enrollments || []).filter((e: { class_groups: { is_active?: boolean } | { is_active?: boolean }[] }) => {
    const group = Array.isArray(e.class_groups) ? e.class_groups[0] : e.class_groups;
    return group?.is_active === true;
  });

  // Filter recordings to only those the student has access to in active classes
  const accessibleClassIds = new Set(
    activeEnrollments.map((e: { class_groups: { id: string } | { id: string }[] }) => {
      const group = Array.isArray(e.class_groups) ? e.class_groups[0] : e.class_groups;
      return group?.id;
    })
  );

  // Also verify against the strict access rules via student grants
  const { getStudentAccessContext } = await import("@/lib/recordings/access-logic");
  const accessContext = await getStudentAccessContext(supabase, user.id);

  const accessibleRecordings = (recentRecordings ?? []).filter((rec) => {
    const group = Array.isArray(rec.class_groups) ? rec.class_groups[0] : rec.class_groups;
    if (group && (group as { is_active?: boolean }).is_active === false) return false;
    const isEnrolled = group && accessibleClassIds.has(group.id);
    return isEnrolled && accessContext.recordingGrants.has(rec.id);
  });

  // Get current time-based greeting
  const hour = new Date().getHours();
  let greetingMsg = "Good morning";
  let GreetingIcon = Sunrise;
  if (hour >= 12 && hour < 17) {
    greetingMsg = "Good afternoon";
    GreetingIcon = Sun;
  } else if (hour >= 17) {
    greetingMsg = "Good evening";
    GreetingIcon = Moon;
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const studentName = profile?.full_name || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 shadow-inner">
              <GreetingIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Student Portal
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
                {greetingMsg}, {studentName}!
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-blue-100">
                Continue your Combined Maths journey with lessons, recordings, and class resources.
              </p>
            </div>
          </div>
          <Link
            href="/portal/recordings"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-blue-600 text-blue-600" />
            <span>Watch Latest Lesson</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/portal/recordings"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              <Video className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">View Recordings</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Stream high-definition class lectures and revise key problem solutions.
          </p>
        </Link>

        <Link
          href="/portal/classes"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">My Classes</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Check your active batches, weekly schedules, and enrolled groups.
          </p>
        </Link>

        <Link
          href="/results"
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <BarChart2 className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Results & Rank</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Check your monthly test marks, progress reports, and batch standings.
          </p>
        </Link>
      </div>

      {/* Your Classes */}
      <Card>
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Enrolled Classes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Classes currently active on your student profile</p>
          </div>
          <Link 
            href="/portal/classes" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">You are not enrolled in any active classes yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact your instructor to activate your batch access.</p>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {uniqueBy(activeEnrollments, (e) => e.class_id).slice(0, 4).map((enrollment: { class_id: string; start_access_date: string; class_groups: { name: string } | { name: string }[] }) => {
              const group = Array.isArray(enrollment.class_groups)
                ? enrollment.class_groups[0]
                : enrollment.class_groups;
              return (
                <div
                  key={`${enrollment.class_id}-${enrollment.start_access_date}`}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{group?.name ?? "Class"}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>Access started: {enrollment.start_access_date}</span>
                    </div>
                  </div>
                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Link
                      href={`/portal/class/${enrollment.class_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <span>Open Class</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Recordings */}
      <Card>
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Recordings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest recorded lessons released to your batch</p>
          </div>
          <Link 
            href="/portal/recordings" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {accessibleRecordings.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No recordings available yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recordings will appear here once they are published and released.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accessibleRecordings.slice(0, 6).map((recording) => {
              const group = Array.isArray(recording.class_groups)
                ? recording.class_groups[0]
                : recording.class_groups;
              return (
                <div
                  key={recording.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden group cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200"
                >
                  <Link href={`/portal/recordings`} className="block">
                    <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                      {(() => {
                        const cleanId = extractYouTubeVideoId(recording.youtube_video_id);
                        if (!cleanId) {
                          return (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                              <Video className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                          );
                        }
                        return (
                          <Image
                            src={`https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`}
                            alt={recording.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        );
                      })()}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                        <div className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                        {recording.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-medium truncate max-w-[140px]">{group?.name}</span>
                        {recording.release_at && (
                          <span>{new Date(recording.release_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

