import Image from "next/image";
import Link from "next/link";
import { Video, ArrowRight, Play, Calendar, Layers } from "lucide-react";
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
  const uniqueActiveEnrollments = uniqueBy(activeEnrollments, (e) => e.class_id);

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

  // Greeting follows Sri Lanka time, not the server's clock (display only).
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Colombo" }).format(new Date()),
  );
  const greetingMsg = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const studentName = profile?.full_name || "Student";

  const shortcutClass =
    "group flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-slate-400 dark:hover:border-slate-500";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greetingMsg}, {studentName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {uniqueActiveEnrollments.length === 0
              ? "You are not enrolled in an active class yet."
              : `${uniqueActiveEnrollments.length} active ${uniqueActiveEnrollments.length === 1 ? "class" : "classes"} on your account.`}
          </p>
        </div>
        <Link
          href="/portal/recordings"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          <span>Watch Latest Lesson</span>
        </Link>
      </header>

      {/* Shortcuts */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/portal/recordings" className={shortcutClass}>
          <span>
            <span className="block text-base font-semibold text-foreground">Recordings</span>
            <span className="mt-1 block text-sm text-muted-foreground">Watch lessons released to your classes.</span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
        </Link>

        <Link href="/portal/classes" className={shortcutClass}>
          <span>
            <span className="block text-base font-semibold text-foreground">My classes</span>
            <span className="mt-1 block text-sm text-muted-foreground">Your enrolled batches and their content.</span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
        </Link>

        <Link href="/results" className={shortcutClass}>
          <span>
            <span className="block text-base font-semibold text-foreground">Past results</span>
            <span className="mt-1 block text-sm text-muted-foreground">A/L results from previous batches.</span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
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

        {uniqueActiveEnrollments.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">You are not enrolled in any active classes yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact your instructor to activate your batch access.</p>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {uniqueActiveEnrollments.slice(0, 4).map((enrollment: { class_id: string; start_access_date: string; class_groups: { name: string } | { name: string }[] }) => {
              const group = Array.isArray(enrollment.class_groups)
                ? enrollment.class_groups[0]
                : enrollment.class_groups;
              return (
                <div
                  key={`${enrollment.class_id}-${enrollment.start_access_date}`}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/30 transition-all flex flex-col justify-between"
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
                      href={`/portal/recordings?class_id=${encodeURIComponent(enrollment.class_id)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <span>Watch Class Recordings</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
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
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden group cursor-pointer bg-white dark:bg-slate-900 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200"
                >
                  <Link href={`/portal/recordings?highlight=${encodeURIComponent(recording.id)}`} className="block">
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
                            className="object-cover transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        );
                      })()}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900">
                          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                        {recording.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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

