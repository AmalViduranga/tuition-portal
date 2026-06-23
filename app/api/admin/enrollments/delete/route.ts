import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const enrollmentId = String(formData.get("enrollment_id") ?? "");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("student_class_enrollments")
      .delete()
      .eq("id", enrollmentId);

    if (error) throw error;

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: "ENROLLMENT_REVOKED",
      targetType: "enrollment",
      targetId: enrollmentId,
      metadata: { action: "hard_delete" },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
