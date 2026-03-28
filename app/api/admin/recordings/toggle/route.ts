import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantNewReleaseAccess } from "@/lib/admin/grant-manager";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const recordingId = String(formData.get("recording_id") ?? "");

    if (!recordingId) {
      return NextResponse.json(
        { error: "Recording ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const { data: recording, error: fetchError } = await adminSupabase
      .from("recordings")
      .select("published, class_id, release_at")
      .eq("id", recordingId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await adminSupabase
      .from("recordings")
      .update({ published: !recording?.published })
      .eq("id", recordingId);

    if (error) throw error;

    if (!recording?.published) {
      // It was draft, now published
      await grantNewReleaseAccess(recordingId, recording.class_id, recording.release_at, "recording", (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
