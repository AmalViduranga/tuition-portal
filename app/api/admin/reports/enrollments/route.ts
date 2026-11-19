import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadEnrollmentReport } from "@/lib/server/enrollment-report";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });
  try {
    return NextResponse.json(await loadEnrollmentReport(createAdminClient()), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Enrollment earnings could not be loaded completely. Check the enrollment reporting schema and try again." }, { status: 500 });
  }
}
