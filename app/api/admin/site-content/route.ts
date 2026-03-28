import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// GET all site settings
export async function GET() {
  try {
    const { supabase } = await requireAdmin();

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

