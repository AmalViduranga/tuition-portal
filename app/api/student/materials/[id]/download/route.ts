import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStudentAccessContext, isItemAccessible } from "@/lib/recordings/access-logic";
import { extractStoragePath } from "@/lib/utils/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action") === "download" ? "download" : "view";

    // 1. Fetch material metadata
    const { data: material } = await supabase
      .from("materials")
      .select(`
        id,
        class_id,
        release_at,
        published,
        file_url
      `)
      .eq("id", id)
      .single();

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // 2. Validate student access using existing business logic
    const accessContext = await getStudentAccessContext(supabase, user.id);
    const hasAccess = isItemAccessible(material as { id: string; class_id: string; release_at: string; published: boolean }, accessContext, "material");

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 3. Extract the file path safely from the public URL or database string
    let filePath: string;
    try {
      filePath = extractStoragePath(material.file_url, "materials");
    } catch {
      return NextResponse.json(
        { error: "Invalid material file path" },
        { status: 500 }
      );
    }

    // 4. Generate a signed URL securely on the server
    const adminSupabase = createAdminClient();
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from("materials")
      .createSignedUrl(filePath, 60, {
        download: action === "download"
      });

    if (signError || !signedData?.signedUrl) {
      throw signError || new Error("Failed to generate signed URL");
    }

    const { createAuditLog } = await import("@/lib/audit/audit-log");
    await createAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: "student",
      action: action === "download" ? "MATERIAL_DOWNLOADED" : "MATERIAL_VIEWED",
      targetType: "material",
      targetId: id,
      request,
    });

    // 5. Redirect the user securely
    return NextResponse.redirect(signedData.signedUrl);

  } catch (error) {
    console.error("Material Secure Download Error:", error);
    return NextResponse.json(
      { error: "Failed to securely access material" },
      { status: 500 }
    );
  }
}
