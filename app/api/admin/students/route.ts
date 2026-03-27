import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const simple = url.searchParams.get("simple") === "true";

    let query = supabase
      .from("profiles")
      .select("id, full_name, email, phone, is_active, created_at, role")
      .eq("role", "student");

    if (simple) {
      query = supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "student");
    }

    const { data: students, error } = await query.order("full_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(students || []);
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

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const startAccessDate = String(formData.get("start_access_date") ?? "");
    const mustChangePassword = formData.get("must_change_password") === "on";

    // Get multiple class IDs (can be multiple values)
    const classIds = formData.getAll("class_ids");
    const validClassIds = classIds.filter((id) => id && String(id).trim() !== "");

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "A student with this email already exists" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already registered in the system" },
          { status: 400 }
        );
      }
      throw authError;
    }

    // Create profile record with must_change_password
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      email: email,
      phone: phone || null,
      role: "student",
      is_active: true,
      must_change_password: mustChangePassword,
    });

    // Create enrollments for each selected class
    if (validClassIds.length > 0 && startAccessDate) {
      const enrollmentPromises = validClassIds.map((classId) =>
        supabase.from("student_class_enrollments").upsert({
          student_id: authData.user.id,
          class_id: String(classId),
          start_access_date: startAccessDate,
        })
      );
      await Promise.all(enrollmentPromises);
    } else if (validClassIds.length > 0 && !startAccessDate) {
      // If classes selected but no start date, use today
      const enrollmentPromises = validClassIds.map((classId) =>
        supabase.from("student_class_enrollments").upsert({
          student_id: authData.user.id,
          class_id: String(classId),
          start_access_date: new Date().toISOString().split("T")[0],
        })
      );
      await Promise.all(enrollmentPromises);
    }

    return NextResponse.json({ success: true, id: authData.user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
