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

    const studentId = String(formData.get("student_id") ?? "");
    const isActive = formData.get("is_active") === "true";

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("profiles")
      .update({ is_active: !isActive })
      .eq("id", studentId);

    if (error) throw error;

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: isActive ? "STUDENT_DEACTIVATED" : "STUDENT_ACTIVATED",
      targetType: "profile",
      targetId: studentId,
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
