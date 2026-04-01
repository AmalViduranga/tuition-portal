import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFreeCardGrantsForStudent } from "@/lib/admin/grant-manager";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    let query = adminSupabase
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

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET Enrollments Error:", error);
      throw error;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id || `${item.student_id}-${item.class_id}-${item.created_at}`,
      student_id: item.student_id,
      student_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name : (item.profiles?.full_name || "Unknown"),
      class_id: item.class_id,
      class_name: Array.isArray(item.class_groups) ? item.class_groups[0]?.name : (item.class_groups?.name || "Unknown"),
      start_access_date: item.start_access_date,
      access_end_date: item.access_end_date,
      access_mode: item.access_mode,
      created_at: item.created_at,
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

    // Calculate access_end_date if not provided (always should be start + 45 days)
    let finalEndDate = accessEndDate;
    if (!finalEndDate) {
      const startDate = new Date(startAccessDate);
      const endDate = new Date(startDate);
      // Admin said 45 days / 1.5 months
      endDate.setDate(startDate.getDate() + 45);
      finalEndDate = endDate.toISOString().split('T')[0];
    }

    // Use insert instead of upsert to keep enrollment history
    const { error } = await adminSupabase.from("student_class_enrollments").insert({
      student_id: studentId,
      class_id: classId,
      start_access_date: startAccessDate,
      access_end_date: finalEndDate,
      access_mode: accessMode,
    });

    if (error) {
      console.error("POST Enrollment Error:", error);
      throw error;
    }
    
    // syncFreeCardGrantsForStudent logic is still relevant if we want manual unlock fallbacks
    if (accessMode === "free_card") {
      const { user } = await requireAdmin();
      await syncFreeCardGrantsForStudent(studentId, classId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
