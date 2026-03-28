import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") === "true";

    let query = supabase
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
    const { supabase } = await requireAdmin();
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

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, thumbnailFile, {
          upsert: false,
          contentType: thumbnailFile.type,
        });

      if (uploadError) {
        throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      thumbnailUrl = publicUrl;
    }

    const { error } = await supabase.from("recordings").insert({
      class_id: classId,
      title,
      description: description || null,
      youtube_video_id: youtubeVideoId,
      release_at: releaseAt,
      published,
      thumbnail_url: thumbnailUrl,
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
    const { supabase } = await requireAdmin();
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

    const updateData = {
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

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, thumbnailFile, {
          upsert: false,
          contentType: thumbnailFile.type,
        });

      if (uploadError) {
        throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      updateData.thumbnail_url = publicUrl;
    }

    const { error } = await supabase
      .from("recordings")
      .update(updateData)
      .eq("id", recordingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
