import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
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

    if (error) {
      if (error.code === '42P01') { // Relation does not exist
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Plans Fetch Error:", error);
    return NextResponse.json([]); // Return empty list rather than 500 for safety
  }
}
