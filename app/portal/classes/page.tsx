import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, DateFormat, Badge } from "@/components/ui";
import { uniqueBy } from "@/lib/utils/arrays";

export default async function StudentClassesPage() {
  const { supabase, user } = await requireUser();

  const { data: enrollments, error } = await supabase
    .from("student_class_enrollments")
    .select(`
      class_id, 
      start_access_date, 
      access_mode,
      access_end_date,
      class_groups (id, name, description, is_active)
    `)
    .eq("student_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Enrollments error:", error);
    throw new Error("Failed to load classes");
  }

  // Import our dedicated business logic code to ensure consistency
  const { getStudentAccessContext, isClassAccessActive } = await import("@/lib/recordings/access-logic");
  
  // Get full access context (enrollments, payment periods, unlocks) for evaluating the rules
  const accessContext = await getStudentAccessContext(supabase, user.id);

  const activeEnrollments = (enrollments || []).filter((enr) => {
    const classGroup = Array.isArray(enr.class_groups) ? enr.class_groups[0] : enr.class_groups;
    return classGroup?.is_active === true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Classes</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Classes and batch groups you are currently enrolled in.
        </p>
      </div>

      {activeEnrollments.length === 0 ? (
        <Card className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">No Classes Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">You haven&apos;t been enrolled in any active classes.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Please contact your administrator to activate your enrollment.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueBy(activeEnrollments, (enr) => enr.class_id).map((enr: { class_id: string; start_access_date: string; access_mode: string; access_end_date?: string; class_groups: { id: string; name: string; description?: string; is_active: boolean } | { id: string; name: string; description?: string; is_active: boolean }[] }) => {
            const classGroup = Array.isArray(enr.class_groups) ? enr.class_groups[0] : enr.class_groups;
            
            if (!classGroup || !classGroup.is_active) return null;

            // Use our centralized status truth
            const isAccessActive = isClassAccessActive(classGroup.id, accessContext);
            
            const calculatedEnd = enr.access_end_date || new Date(new Date(enr.start_access_date).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const isExpired = !isAccessActive && (new Date().toISOString().split('T')[0] > calculatedEnd);

            return (
              <Card key={enr.class_id} className="flex flex-col h-full hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                    {classGroup.name}
                  </h2>
                  {isAccessActive ? (
                    <Badge variant="success" className="font-semibold text-xs shrink-0">Active</Badge>
                  ) : (
                    <Badge variant={isExpired ? "danger" : "warning"} className="font-semibold text-xs shrink-0">
                      {isExpired ? "Expired" : "Pending"}
                    </Badge>
                  )}
                </div>

                {classGroup.description ? (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                    {classGroup.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-4">
                    A/L Mathematics class group
                  </p>
                )}

                <div className="mt-auto space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Access Mode</span>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {enr.access_mode === "free_card" ? "Free Card" : enr.access_mode}
                      </span>
                    </div>

                    {enr.access_mode === "free_card" && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Free Card Until</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {enr.access_end_date ? <DateFormat date={enr.access_end_date} format="short" /> : "Indefinite"}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Access Started</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {enr.start_access_date}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/portal/recordings?class_id=${encodeURIComponent(classGroup.id)}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 px-4 py-2.5 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span>Watch Class Recordings</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

