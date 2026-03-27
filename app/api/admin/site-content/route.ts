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

// POST update site settings
export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.formData();

    const updates: Array<{ key: string; value: string }> = [];

    // Process formData
    for (const [key, value] of body.entries()) {
      if (CONTENT_KEYS[key as keyof typeof CONTENT_KEYS]) {
        updates.push({ key, value: String(value) });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid content keys provided" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const promises = updates.map(({ key, value }) =>
      supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: now })
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
