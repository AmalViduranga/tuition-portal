import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStudentAccessContext, isRecordingAccessible } from "@/lib/recordings/access-logic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await params;

    // Verify student has access using the existing eligibility rules
    const { data: recording, error: recError } = await supabase
      .from("recordings")
      .select(`
        id,
        class_id,
        class_groups (id, is_active),
        release_at,
        published
      `)
      .eq("id", id)
      .maybeSingle();

    if (recError) throw recError;

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    const classGroup = Array.isArray(recording.class_groups)
      ? recording.class_groups[0]
      : recording.class_groups;

    if (classGroup && (classGroup as { is_active?: boolean }).is_active === false) {
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

    const accessContext = await getStudentAccessContext(supabase, user.id);
    const hasAccess = isRecordingAccessible(
      {
        id: recording.id,
        class_id: recording.class_id,
        release_at: recording.release_at,
        published: recording.published,
      },
      accessContext,
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
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

    const { createAuditLog } = await import("@/lib/audit/audit-log");
    await createAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: "student",
      action: "RECORDING_VIEWED",
      targetType: "recording",
      targetId: id,
      request,
    });

    return NextResponse.json({ success: true, views_incremented: true });
  } catch (error) {
    console.error("Error logging view:", error);
    return NextResponse.json(
      { error: "Could not record view right now." },
      { status: 500 }
    );
  }
}
