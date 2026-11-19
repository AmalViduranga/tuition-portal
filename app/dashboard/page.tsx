import Link from "next/link";
import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, DateFormat, Badge } from "@/components/ui";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import { getStudentAccessContext, isClassAccessActive } from "@/lib/recordings/access-logic";
import { PasswordChangeForm, WhatsAppButton } from "./ClientFeatures";
import { RecordingThumbnail } from "@/components/recordings";
import { MaterialOpenLink } from "@/components/materials/MaterialOpenLink";
import { Video, FileText, BookOpen, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Student Dashboard | MathsLK",
  description: "Access your A/L Mathematics classes, materials, recordings, and account settings.",
};

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const { supabase, user } = await requireUser();

  const [
    profileRes,
    settingsRes,
    recordingsPayload,
    materialsPayload,
    accessContext,
    enrollmentClassesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single(),
    supabase.from("site_settings").select("key, value"),
    loadStudentRecordings(supabase, user.id, null),
    loadStudentMaterials(supabase, user.id, null),
    getStudentAccessContext(supabase, user.id),
    supabase
      .from("student_class_enrollments")
      .select("class_id, class_groups(id, name, is_active)")
      .eq("student_id", user.id)
      .is("revoked_at", null),
  ]);

  const profile = profileRes.data;
  const siteSettings = settingsRes.data;

  const classNameById = new Map<string, string>();
  const activeClassIds = new Set<string>();
  (enrollmentClassesRes.data ?? []).forEach((row) => {
    const cg = Array.isArray(row.class_groups) ? row.class_groups[0] : row.class_groups;
    if (cg?.name) {
      classNameById.set(row.class_id, cg.name);
    }
    if (cg?.is_active) {
      activeClassIds.add(row.class_id);
    }
  });
  const activeClassCount = activeClassIds.size;
  const enrollments = (accessContext.enrollments || []).filter((e: { class_id: string }) =>
    activeClassIds.has(e.class_id)
  );

  const whatsappPhone = siteSettings?.find((s) => s.key === "contact_phone")?.value || "";

  const accessibleRecordings = (recordingsPayload?.recordings || []).slice(0, 3);
  const accessibleMaterials = (materialsPayload?.materials || []).slice(0, 3);

  // Calculate latest expiry for the banner info if needed
  const latestExpiry = enrollments.reduce(
    (latest: string | null, e: { start_access_date: string; access_end_date?: string | null }) => {
      const start = e.start_access_date;
      let end = e.access_end_date;
      if (!end) {
        const d = new Date(start);
        d.setDate(d.getDate() + 40);
        end = d.toISOString().split("T")[0];
      }
      if (!latest) return end;
      return end > latest ? end : latest;
    },
    null
  );

  // Greeting follows Sri Lanka time, not the server's clock (display only).
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Colombo" }).format(new Date()),
  );
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome */}
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {profile?.full_name?.split(" ")[0] || "Student"}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            You are enrolled in {activeClassCount} active {activeClassCount === 1 ? "class" : "classes"}.
            {latestExpiry && ` Current access verified through ${latestExpiry}.`}
          </p>
        </div>
        <Link
          href="/portal/recordings"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <span>Watch Lessons</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left + Center Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              href="/portal/recordings"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card p-5 transition-colors hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Video className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-foreground">Class Recordings</span>
            </Link>

            <Link
              href="/portal/materials"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card p-5 transition-colors hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-foreground">Study Materials</span>
            </Link>

            <Link
              href="/portal/classes"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card p-5 transition-colors hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-foreground">My Classes</span>
            </Link>
          </div>

          {/* Accessible Recordings Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Latest Recordings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Recently published class sessions</p>
              </div>
              <Link
                href="/portal/recordings"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {accessibleRecordings.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  No recordings available for your active enrollment period.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accessibleRecordings.map(
                  (rec: {
                    id: string;
                    youtube_video_id: string;
                    title: string;
                    thumbnail_url?: string | null;
                    class_groups?: { name?: string } | { name?: string }[] | null;
                  }) => (
                    <Link
                      key={rec.id}
                      href={`/portal/recordings?highlight=${encodeURIComponent(rec.id)}`}
                      className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        <RecordingThumbnail
                          thumbnailUrl={rec.thumbnail_url}
                          youtubeVideoId={rec.youtube_video_id}
                          title={rec.title}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                            <svg className="ml-0.5 h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-xs leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1.5 font-medium">
                          {(Array.isArray(rec.class_groups) ? rec.class_groups[0] : rec.class_groups)?.name}
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </section>

          {/* Available Materials Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Recent Materials
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class notes, handouts & past papers</p>
              </div>
              <Link
                href="/portal/materials"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {accessibleMaterials.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  No materials available for your current access periods.
                </p>
              </Card>
            ) : (
              <div className="grid gap-2.5">
                {accessibleMaterials.map(
                  (mat: {
                    id: string;
                    file_url: string;
                    file_type?: string | null;
                    title: string;
                    release_at: string;
                    class_groups?: { name?: string } | { name?: string }[] | null;
                  }) => (
                    <MaterialOpenLink
                      key={mat.id}
                      materialId={mat.id}
                      action="view"
                      className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-150 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-base">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {mat.title}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {(Array.isArray(mat.class_groups) ? mat.class_groups[0] : mat.class_groups)?.name ||
                              "Class"}{" "}
                            &middot; <DateFormat date={mat.release_at} format="short" />
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-3">
                        Open &rarr;
                      </span>
                    </MaterialOpenLink>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column / Sidebar */}
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Your account</h2>
              </div>
              <Link
                href="/dashboard/profile"
                className="text-sm font-semibold text-link underline-offset-4 hover:underline"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col border-b border-border pb-2">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-semibold text-foreground text-sm mt-0.5">{profile?.full_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Registered Email</span>
                <span className="font-semibold text-foreground text-sm mt-0.5 truncate">{profile?.email}</span>
              </div>
            </div>
          </Card>

          {/* Enrollment & Access summary */}
          <Card>
            <div className="mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enrollment & Access
              </h2>
            </div>
            <div className="space-y-3">
              {enrollments.length === 0 ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-bold">No active enrollments.</p>
                  <p className="mt-1 opacity-90">Contact class administration to enroll and unlock lessons.</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {enrollments.map(
                    (
                      e: {
                        class_id: string;
                        start_access_date: string;
                        access_end_date?: string | null;
                        access_mode?: string;
                        class_groups?: { name?: string } | { name?: string }[];
                      },
                      idx: number
                    ) => {
                      const group = Array.isArray(e.class_groups) ? e.class_groups[0] : e.class_groups;
                      const className = group?.name || classNameById.get(e.class_id) || "Class";
                      const isActive = isClassAccessActive(e.class_id, accessContext);

                      const start = e.start_access_date;
                      let end = e.access_end_date;
                      if (!end) {
                        const d = new Date(start);
                        d.setDate(d.getDate() + 40);
                        end = d.toISOString().split("T")[0];
                      }

                      return (
                        <div
                          key={idx}
                          className="flex flex-col justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`truncate pr-2 ${
                                isActive ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-400"
                              }`}
                            >
                              {className}
                            </span>
                            <Badge
                              variant={
                                isActive ? (e.access_mode === "free_card" ? "success" : "default") : "danger"
                              }
                            >
                              {isActive ? (e.access_mode === "free_card" ? "FREE" : "ACTIVE") : "EXPIRED"}
                            </Badge>
                          </div>
                          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                            {e.start_access_date} &rarr; {end}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Security & Password */}
          <Card>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Security Settings
              </h2>
            </div>
            <PasswordChangeForm />
          </Card>

          {/* Support widget */}
          <Card className="border-dashed bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Need Support?</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              If you have any questions about your classes, receipts, or recordings, reach out via WhatsApp.
            </p>
            <WhatsAppButton whatsappNumber={whatsappPhone} />
          </Card>
        </div>
      </div>
    </div>
  );
}
