import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const materialId = String(formData.get("material_id") ?? "");

    if (!studentId || !materialId) {
      return NextResponse.json(
        { error: "Student ID and Material ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("material_manual_unlocks").insert({
      student_id: studentId,
      material_id: materialId,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
