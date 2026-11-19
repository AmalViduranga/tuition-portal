import { requireUser } from "@/lib/auth";
import { Badge, Card, DateFormat } from "@/components/ui";
import { ProfileEditForm } from "./ClientProfileFeatures";
import { PasswordChangeForm } from "../ClientFeatures";
import Link from "next/link";
import { User, Mail, Calendar, Shield, Activity, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: enrollments }, { data: paymentPeriods }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, phone, is_active, created_at, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("student_class_enrollments")
      .select("id, class_id, access_mode, class_groups(name, is_active)")
      .eq("student_id", user.id)
      .is("revoked_at", null),
    supabase
      .from("student_class_payment_periods")
      .select("id, class_id, status, end_date, class_groups(name)")
      .eq("student_id", user.id)
      .order("end_date", { ascending: false }),
  ]);

  const activeEnrollments = (enrollments ?? []).filter(
    (enr: { class_groups?: { name?: string; is_active?: boolean } | { name?: string; is_active?: boolean }[] | null }) => {
      const group = Array.isArray(enr.class_groups) ? enr.class_groups[0] : enr.class_groups;
      return group?.is_active === true;
    }
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account settings, personal information, and class access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Personal Info & Security */}
        <div className="space-y-6 md:col-span-2">
          
          <Card>
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-link" aria-hidden="true" />
                  Personal Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Update your basic profile details.</p>
              </div>
            </div>
            
            <ProfileEditForm 
              initialName={profile?.full_name || ""} 
              initialPhone={profile?.phone || ""} 
            />
          </Card>

          <Card>
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-link" aria-hidden="true" />
                  Account Security
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Change your current password.</p>
              </div>
            </div>
            
            <PasswordChangeForm />
          </Card>

        </div>

        {/* Right Column: Account Meta & Classes */}
        <div className="space-y-6">
          
          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-4">Account Details</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</p>
                  <p className="font-medium text-foreground break-all">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge variant={profile?.is_active ? "success" : "danger"}>
                      {profile?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined Date</p>
                  <p className="font-medium text-foreground">
                    <DateFormat date={profile?.created_at} format="long" />
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account Role</p>
                  <p className="capitalize font-medium text-foreground">{profile?.role}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-link" aria-hidden="true" />
                My Enrolled Classes
              </h2>
            </div>
            
            {activeEnrollments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">You are not enrolled in any active classes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.map((enr: { id: string; class_id: string; access_mode: string; class_groups?: { name?: string; is_active?: boolean } | { name?: string; is_active?: boolean }[] | null }) => {
                  const className = Array.isArray(enr.class_groups) 
                    ? enr.class_groups[0]?.name 
                    : enr.class_groups?.name;
                    
                  // Find active payment for this class
                  const activePayment = paymentPeriods?.find((p: { class_id: string; status: string; end_date?: string }) => 
                    p.class_id === enr.class_id && 
                    (p.status === "approved" || p.status === "pending")
                  );

                  return (
                    <div key={enr.id} className="rounded-lg border border-border bg-muted/50 p-4">
                      <h3 className="font-semibold text-foreground text-sm leading-tight mb-2">
                        {className || "Unknown Class"}
                      </h3>
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Access Mode:</span>
                          <span className="font-medium capitalize text-foreground">{enr.access_mode?.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Payment Status:</span>
                          {activePayment ? (
                            <Badge variant={activePayment.status === "approved" ? "success" : "warning"} className="text-xs px-2 py-0">
                              {activePayment.status}
                            </Badge>
                          ) : (
                            <span className="font-medium text-rose-600 dark:text-rose-400">No active access</span>
                          )}
                        </div>
                        {activePayment?.end_date && (
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span>Valid Until:</span>
                            <span className="font-medium text-foreground"><DateFormat date={activePayment.end_date} format="short" /></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2">
                  <Link href="/dashboard" className="w-full inline-flex justify-center text-sm font-semibold text-link hover:underline">
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
