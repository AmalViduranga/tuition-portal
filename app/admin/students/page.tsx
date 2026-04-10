import AdminStudentsClient from "./AdminStudentsClient";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const adminSupabase = createAdminClient();
  
  const { data: students, error } = await adminSupabase
          .from("profiles")
          .select("id, full_name, email, phone, is_active, created_at, role")
          .eq("role", "student")
          .order("full_name", { ascending: true });
          
  if (error) {
     console.error(error);
     return <div>Error loading students.</div>;
  }

  return <AdminStudentsClient initialStudents={students || []} />;
}
