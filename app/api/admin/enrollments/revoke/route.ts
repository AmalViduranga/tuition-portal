import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/utils/error";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const user = adminAuth.user!;
    const adminSupabase = createAdminClient();
    const body = await request.json();

    const { enrollment_id, reason, revoke_payments } = body;

    if (!enrollment_id) {
      return NextResponse.json(
        { error: "Missing enrollment_id" },
        { status: 400 }
      );
    }

    // First fetch the enrollment to get the student and class info
    const { data: enrollment, error: fetchError } = await adminSupabase
      .from("student_class_enrollments")
      .select("student_id, class_id")
      .eq("id", enrollment_id)
      .single();

    if (fetchError || !enrollment) {
      throw new Error("Enrollment not found");
    }

    // Revoke the enrollment
    const { error: revokeError } = await adminSupabase
      .from("student_class_enrollments")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revoke_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollment_id);

    if (revokeError) {
      throw revokeError;
    }

    // If requested, also revoke any active payment periods for this student+class
    if (revoke_payments) {
      await adminSupabase
        .from("student_class_payment_periods")
        .update({
          status: "rejected",
          admin_note: `Revoked with enrollment: ${reason || ''}`
        })
        .eq("student_id", enrollment.student_id)
        .eq("class_id", enrollment.class_id)
        .in("status", ["approved", "pending"]);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Revoke Enrollment Server Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
