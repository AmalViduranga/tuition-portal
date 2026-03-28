import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    let query = adminSupabase
      .from("recording_manual_unlocks")
      .select(`
        id,
        student_id,
        recording_id,
        granted_by,
        grant_type,
        created_at,
        revoked_at,
        revoke_reason,
        profiles (full_name),
        recordings (title)
      `)
      .is('revoked_at', null)
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map((item) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name : (item.profiles as any)?.full_name,
      recording_id: item.recording_id,
      recording_title: Array.isArray(item.recordings) ? item.recordings[0]?.title : (item.recordings as any)?.title,
      created_at: item.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const recordingId = String(formData.get("recording_id") ?? "");

    if (!studentId || !recordingId) {
      return NextResponse.json(
        { error: "Student ID and Recording ID are required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("recording_manual_unlocks").insert({
      student_id: studentId,
      recording_id: recordingId,
      granted_by: user.id,
      grant_type: 'manual'
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

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const unlockId = String(formData.get("unlock_id") ?? "");

    if (!unlockId) {
      return NextResponse.json(
        { error: "Unlock ID is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("recording_manual_unlocks")
      .update({ revoked_at: new Date().toISOString(), revoke_reason: 'Manual revoke' })
      .eq("id", unlockId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
