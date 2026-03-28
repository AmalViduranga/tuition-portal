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
      .from("recordings")
      .select(`
        id,
        title,
        description,
        youtube_video_id,
        release_at,
        published,
        thumbnail_url,
        views_count,
        class_groups (id, name),
        created_at
      `)
      .order("release_at", { ascending: false });

    if (limit) {
      query = query.limit(200);
    }

    const { data: recordings, error } = await query;

    if (error) throw error;

    return NextResponse.json(recordings || []);
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
    const description = String(formData.get("description") ?? "");
    const youtubeVideoId = String(formData.get("youtube_video_id") ?? "");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!classId || !title || !youtubeVideoId || !releaseAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let thumbnailUrl = null;

    if (thumbnailFile && thumbnailFile.size > 0) {
      const fileExt = thumbnailFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `recordings/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from("thumbnails")
        .upload(filePath, thumbnailFile, {
          upsert: false,
          contentType: thumbnailFile.type,
        });

      if (uploadError) {
        throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = adminSupabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      thumbnailUrl = publicUrl;
    }

    const { data: inserted, error } = await adminSupabase.from("recordings").insert({
      class_id: classId,
      title,
      description: description || null,
      youtube_video_id: youtubeVideoId,
      release_at: releaseAt,
      published,
      thumbnail_url: thumbnailUrl,
    }).select("id").single();

    if (error) throw error;

    if (published && inserted) {
      await grantNewReleaseAccess(inserted.id, classId, releaseAt, "recording", (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Recordings POST Error:", error);
    return NextResponse.json(
      { error: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const recordingId = String(formData.get("recording_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const youtubeVideoId = String(formData.get("youtube_video_id") ?? "");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!recordingId || !classId || !title || !youtubeVideoId || !releaseAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData: {
      class_id: string;
      title: string;
      description: string | null;
      youtube_video_id: string;
      release_at: string;
      published: boolean;
      thumbnail_url?: string;
    } = {
      class_id: classId,
      title,
      description: description || null,
      youtube_video_id: youtubeVideoId,
      release_at: releaseAt,
      published,
    };

    if (thumbnailFile && thumbnailFile.size > 0) {
      const fileExt = thumbnailFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `recordings/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from("thumbnails")
        .upload(filePath, thumbnailFile, {
          upsert: false,
          contentType: thumbnailFile.type,
        });

      if (uploadError) {
        throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = adminSupabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      updateData.thumbnail_url = publicUrl;
    }

    const { error } = await adminSupabase
      .from("recordings")
      .update(updateData)
      .eq("id", recordingId);

    if (error) throw error;

    if (published) {
      await grantNewReleaseAccess(recordingId, classId, releaseAt, "recording", (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
