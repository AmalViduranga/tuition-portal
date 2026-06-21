import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";

// GET all site settings
export async function GET() {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const supabase = adminAuth.supabase!;

    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(settings || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

