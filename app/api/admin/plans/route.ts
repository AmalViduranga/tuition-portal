import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("payment_plans")
      .select(`
        *,
        payment_plan_classes (
          class_id,
          class_groups (name)
        )
      `)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
