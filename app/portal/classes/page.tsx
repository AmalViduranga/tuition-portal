import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, DateFormat, Badge } from "@/components/ui";

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Enrollments error:", error);
    throw new Error("Failed to load classes");
  }

  // Import our dedicated business logic code to ensure consistency
  const { getStudentAccessContext, isClassAccessActive } = await import("@/lib/recordings/access-logic");
  
  // Get full access context (enrollments, payment periods, unlocks) for evaluating the rules
  const accessContext = await getStudentAccessContext(supabase, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
        <p className="text-slate-600 mt-1">
          Classes you are currently enrolled in.
        </p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <Card className="text-center py-12 bg-slate-50 border-dashed">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-lg font-semibold text-slate-900">No Classes Yet</h2>
          <p className="text-slate-600 mt-1">You haven't been enrolled in any classes.</p>
          <p className="text-sm text-slate-500 mt-2">Please contact your administrator to get enrolled.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr: any) => {
            const classGroup = Array.isArray(enr.class_groups) ? enr.class_groups[0] : enr.class_groups;
            
            if (!classGroup) return null;

            // Use our centralized status truth
            const isAccessActive = isClassAccessActive(classGroup.id, accessContext);
            
            const calculatedEnd = enr.access_end_date || new Date(new Date(enr.start_access_date).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const isExpired = !isAccessActive && (new Date().toISOString().split('T')[0] > calculatedEnd);

            return (
              <Card key={enr.class_id} className="flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
                    {classGroup.name}
                  </h2>
                  {!classGroup.is_active && (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                </div>

                {classGroup.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 ext-ellipsis">
                    {classGroup.description}
                  </p>
                )}

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Access Mode</span>
                      <span className="font-medium text-slate-900 capitalize">
                        {enr.access_mode === "free_card" ? "Free Card" : enr.access_mode}
                      </span>
                    </div>

                    {enr.access_mode === "free_card" && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Free Card Until</span>
                        <span className="font-medium text-slate-900">
                          {enr.access_end_date ? <DateFormat date={enr.access_end_date} format="short" /> : "Indefinite"}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">Access Status</span>
                      {isAccessActive ? (
                        <span className="font-medium text-emerald-600">Active</span>
                      ) : (
                        <span className="font-medium text-amber-600">{isExpired ? "Expired" : "Pending Enrollment"}</span>
                      )
                      }
                    </div>
                  </div>

                  <Link
                    href={`/portal/class/${classGroup.id}`}
                    className="block w-full text-center rounded-lg bg-indigo-50 text-indigo-600 px-4 py-2 font-medium hover:bg-indigo-100 transition-colors"
                  >
                    View Class Details
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
