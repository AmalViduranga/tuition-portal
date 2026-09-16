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
import { Video, FileText, BookOpen, ShieldCheck, HelpCircle, ArrowRight, Sparkles } from "lucide-react";

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
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single(),
    supabase.from("site_settings").select("key, value"),
    loadStudentRecordings(supabase, user.id, null),
    loadStudentMaterials(supabase, user.id, null),
    getStudentAccessContext(supabase, user.id),
  ]);

  const profile = profileRes.data;
  const enrollments = accessContext.enrollments || [];
  const siteSettings = settingsRes.data;

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

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-700 dark:via-indigo-900 dark:to-slate-900 px-6 py-10 shadow-xl sm:px-10 sm:py-12 text-white border border-blue-400/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-blue-100 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{greeting}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="mt-2 max-w-xl text-blue-100 text-sm sm:text-base font-light leading-relaxed">
              You are enrolled in {enrollments.length} active {enrollments.length === 1 ? "class" : "classes"}.
              {latestExpiry && ` Current access verified through ${latestExpiry}.`}
            </p>
          </div>
          <div className="flex shrink-0">
            <Link
              href="/portal/recordings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition-all duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Watch Lessons</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left + Center Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              href="/portal/recordings"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Class Recordings</span>
            </Link>

            <Link
              href="/portal/materials"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Study Materials</span>
            </Link>

            <Link
              href="/portal/classes"
              className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">My Classes</span>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                      href="/portal/recordings"
                      className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1"
                    >
                      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        <RecordingThumbnail
                          thumbnailUrl={rec.thumbnail_url}
                          youtubeVideoId={rec.youtube_video_id}
                          title={rec.title}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white/95 text-blue-600 opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                            <svg className="ml-0.5 h-5 w-5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-xs leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1.5 font-medium">
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-150 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-base">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                            {mat.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
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
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-0 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Overview</p>
                <h2 className="text-base font-extrabold text-white mt-0.5">Profile Info</h2>
              </div>
              <Link
                href="/dashboard/profile"
                className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex flex-col border-b border-slate-700/60 pb-2">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-semibold text-slate-100 text-sm mt-0.5">{profile?.full_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">Registered Email</span>
                <span className="font-semibold text-slate-100 text-xs mt-0.5 truncate">{profile?.email}</span>
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
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
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
                              {group?.name || "Class"}
                            </span>
                            <Badge
                              variant={
                                isActive ? (e.access_mode === "free_card" ? "success" : "default") : "danger"
                              }
                            >
                              {isActive ? (e.access_mode === "free_card" ? "FREE" : "ACTIVE") : "EXPIRED"}
                            </Badge>
                          </div>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
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
