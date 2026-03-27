import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();

    const periodId = String(formData.get("period_id") ?? "");
    const status = String(formData.get("status") ?? "");

    if (!periodId || !["approved", "rejected", "expired"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid period ID or status" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("student_class_payment_periods")
      .update({ status })
      .eq("id", periodId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
