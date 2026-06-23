import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/utils/error";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function PATCH(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
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

    if (!["paid", "free_card", "manual"].includes(access_mode)) {
      return NextResponse.json(
        { error: "Invalid access mode. Must be paid, free_card, or manual" },
        { status: 400 }
      );
    }

    if (isNaN(new Date(start_access_date).getTime())) {
      return NextResponse.json(
        { error: "Invalid start_access_date" },
        { status: 400 }
      );
    }

    if (access_end_date && isNaN(new Date(access_end_date).getTime())) {
      return NextResponse.json(
        { error: "Invalid access_end_date" },
        { status: 400 }
      );
    }

    if (access_end_date && new Date(access_end_date) < new Date(start_access_date)) {
      return NextResponse.json(
        { error: "Access end date must be after start date" },
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

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: "ENROLLMENT_UPDATED",
      targetType: "enrollment",
      targetId: enrollment_id,
      metadata: { new_start_access_date: start_access_date, new_access_end_date: access_end_date, new_access_mode: access_mode },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Update Enrollment Server Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
