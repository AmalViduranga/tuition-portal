import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const body = await request.json();

    const { class_id, recordings, default_published } = body;

    if (!class_id || !Array.isArray(recordings) || recordings.length === 0) {
      return NextResponse.json(
        { error: "Class ID and recordings array are required" },
        { status: 400 }
      );
    }

    // Ensure we don't insert duplicate video IDs for the same class (or globally if preferred)
    // We'll just insert, if uniqueness constraint fails, we skip or error.
    // For now, let's bulk insert.
    
    const recordsToInsert = recordings.map((rec: any) => ({
      class_id,
      title: rec.title || "Untitled Video",
      youtube_video_id: rec.youtube_video_id,
      release_at: rec.release_at || new Date().toISOString(),
      published: default_published,
    }));

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
