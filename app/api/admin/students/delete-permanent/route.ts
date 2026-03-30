import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
