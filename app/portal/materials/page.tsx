import { requireUser } from "@/lib/auth";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import StudentMaterialsClient from "./StudentMaterialsClient";

export default async function MaterialsPage() {
  const { supabase, user } = await requireUser();
  const initialData = await loadStudentMaterials(supabase, user.id, null);

  return <StudentMaterialsClient initialData={initialData} />;
}
