import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, DateFormat, Badge } from "@/components/ui";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import { PasswordChangeForm, WhatsAppButton } from "./ClientFeatures";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const { supabase, user } = await requireUser();

  let profilePayload, enrollmentsPayload, paymentPeriodsPayload, siteSettingsPayload, recordingsPayload, materialsPayload;
  
  try {
    profilePayload = await supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).single();
    if (profilePayload.error) throw profilePayload.error;
  } catch (e) {
    console.error("Profiles error:", e);
    throw e;
  }

  try {
    enrollmentsPayload = await supabase.from("student_class_enrollments").select("class_id, start_access_date, class_groups(id, name)").eq("student_id", user.id);
    if (enrollmentsPayload.error) throw enrollmentsPayload.error;
  } catch (e) {
    console.error("Enrollments error:", e);
    throw e;
  }

  try {
    paymentPeriodsPayload = await supabase.from("student_class_payment_periods").select("class_id, start_date, end_date, status, class_groups(name)").eq("student_id", user.id).order("end_date", { ascending: false });
    if (paymentPeriodsPayload.error) throw paymentPeriodsPayload.error;
  } catch (e) {
    console.error("Payment periods error:", e);
    throw e;
  }

  try {
    siteSettingsPayload = await supabase.from("site_settings").select("key, value");
    if (siteSettingsPayload.error) throw siteSettingsPayload.error;
  } catch (e) {
    console.error("Site settings error:", e);
    throw e;
  }

  try {
    recordingsPayload = await loadStudentRecordings(supabase, user.id, null);
  } catch (e) {
    console.error("Recordings error:", e);
    throw e;
  }

  try {
    materialsPayload = await loadStudentMaterials(supabase, user.id, null);
  } catch (e) {
    console.error("Materials error:", e);
    throw e;
  }

  const { data: profile } = profilePayload;
  const { data: enrollments } = enrollmentsPayload;
  const { data: paymentPeriods } = paymentPeriodsPayload;
  const { data: siteSettings } = siteSettingsPayload;
  
  const whatsappPhone = siteSettings?.find(s => s.key === "contact_phone")?.value || "";

  // Compute easy variables
  const recentRecordings = recordingsPayload?.recordings?.slice(0, 3) || [];
  const recentMaterials = materialsPayload?.materials?.slice(0, 3) || [];
  const activePayments = paymentPeriods?.filter(p => p.status === "approved" || p.status === "pending") || [];
  
  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-10 shadow-lg sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {profile?.full_name?.split(" ")[0]}!
            </h1>
            <p className="mt-2 max-w-xl text-indigo-100 text-lg">
              You're enrolled in {(enrollments || []).length} classes. Pick up where you left off.
            </p>
          </div>
          <div className="flex shrink-0">
            <Link 
              href="/portal/recordings" 
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600 shadow-sm transition-all hover:bg-slate-50 hover:scale-105"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left + Center Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/portal/recordings" className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-indigo-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600 transition-colors group-hover:bg-indigo-100">🎥</span>
              <span className="text-sm font-semibold text-slate-700">Recordings</span>
            </Link>
            <Link href="/portal/materials" className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-indigo-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600 transition-colors group-hover:bg-blue-100">📚</span>
              <span className="text-sm font-semibold text-slate-700">Materials</span>
            </Link>
            <Link href="/portal/classes" className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-indigo-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600 transition-colors group-hover:bg-emerald-100">🏛️</span>
              <span className="text-sm font-semibold text-slate-700">My Classes</span>
            </Link>
          </div>

          {/* 3. Accessible Recordings Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Latest Recordings</h2>
              <Link href="/portal/recordings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all →
              </Link>
            </div>
            {recentRecordings.length === 0 ? (
              <Card className="text-center py-12 bg-slate-50/50 border-dashed">
                <p className="text-slate-500">No recent recordings available right now.</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentRecordings.map((rec) => (
                  <Link key={rec.id} href="/portal/recordings" className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
                    <div className="aspect-video w-full bg-slate-100 relative">
                      <img
                        src={`https://img.youtube.com/vi/${rec.youtube_video_id}/mqdefault.jpg`}
                        alt={rec.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' fill='%23eee'%3E%3Crect width='320' height='180'/%3E%3C/svg%3E";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm">{rec.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 truncate">{Array.isArray(rec.class_groups) ? rec.class_groups[0]?.name : rec.class_groups?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 4. Available Materials Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Materials</h2>
              <Link href="/portal/materials" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all →
              </Link>
            </div>
            {recentMaterials.length === 0 ? (
              <Card className="text-center py-12 bg-slate-50/50 border-dashed">
                <p className="text-slate-500">No new materials uploaded yet.</p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1">
                {recentMaterials.map((mat) => (
                  <a key={mat.id} href={mat.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xl text-indigo-600">
                        {mat.file_type?.includes("pdf") ? "📕" : "📄"}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 text-sm">{mat.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Array.isArray(mat.class_groups) ? mat.class_groups[0]?.name : mat.class_groups?.name} &middot; <DateFormat date={mat.release_at} format="short" />
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">Open</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column / Side Bar */}
        <div className="space-y-6">
          
          {/* 6. Profile Section */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-md">
            <h2 className="text-lg font-bold mb-4">Profile Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Name</span>
                <span className="font-medium text-slate-100">{profile?.full_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Email</span>
                <span className="font-medium text-slate-100">{profile?.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Phone</span>
                <span className="font-medium text-slate-100">{profile?.phone || "Not provided"}</span>
              </div>
            </div>
          </Card>

          {/* 5. Payment/access summary */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Access & Payments</h2>
            <div className="space-y-4">
              {activePayments.length === 0 ? (
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-sm text-amber-800">
                  <p className="font-semibold">No active access periods.</p>
                  <p className="mt-1 opacity-90">Please contact the admin to approve your module payments to unlock contents securely.</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {activePayments.map((p, idx) => (
                    <div key={idx} className="flex flex-col justify-between py-2 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 truncate pr-2">
                          {Array.isArray(p.class_groups) ? (p.class_groups as any)[0]?.name : (p.class_groups as any)?.name}
                        </span>
                        <Badge variant={p.status === "approved" ? "success" : "warning"}>
                          {p.status}
                        </Badge>
                      </div>
                      <span className="text-slate-500 text-xs">
                        Valid: <DateFormat date={p.start_date} format="short" /> - <DateFormat date={p.end_date} format="short" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 7. Change password option */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </h2>
            <PasswordChangeForm />
          </Card>

          {/* 8. Quick contact / WhatsApp support button */}
          <Card className="bg-slate-50 border-slate-200 border-dashed">
            <h2 className="text-base font-bold text-slate-900 mb-2">Need Help?</h2>
            <p className="text-sm text-slate-600 mb-4">
              If you have any questions regarding class access or technical issues, reach out to us!
            </p>
            <WhatsAppButton whatsappNumber={whatsappPhone} />
          </Card>

        </div>
      </div>
    </div>
  );
}
