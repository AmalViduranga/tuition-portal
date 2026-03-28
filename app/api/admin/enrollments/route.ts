import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFreeCardGrantsForStudent } from "@/lib/admin/grant-manager";

export async function GET() {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("student_class_enrollments")
      .select(`
        id,
        student_id,
        class_id,
        start_access_date,
        access_end_date,
        access_mode,
        created_at,
        profiles (full_name),
        class_groups (name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((item) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name : (item.profiles as any)?.full_name,
      class_id: item.class_id,
      class_name: Array.isArray(item.class_groups) ? item.class_groups[0]?.name : (item.class_groups as any)?.name,
      start_access_date: item.start_access_date,
      access_end_date: item.access_end_date,
      access_mode: item.access_mode,
      student_class_enrollments: { created_at: item.created_at },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const startAccessDate = String(formData.get("start_access_date") ?? "");
    const accessMode = String(formData.get("access_mode") ?? "paid");
    const accessEndDate = formData.get("access_end_date") ? String(formData.get("access_end_date")) : null;

    if (!studentId || !classId || !startAccessDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("student_class_enrollments").upsert({
      student_id: studentId,
      class_id: classId,
      start_access_date: startAccessDate,
      access_end_date: accessEndDate,
      access_mode: accessMode,
    });

    if (error) throw error;
    
    if (accessMode === "free_card") {
      await syncFreeCardGrantsForStudent(studentId, classId, (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
