import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const materialId = String(formData.get("material_id") ?? "");

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const { data: material, error: fetchError } = await supabase
      .from("materials")
      .select("published")
      .eq("id", materialId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("materials")
      .update({ published: !material?.published })
      .eq("id", materialId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
