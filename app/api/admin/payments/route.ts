import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("student_class_payment_periods")
      .select(`
        id,
        student_id,
        class_id,
        start_date,
        end_date,
        status,
        created_at,
        profiles (full_name),
        class_groups (name)
      `)
      .order("start_date", { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name : item.profiles?.full_name,
      class_id: item.class_id,
      class_name: Array.isArray(item.class_groups) ? item.class_groups[0]?.name : item.class_groups?.name,
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status,
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
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const startDate = String(formData.get("start_date") ?? "");
    const endDate = String(formData.get("end_date") ?? "");

    if (!studentId || !classId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Set status to pending by default to require explicit approval
    const { error } = await supabase.from("student_class_payment_periods").insert({
      student_id: studentId,
      class_id: classId,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
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
