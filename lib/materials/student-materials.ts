import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type StudentMaterialRow = {
  id: string;
  title: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  release_at: string;
  published: boolean;
  material_type: string;
  class_id: string;
  class_groups: { id: string; name: string } | null;
  views_count: number | null;
};

export type AccessibleClass = { id: string; name: string };

export type StudentMaterialsPayload = {
  materials: Array<
    StudentMaterialRow & {
      is_manually_unlocked: boolean;
    }
  >;
  accessible_classes: AccessibleClass[];
};

export async function loadStudentMaterials(
  supabase: SupabaseClient,
  userId: string,
  classIdFilter?: string | null,
): Promise<StudentMaterialsPayload> {
  const today = new Date().toISOString().split("T")[0];

  const { data: enrollments, error: enrollError } = await supabase
    .from("student_class_enrollments")
    .select(
      `
      class_id,
      start_access_date,
      class_groups (
        id,
        name,
        is_active
      )
    `,
    )
    .eq("student_id", userId);

  if (enrollError) throw enrollError;

  const accessible_classes: AccessibleClass[] = [];

  enrollments?.forEach((enrollment) => {
    const classGroup = Array.isArray(enrollment.class_groups)
      ? enrollment.class_groups[0]
      : enrollment.class_groups;

    if (classGroup?.is_active && enrollment.start_access_date <= today) {
      accessible_classes.push({
        id: classGroup.id,
        name: classGroup.name,
      });
    }
  });

  if (accessible_classes.length === 0) {
    return { materials: [], accessible_classes: [] };
  }

  if (classIdFilter && !accessible_classes.some((c) => c.id === classIdFilter)) {
    return { materials: [], accessible_classes };
  }

  // Fetch all published materials for enrolled classes
  // We apply the business rules explicitly in Node via isItemAccessible
  const adminDb = createAdminClient();
  let query = adminDb
    .from("materials")
    .select(
      `
      id,
      title,
      file_url,
      file_size,
      file_type,
      release_at,
      published,
      material_type,
      class_id,
      class_groups (id, name),
      views_count
    `,
    )
    .eq("published", true)
    .lte("release_at", today)
    .in("class_id", accessible_classes.map((c) => c.id))
    .order("release_at", { ascending: false });

  if (classIdFilter) {
    query = query.eq("class_id", classIdFilter);
  }

  const { data: rawMaterials, error: matError } = await query;

  if (matError) throw matError;

  const { isItemAccessible, getStudentAccessContext } = await import("../recordings/access-logic");
  
  const accessContext = await getStudentAccessContext(supabase, userId);

  const accessibleMaterials = (rawMaterials || []).filter((mat) => 
    isItemAccessible(mat as any, accessContext, "material")
  );

  const list = accessibleMaterials.map((mat) => ({
    ...mat,
    class_groups: Array.isArray(mat.class_groups) ? mat.class_groups[0] : mat.class_groups,
    is_manually_unlocked: accessContext.materialGrants.has(mat.id),
  }));

  return {
    materials: list as any,
    accessible_classes,
  };
}
