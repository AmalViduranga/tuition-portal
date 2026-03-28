import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

/**
 * Fetch a single recording for playback. Access is enforced by RLS on `recordings`;
 * if the student is not eligible, no row is returned.
 * View counting and access logs happen via POST /api/student/recordings/[id]/view only.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await params;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile?.is_active) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const { data: recording, error: recError } = await supabase
      .from("recordings")
      .select(
        `
        id,
        title,
        description,
        youtube_video_id,
        release_at,
        published,
        class_id,
        class_groups (id, name, is_active),
        views_count
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (recError) throw recError;

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found or you do not have access" },
        { status: 404 },
      );
    }

    const { data: manualUnlock } = await supabase
      .from("recording_manual_unlocks")
      .select("id")
      .eq("student_id", user.id)
      .eq("recording_id", id)
      .maybeSingle();

    return NextResponse.json({
      recording: {
        ...recording,
        has_access: true,
        is_manually_unlocked: !!manualUnlock,
      },
    });
  } catch (error) {
    console.error("Error fetching recording:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
