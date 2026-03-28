import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { loadStudentMaterials } from "@/lib/materials/student-materials";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile?.is_active) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const data = await loadStudentMaterials(supabase, user.id, classId || undefined);

    return NextResponse.json({
      materials: data.materials,
      accessible_classes: data.accessible_classes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
