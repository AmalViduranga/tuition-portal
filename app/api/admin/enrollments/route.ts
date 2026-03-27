import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("student_class_enrollments")
      .select(`
        id,
        student_id,
        class_id,
        start_access_date,
        created_at,
        profiles (full_name),
        class_groups (name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((item) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: item.profiles?.full_name,
      class_id: item.class_id,
      class_name: item.class_groups?.name,
      start_access_date: item.start_access_date,
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
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const startAccessDate = String(formData.get("start_access_date") ?? "");

    if (!studentId || !classId || !startAccessDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("student_class_enrollments").upsert({
      student_id: studentId,
      class_id: classId,
      start_access_date: startAccessDate,
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
