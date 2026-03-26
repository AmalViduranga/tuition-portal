import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function PortalHomePage() {
  const { supabase, user } = await requireUser();

  const { data: enrollments } = await supabase
    .from("student_class_enrollments")
    .select("class_id, start_access_date, class_groups(id, name)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Your Classes</h2>
      <div className="mt-4 grid gap-3">
        {(enrollments ?? []).map((enrollment) => {
          const group = Array.isArray(enrollment.class_groups)
            ? enrollment.class_groups[0]
            : enrollment.class_groups;
          return (
            <article
              key={`${enrollment.class_id}-${enrollment.start_access_date}`}
              className="rounded-md border border-slate-200 p-3"
            >
              <p className="font-medium">{group?.name ?? "Class"}</p>
              <p className="text-sm text-slate-600">
                Start access: {enrollment.start_access_date ?? "Not set"}
              </p>
              <Link href={`/portal/class/${enrollment.class_id}`} className="mt-2 inline-block text-blue-600">
                Open class
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
