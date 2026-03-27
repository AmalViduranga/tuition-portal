import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") === "true";

    let query = supabase
      .from("materials")
      .select(`
        id,
        title,
        file_url,
        file_size,
        file_type,
        release_at,
        published,
        material_type,
        class_groups (id, name),
        created_at
      `)
      .order("release_at", { ascending: false });

    if (limit) {
      query = query.limit(200);
    }

    const { data: materials, error } = await query;

    if (error) throw error;

    return NextResponse.json(materials || []);
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

    const classId = String(formData.get("class_id") ?? "");
    const title = String(formData.get("title") ?? "");
    const materialType = String(formData.get("material_type") ?? "other");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";
    const file = formData.get("file") as File | null;

    if (!classId || !title || !releaseAt || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type || "application/pdf",
      });

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("materials")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("materials").insert({
      class_id: classId,
      title,
      material_type: materialType,
      release_at: releaseAt,
      published,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type || "application/pdf",
    });

    if (insertError) throw insertError;

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
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const materialId = String(formData.get("material_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const title = String(formData.get("title") ?? "");
    const materialType = String(formData.get("material_type") ?? "other");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";
    const file = formData.get("file") as File | null;

    if (!materialId || !classId || !title || !releaseAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData = {
      class_id: classId,
      title,
      material_type: materialType,
      release_at: releaseAt,
      published,
    };

    if (file && file.size > 0) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 50MB limit" },
          { status: 400 }
        );
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "application/pdf",
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      updateData.file_url = publicUrl;
      updateData.file_size = file.size;
      updateData.file_type = file.type || "application/pdf";
    }

    const { error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", materialId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
