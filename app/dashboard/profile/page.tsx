import { requireUser } from "@/lib/auth";
import { Badge, Card, DateFormat } from "@/components/ui";
import { ProfileEditForm } from "./ClientProfileFeatures";
import { PasswordChangeForm } from "../ClientFeatures";
import Link from "next/link";
import { User, Mail, Phone, Calendar, Shield, Activity, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: enrollments }, { data: paymentPeriods }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("student_class_enrollments")
      .select("*, class_groups(name)")
      .eq("student_id", user.id),
    supabase
      .from("student_class_payment_periods")
      .select("*, class_groups(name)")
      .eq("student_id", user.id)
      .order("end_date", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your account settings, personal information, and class access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Personal Info & Security */}
        <div className="space-y-6 md:col-span-2">
          
          <Card>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">Update your basic profile details.</p>
              </div>
            </div>
            
            <ProfileEditForm 
              initialName={profile?.full_name || ""} 
              initialPhone={profile?.phone || ""} 
            />
          </Card>

          <Card>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  Account Security
                </h2>
                <p className="text-sm text-slate-500 mt-1">Change your current password.</p>
              </div>
            </div>
            
            <PasswordChangeForm />
          </Card>

        </div>

        {/* Right Column: Account Meta & Classes */}
        <div className="space-y-6">
          
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Account Details</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address</p>
                  <p className="font-medium text-slate-900 break-all">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                  <div className="mt-1">
                    <Badge variant={profile?.is_active ? "success" : "danger"}>
                      {profile?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Joined Date</p>
                  <p className="font-medium text-slate-900">
                    <DateFormat date={profile?.created_at} format="long" />
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Role</p>
                  <p className="capitalize font-medium text-slate-900">{profile?.role}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                My Enrolled Classes
              </h2>
            </div>
            
            {!enrollments || enrollments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">You are not enrolled in any classes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr: any) => {
                  const className = Array.isArray(enr.class_groups) 
                    ? enr.class_groups[0]?.name 
                    : enr.class_groups?.name;
                    
                  // Find active payment for this class
                  const activePayment = paymentPeriods?.find((p: any) => 
                    p.class_id === enr.class_id && 
                    (p.status === "approved" || p.status === "pending")
                  );

                  return (
                    <div key={enr.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-2">
                        {className || "Unknown Class"}
                      </h3>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Access Mode:</span>
                          <span className="font-medium capitalize text-slate-900">{enr.access_mode?.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Payment Status:</span>
                          {activePayment ? (
                            <Badge variant={activePayment.status === "approved" ? "success" : "warning"} className="text-[10px] px-2 py-0">
                              {activePayment.status}
                            </Badge>
                          ) : (
                            <span className="font-medium text-rose-600">No active access</span>
                          )}
                        </div>
                        {activePayment?.end_date && (
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Valid Until:</span>
                            <span className="font-medium"><DateFormat date={activePayment.end_date} format="short" /></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2">
                  <Link href="/dashboard" className="w-full inline-flex justify-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Go to Dashboard &rarr;
                  </Link>
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
