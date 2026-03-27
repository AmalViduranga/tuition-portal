import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, DateFormat } from "@/components/ui";

export default async function PortalHomePage() {
  const { supabase, user } = await requireUser();

  const [{ data: enrollments }, { data: recentRecordings }] = await Promise.all([
    supabase
      .from("student_class_enrollments")
      .select("class_id, start_access_date, class_groups(id, name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("recordings")
      .select(`
        id,
        title,
        youtube_video_id,
        release_at,
        class_groups (id, name)
      `)
      .eq("published", true)
      .lte("release_at", new Date().toISOString().split("T")[0])
      .order("release_at", { ascending: false })
      .limit(6),
  ]);

  // Filter recordings to only those the student has access to
  const accessibleClassIds = new Set(
    (enrollments ?? [].map((e) => {
      const group = Array.isArray(e.class_groups) ? e.class_groups[0] : e.class_groups;
      return group?.id;
    }))
  );

  const accessibleRecordings = (recentRecordings ?? []).filter((rec) => {
    const group = Array.isArray(rec.class_groups) ? rec.class_groups[0] : rec.class_groups;
    return group && accessibleClassIds.has(group.id);
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl">
            👋
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
            <p className="text-slate-600">
              Access your classes, recordings, and study materials.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/portal/recordings"
          className="group rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-3">🎥</div>
          <h2 className="font-semibold text-slate-900">View Recordings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Watch class lessons and revise
          </p>
        </Link>

        <Link
          href="/portal/classes"
          className="group rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-3">📚</div>
          <h2 className="font-semibold text-slate-900">My Classes</h2>
          <p className="mt-1 text-sm text-slate-600">
            View your enrolled classes
          </p>
        </Link>

        <Link
          href="/results"
          className="group rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-4xl mb-3">📊</div>
          <h2 className="font-semibold text-slate-900">Results</h2>
          <p className="mt-1 text-sm text-slate-600">
            Check your performance
          </p>
        </Link>
      </div>

      {/* Your Classes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Classes</h2>
          <Link href="/portal/classes" className="text-sm text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>

        {(enrollments ?? []).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-slate-600">You are not enrolled in any classes yet.</p>
            <p className="text-sm text-slate-500 mt-1">Contact your instructor to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(enrollments ?? []).slice(0, 4).map((enrollment) => {
              const group = Array.isArray(enrollment.class_groups)
                ? enrollment.class_groups[0]
                : enrollment.class_groups;
              return (
                <div
                  key={`${enrollment.class_id}-${enrollment.start_access_date}`}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <h3 className="font-medium text-slate-900">{group?.name ?? "Class"}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Access started: {enrollment.start_access_date}
                  </p>
                  <div className="mt-3">
                    <Link
                      href={`/portal/class/${enrollment.class_id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Open Class →
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Recordings</h2>
          <Link href="/portal/recordings" className="text-sm text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>

        {accessibleRecordings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎥</div>
            <p className="text-slate-600">No recordings available yet.</p>
            <p className="text-sm text-slate-500 mt-1">
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
                  className="rounded-lg border border-slate-200 overflow-hidden group cursor-pointer"
                >
                  <Link href={`/portal/recordings`} className="block">
                    <div className="aspect-video relative bg-slate-100">
                      <img
                        src={`https://img.youtube.com/vi/${recording.youtube_video_id}/mqdefault.jpg`}
                        alt={recording.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' fill='%23ddd'%3E%3Crect width='320' height='180'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo thumbnail%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-slate-900 text-sm line-clamp-2">{recording.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{group?.name}</p>
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
