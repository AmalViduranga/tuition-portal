import type { SupabaseClient } from "@supabase/supabase-js";

export type StudentOption = { id: string; full_name: string | null; email: string | null };
export const STUDENT_SEARCH_LIMIT = 50;

export function literalSearchPattern(input: string) {
  return input.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchStudents(db: SupabaseClient, input: string) {
  const query = input.trim();
  if (query.length > 200) throw new Error("Search must be 200 characters or fewer.");
  const baseQuery = () => db.from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(STUDENT_SEARCH_LIMIT + 1);

  // Separate encoded filter parameters avoid interpolating user input into PostgREST .or() syntax.
  const results = query
    ? await Promise.all([
        baseQuery().regexIMatch("full_name", literalSearchPattern(query)),
        baseQuery().regexIMatch("email", literalSearchPattern(query)),
      ])
    : [await baseQuery()];
  for (const result of results) if (result.error) throw result.error;
  const students = [...new Map(results.flatMap(result => result.data ?? []).map(student => [student.id, student as StudentOption])).values()]
    .sort((a, b) => (a.full_name ?? "\uffff").localeCompare(b.full_name ?? "\uffff") || a.id.localeCompare(b.id));
  return { students: students.slice(0, STUDENT_SEARCH_LIMIT), hasMore: students.length > STUDENT_SEARCH_LIMIT };
}
