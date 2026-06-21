import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantPaymentAccess } from "@/lib/admin/grant-manager";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const periodId = String(formData.get("period_id") ?? "");
    const status = String(formData.get("status") ?? "");

    if (!periodId || !["approved", "rejected", "expired"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid period ID or status" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("student_class_payment_periods")
      .update({ 
        status,
        reviewed_by: adminAuth.user!.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", periodId);


    if (error) throw error;

    // Trigger access granting if approved
    if (status === "approved") {
      await grantPaymentAccess(periodId, adminAuth.user!.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
