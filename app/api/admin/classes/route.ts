import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active") === "true";

    let query = adminSupabase.from("class_groups").select(
      activeOnly ? "id, name" : "id, name, description, is_active, created_at"
    );

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: classes, error } = await query.order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(classes || []);
  } catch (error) {
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

    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "");

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("class_groups").insert({
      name,
      description: description || null,
      is_active: true,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const classId = String(formData.get("class_id") ?? "");
    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "");

    if (!classId || !name) {
      return NextResponse.json(
        { error: "Class ID and name are required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("class_groups")
      .update({ name, description: description || null })
      .eq("id", classId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
