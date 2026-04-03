import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getYouTubeMetadata } from "@/lib/recordings/youtube";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const body = await request.json();

    const { class_id, recordings, default_published, consistent_date } = body;

    if (!class_id || !Array.isArray(recordings) || recordings.length === 0) {
      return NextResponse.json(
        { error: "Class ID and recordings array are required" },
        { status: 400 }
      );
    }

    // Map through recording IDs and fetch metadata
    const recordsToInsert = await Promise.all(
      recordings.map(async (rec: any) => {
        let title = rec.title || "Untitled Video";
        let thumbnail_url = rec.thumbnail_url || null;

        // Try to fetch metadata if title is generic
        if (rec.youtube_video_id && (!rec.title || rec.title.startsWith("Video "))) {
          const metadata = await getYouTubeMetadata(rec.youtube_video_id);
          if (metadata) {
            title = metadata.title || title;
            thumbnail_url = metadata.thumbnail_url || thumbnail_url;
          }
        }

        return {
          class_id,
          title,
          youtube_video_id: rec.youtube_video_id,
          thumbnail_url,
          release_at: consistent_date || rec.release_at || new Date().toISOString(),
          published: default_published,
        };
      })
    );

    const { data: insertedRecords, error } = await adminSupabase
      .from("recordings")
      .insert(recordsToInsert)
      .select();

    if (error) throw error;

    // Grant access for all newly inserted records if they are published
    if (insertedRecords && insertedRecords.length > 0) {
      const { grantNewReleaseAccess } = await import("@/lib/admin/grant-manager");
      
      for (const rec of insertedRecords) {
        if (rec.published) {
          await grantNewReleaseAccess(
            rec.id,
            rec.class_id,
            rec.release_at,
            "recording"
          );
        }
      }
    }

    return NextResponse.json({ success: true, count: insertedRecords?.length || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
