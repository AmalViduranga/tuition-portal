import { NextRequest, NextResponse } from "next/server";
import { createStudentAccount } from "@/lib/admin/create-student-account";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const url = new URL(request.url);
    const simple = url.searchParams.get("simple") === "true";

    const { data: students, error } = simple
      ? await adminSupabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "student")
          .order("full_name", { ascending: true })
      : await adminSupabase
          .from("profiles")
          .select("id, full_name, email, phone, is_active, created_at, role")
          .eq("role", "student")
          .order("full_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(students || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const startAccessDate = String(formData.get("start_access_date") ?? "");
    const mustChangePassword = formData.get("must_change_password") === "on";

    const classIds = formData
      .getAll("class_ids")
      .map((id) => String(id).trim())
      .filter(Boolean);

    const result = await createStudentAccount({
      email,
      password,
      fullName,
      phone,
      classIds,
      startAccessDate,
      mustChangePassword,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.studentId,
      temporaryPassword: result.temporaryPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
