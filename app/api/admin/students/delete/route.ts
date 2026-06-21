import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Soft delete: set is_active to false
    const { error } = await adminSupabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", studentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
