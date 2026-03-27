import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const recordingId = String(formData.get("recording_id") ?? "");

    if (!studentId || !recordingId) {
      return NextResponse.json(
        { error: "Student ID and Recording ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("recording_manual_unlocks").insert({
      student_id: studentId,
      recording_id: recordingId,
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
