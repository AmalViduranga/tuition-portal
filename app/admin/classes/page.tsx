import AdminClassesClient from "./AdminClassesClient";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminClassesPage() {
  await requireAdmin();
  const adminSupabase = createAdminClient();
  
  const { data: classes, error } = await adminSupabase
    .from("class_groups")
    .select("id, name, description, is_active, created_at")
    .order("name", { ascending: true });
    
  if (error) {
     console.error(error);
     return <div>Error loading classes.</div>;
  }

  return <AdminClassesClient initialClasses={classes || []} />;
}
