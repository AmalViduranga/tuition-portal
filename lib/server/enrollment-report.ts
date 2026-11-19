import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EnrollmentRecord } from "@/lib/reports/enrollment-earnings";

type Relation = { full_name?: string | null; name?: string | null };
type ReportRow = Omit<EnrollmentRecord, "student_name" | "class_name"> & {
  student: Relation | Relation[] | null;
  class: Relation | Relation[] | null;
};

export async function loadEnrollmentReport(db: SupabaseClient): Promise<EnrollmentRecord[]> {
  const records: EnrollmentRecord[] = [];
  const pageSize = 500;
  let total = 0;
  const seen = new Set<string>();
  do {
    const { data, error, count } = await db.from("student_class_enrollments")
      .select("id, amount_paid, access_mode, start_access_date, access_end_date, created_at, updated_at, revoked_at, student:profiles!student_id(full_name), class:class_groups(name)", { count: "exact" })
      .order("id", { ascending: true })
      .range(records.length, records.length + pageSize - 1);
    if (error) throw error;
    if (count === null) throw new Error("Enrollment count unavailable.");
    if (records.length && count !== total) throw new Error("Enrollments changed while the report was loading. Please reload.");
    total = count;
    if (!data?.length && records.length < total) throw new Error("Enrollment report is incomplete.");
    for (const row of (data ?? []) as ReportRow[]) {
      if (seen.has(row.id)) throw new Error("Enrollment report contains a repeated row. Please reload.");
      seen.add(row.id);
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      const classGroup = Array.isArray(row.class) ? row.class[0] : row.class;
      records.push({
        id: row.id, student_name: student?.full_name || "Unknown Student", class_name: classGroup?.name || "Unknown Class",
        amount_paid: row.amount_paid ?? 0, access_mode: row.access_mode,
        start_access_date: row.start_access_date, access_end_date: row.access_end_date,
        created_at: row.created_at, updated_at: row.updated_at ?? null, revoked_at: row.revoked_at ?? null,
      });
    }
  } while (records.length < total);
  return records;
}
