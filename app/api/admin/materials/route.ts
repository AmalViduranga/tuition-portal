import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantNewReleaseAccess } from "@/lib/admin/grant-manager";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") === "true";

    let query = adminSupabase
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
    await requireAdmin();
    const adminSupabase = createAdminClient();
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

    const { error: uploadError } = await adminSupabase.storage
      .from("materials")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type || "application/pdf",
      });

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = adminSupabase.storage
      .from("materials")
      .getPublicUrl(filePath);

    const { data: inserted, error: insertError } = await adminSupabase.from("materials").insert({
      class_id: classId,
      title,
      material_type: materialType,
      release_at: releaseAt,
      published,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type || "application/pdf",
    }).select("id").single();

    if (insertError) throw insertError;

    if (published && inserted) {
      await grantNewReleaseAccess(inserted.id, classId, releaseAt, "material", (await requireAdmin()).user.id);
    }

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

    const updateData: {
      class_id: string;
      title: string;
      material_type: string;
      release_at: string;
      published: boolean;
      file_url?: string;
      file_size?: number;
      file_type?: string;
    } = {
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

      const { error: uploadError } = await adminSupabase.storage
        .from("materials")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "application/pdf",
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = adminSupabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      updateData.file_url = publicUrl;
      updateData.file_size = file.size;
      updateData.file_type = file.type || "application/pdf";
    }

    const { error } = await adminSupabase
      .from("materials")
      .update(updateData)
      .eq("id", materialId);

    if (error) throw error;

    if (published) {
      await grantNewReleaseAccess(materialId, classId, releaseAt, "material", (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const url = new URL(request.url);
    const materialId = url.searchParams.get("id");

    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    // 1. Get the material to find the file_url
    const { data: material, error: fetchError } = await adminSupabase
      .from("materials")
      .select("file_url")
      .eq("id", materialId)
      .single();

    if (fetchError || !material) {
      throw new Error("Material not found or already deleted");
    }

    // 2. Delete the file from storage if it exists
    if (material.file_url) {
      try {
        // Sample URL: https://xxx.supabase.co/storage/v1/object/public/materials/materials/filename.pdf
        // We need 'materials/filename.pdf'
        const urlParts = material.file_url.split('/public/materials/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: storageError } = await adminSupabase.storage
            .from("materials")
            .remove([filePath]);
          
          if (storageError) {
            console.error("Storage delete error:", storageError);
            // We continue even if storage delete fails to ensure DB is cleaned up
          }
        }
      } catch (storageErr) {
        console.error("Storage cleanup error:", storageErr);
      }
    }

    // 3. Delete from DB
    const { error: deleteError } = await adminSupabase
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
