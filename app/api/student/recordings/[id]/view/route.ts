import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await params;

    // Verify student has access first (same logic as GET)
    const { data: recording } = await supabase
      .from("recordings")
      .select(`
        id,
        class_id,
        class_groups (id, is_active),
        release_at,
        published
      `)
      .eq("id", id)
      .single();

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const classGroup = Array.isArray(recording.class_groups)
      ? recording.class_groups[0]
      : recording.class_groups;

    if (!classGroup?.is_active) {
      return NextResponse.json(
        { error: "Class not active" },
        { status: 403 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    if (recording.release_at > today || !recording.published) {
      return NextResponse.json(
        { error: "Recording not available" },
        { status: 403 }
      );
    }

    const { data: enrollment } = await supabase
      .from("student_class_enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("class_id", classGroup.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled" },
        { status: 403 }
      );
    }

    // Log the view
    await supabase.from("student_content_access_logs").insert({
      student_id: user.id,
      recording_id: id,
    });

    // Increment view count using RPC or direct update
    await supabase.rpc("increment_recording_views", { recording_id: id });

    return NextResponse.json({ success: true, views_incremented: true });
  } catch (error) {
    console.error("Error logging view:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
