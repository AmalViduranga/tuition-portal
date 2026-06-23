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

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Determine the student's role before deleting - don't allow deleting other admins
    const { data: profile, error: fetchErr } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", studentId)
      .single();

    if (fetchErr) throw fetchErr;
    if (profile?.role === "admin") {
      return NextResponse.json(
        { error: "Deleting admin accounts is not allowed via this route." },
        { status: 403 }
      );
    }

    // Permanent delete: remove from auth.users (cascades to profiles and linked data)
    const { error } = await adminSupabase.auth.admin.deleteUser(studentId);

    if (error) throw error;

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: "STUDENT_PERMANENT_DELETE_ATTEMPT",
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
