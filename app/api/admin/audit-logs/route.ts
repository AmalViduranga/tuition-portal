import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const action = url.searchParams.get("action");
    const targetType = url.searchParams.get("target_type");
    const actorEmail = url.searchParams.get("actor_email");
    const actorRole = url.searchParams.get("actor_role");
    
    const offset = (page - 1) * limit;

    const adminSupabase = createAdminClient();
    
    let query = adminSupabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (action) query = query.eq("action", action);
    if (targetType) query = query.eq("target_type", targetType);
    if (actorEmail) query = query.ilike("actor_email", `%${actorEmail}%`);
    if (actorRole) query = query.eq("actor_role", actorRole);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
