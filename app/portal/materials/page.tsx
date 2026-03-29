import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { loadStudentMaterials } from "@/lib/materials/student-materials";
import StudentMaterialsClient from "./StudentMaterialsClient";

export const metadata: Metadata = {
  title: "Class Materials | MathsLK",
  description: "Download A/L Mathematics past papers, theory notes, and revision documents securely.",
};

export default async function MaterialsPage() {
  const { supabase, user } = await requireUser();
  const initialData = await loadStudentMaterials(supabase, user.id, null);

  return <StudentMaterialsClient initialData={initialData} />;
}
