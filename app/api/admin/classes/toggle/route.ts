import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const supabase = adminAuth.supabase!;
    const formData = await request.formData();

    const classId = String(formData.get("class_id") ?? "");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const { data: classData, error: fetchError } = await supabase
      .from("class_groups")
      .select("is_active")
      .eq("id", classId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("class_groups")
      .update({ is_active: !classData?.is_active })
      .eq("id", classId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
