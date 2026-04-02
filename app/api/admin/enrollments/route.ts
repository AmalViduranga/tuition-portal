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
        amount_paid,
        created_at,
        profiles (full_name),
        class_groups (name)
      `)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data: rawData, error: fetchError } = await query;
    if (fetchError) {
      console.error("GET Enrollments Fetch Error:", fetchError);
      // Return empty list if table or column doesn't exist for safety
      if (fetchError.code === '42P01' || fetchError.code === '42703') {
        return NextResponse.json([]);
      }
      throw fetchError;
    }

    const formatted = (rawData || []).map((item: any) => {
      // Handle Supabase's varying response structures (object vs array results for joins)
      const extractName = (source: any, field: string) => {
          if (!source) return null;
          if (Array.isArray(source)) return source[0]?.[field] || null;
          return source[field] || null;
      };

      return {
        id: item.id || `${item.student_id}-${item.class_id}-${item.created_at}`,
        student_id: item.student_id,
        student_name: extractName(item.profiles, 'full_name') || "Unknown Student",
        class_id: item.class_id,
        class_name: extractName(item.class_groups, 'name') || "Unknown Class",
        start_access_date: item.start_access_date,
        access_end_date: item.access_end_date,
        access_mode: item.access_mode,
        amount_paid: item.amount_paid || 0,
        created_at: item.created_at,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET Enrollments Server Error:", error);
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
    const amountPaid = Number(formData.get("amount_paid") ?? 0);
    const providedEndDate = formData.get("access_end_date") ? String(formData.get("access_end_date")) : null;

    if (!studentId || !classId || !startAccessDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Default 40-day expiry calculation
    // Start date is inclusive, so end should be start + 40 days
    const startDate = new Date(startAccessDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 40);
    const calculatedEndDate = endDate.toISOString().split('T')[0];

    // Final result (provided date or default)
    const finalEndDate = providedEndDate || calculatedEndDate;

    // Use insert instead of upsert to keep enrollment history
    const { error } = await adminSupabase.from("student_class_enrollments").insert({
      student_id: studentId,
      class_id: classId,
      start_access_date: startAccessDate,
      access_end_date: finalEndDate,
      access_mode: accessMode,
      amount_paid: amountPaid,
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
