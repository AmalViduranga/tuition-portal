import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantNewReleaseAccess } from "@/lib/admin/grant-manager";
import { getErrorMessage } from "@/lib/utils/error";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const classId = String(formData.get("class_id") ?? "");
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const youtubeVideoId = String(formData.get("youtube_video_id") ?? "");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";

    if (!classId || !title || !youtubeVideoId || !releaseAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const { data: inserted, error } = await adminSupabase.from("recordings").insert({
      class_id: classId,
      title,
      description: description || null,
      youtube_video_id: youtubeVideoId,
      release_at: releaseAt,
      published,
    }).select("id").single();

    if (error) throw error;

    if (published && inserted) {
      await grantNewReleaseAccess(inserted.id, classId, releaseAt, "recording", adminAuth.user!.id);
    }

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: "RECORDING_CREATED",
      targetType: "recording",
      targetId: inserted?.id,
      targetLabel: title,
      metadata: { class_id: classId, release_at: releaseAt, published },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Recordings POST Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const recordingId = String(formData.get("recording_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const youtubeVideoId = String(formData.get("youtube_video_id") ?? "");
    const releaseAt = String(formData.get("release_at") ?? "");
    const published = formData.get("published") === "on";

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
    } = {
      class_id: classId,
      title,
      description: description || null,
      youtube_video_id: youtubeVideoId,
      release_at: releaseAt,
      published,
    };

    const { error } = await adminSupabase
      .from("recordings")
      .update(updateData)
      .eq("id", recordingId);

    if (error) throw error;

    if (published) {
      await grantNewReleaseAccess(recordingId, classId, releaseAt, "recording", adminAuth.user!.id);
    }

    await createAuditLog({
      actorId: adminAuth.user?.id,
      actorEmail: adminAuth.user?.email,
      actorRole: "admin",
      action: "RECORDING_UPDATED",
      targetType: "recording",
      targetId: recordingId,
      targetLabel: title,
      metadata: { class_id: classId, release_at: releaseAt, published },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
