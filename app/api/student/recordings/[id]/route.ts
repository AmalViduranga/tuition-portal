import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await params;

    // Get student's profile to check is_active
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile?.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 }
      );
    }

    // Check if recording exists and get details
    const { data: recording, error: recError } = await supabase
      .from("recordings")
      .select(`
        id,
        title,
        description,
        youtube_video_id,
        release_at,
        published,
        class_id,
        class_groups (id, name, is_active),
        views_count
      `)
      .eq("id", id)
      .single();

    if (recError) throw recError;

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // Check if recording is published and released
    const today = new Date().toISOString().split("T")[0];
    if (!recording.published) {
      return NextResponse.json(
        { error: "Recording is not published" },
        { status: 403 }
      );
    }

    if (recording.release_at > today) {
      return NextResponse.json(
        { error: "Recording not yet released" },
        { status: 403 }
      );
    }

    // Check if student has access to the class
    const classGroup = Array.isArray(recording.class_groups)
      ? recording.class_groups[0]
      : recording.class_groups;

    if (!classGroup?.is_active) {
      return NextResponse.json(
        { error: "Class is not active" },
        { status: 403 }
      );

  // Check enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("student_class_enrollments")
      .select("id, start_access_date")
      .eq("student_id", user.id)
      .eq("class_id", classGroup.id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this class" },
        { status: 403 }
      );
    }

    // Check if access period has started
    if (enrollment.start_access_date > today) {
      return NextResponse.json(
        { error: "Access not yet started" },
        { status: 403 }
      );
    }

    // Check for manual unlock
    const { data: manualUnlock } = await supabase
      .from("recording_manual_unlocks")
      .select("id")
      .eq("student_id", user.id)
      .eq("recording_id", id)
      .single();

    // If no manual unlock, check payment periods (if you have payment system)
    // For now, enrollment grants access

    // Increment view count
    await supabase.rpc("increment_recording_views", { recording_id: id });

    // Log the access
    await supabase.from("student_content_access_logs").insert({
      student_id: user.id,
      recording_id: id,
    });

    // Return recording details with access status
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
      { status: 500 }
    );
  }
}
