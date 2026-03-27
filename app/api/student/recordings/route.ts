import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id");

    // Get student's profile to check is_active
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // Check if student account is active
    if (!profile?.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 }
      );
    }

    // Get student's enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from("student_class_enrollments")
      .select(`
        class_id,
        start_access_date,
        class_groups (
          id,
          name,
          is_active
        )
      `)
      .eq("student_id", user.id);

    if (enrollError) throw enrollError;

    // Build list of accessible class IDs
    const accessibleClasses: Array<{ id: string; name: string }> = [];
    const today = new Date().toISOString().split("T")[0];

    enrollments?.forEach((enrollment) => {
      const classGroup = Array.isArray(enrollment.class_groups)
        ? enrollment.class_groups[0]
        : enrollment.class_groups;

      if (classGroup?.is_active && enrollment.start_access_date <= today) {
        accessibleClasses.push({
          id: classGroup.id,
          name: classGroup.name,
        });
      }
    });

    // If classId filter provided, check if it's in accessible classes
    if (classId && !accessibleClasses.find((c) => c.id === classId)) {
      return NextResponse.json(
        { error: "Access denied for this class" },
        { status: 403 }
      );
    }

    // Get recordings for accessible classes
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
        class_id,
        class_groups (id, name),
        views_count
      `)
      .in("class_id", accessibleClasses.map((c) => c.id))
      .order("release_at", { ascending: false });

    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data: recordings, error: recError } = await query;

    if (recError) throw recError;

    // Filter by:
    // 1. published = true
    // 2. release_at is today or earlier
    const accessibleRecordings = (recordings || []).filter((rec) => {
      if (!rec.published) return false;
      if (rec.release_at > today) return false;
      return true;
    });

    // Get manual unlocks for this student
    const { data: manualUnlocks, error: unlockError } = await supabase
      .from("recording_manual_unlocks")
      .select("recording_id")
      .eq("student_id", user.id);

    if (unlockError) throw unlockError;

    const unlockedRecordingIds = new Set(
      (manualUnlocks || []).map((unlock) => unlock.recording_id)
    );

    // Mark which recordings are unlocked manually
    const result = accessibleRecordings.map((rec) => ({
      ...rec,
      is_manually_unlocked: unlockedRecordingIds.has(rec.id),
      can_access: true, // Already filtered by eligibility
    }));

    return NextResponse.json({
      recordings: result,
      accessible_classes: accessibleClasses,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
