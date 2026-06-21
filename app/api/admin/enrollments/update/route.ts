import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAdmin();
    const adminSupabase = createAdminClient();
    const body = await request.json();

    const {
      enrollment_id,
      start_access_date,
      access_end_date,
      access_mode,
      amount_paid,
    } = body;

    if (!enrollment_id || !start_access_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error: updateError } = await adminSupabase
      .from("student_class_enrollments")
      .update({
        start_access_date,
        access_end_date: access_end_date || null,
        access_mode,
        amount_paid: amount_paid || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollment_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Enrollment Server Error:", error);
    const message = error?.message || "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
