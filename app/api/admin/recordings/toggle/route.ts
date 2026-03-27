import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const recordingId = String(formData.get("recording_id") ?? "");

    if (!recordingId) {
      return NextResponse.json(
        { error: "Recording ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("published")
      .eq("id", recordingId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("recordings")
      .update({ published: !recording?.published })
      .eq("id", recordingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
