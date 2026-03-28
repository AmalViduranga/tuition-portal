import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantNewReleaseAccess } from "@/lib/admin/grant-manager";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const materialId = String(formData.get("material_id") ?? "");

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const { data: material, error: fetchError } = await adminSupabase
      .from("materials")
      .select("published, class_id, release_at")
      .eq("id", materialId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await adminSupabase
      .from("materials")
      .update({ published: !material?.published })
      .eq("id", materialId);

    if (error) throw error;

    if (!material?.published) {
      // It was draft, now published
      await grantNewReleaseAccess(materialId, material.class_id, material.release_at, "material", (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
