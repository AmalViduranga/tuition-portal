import AdminMaterialsClient from "./AdminMaterialsClient";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminMaterialsPage() {
  await requireAdmin();
  const adminSupabase = createAdminClient();
  
  const [materialsResponse, classesResponse] = await Promise.all([
     adminSupabase
        .from("materials")
        .select("id, title, class_groups (name), file_url, file_size, file_type, release_at, published, material_type")
        .order("release_at", { ascending: false }),
     adminSupabase
       .from("class_groups")
       .select("id, name")
       .eq("is_active", true)
       .order("name", { ascending: true })
  ]);
  
  if (materialsResponse.error) {
     console.error(materialsResponse.error);
     return <div>Error loading materials.</div>;
  }
  
  if (classesResponse.error) {
     console.error(classesResponse.error);
     return <div>Error loading classes.</div>;
  }

  return <AdminMaterialsClient initialMaterials={materialsResponse.data || []} initialClasses={classesResponse.data || []} />;
}
