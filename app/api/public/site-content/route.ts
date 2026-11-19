import { NextResponse } from "next/server";
import { loadPublicContent } from "@/lib/server/public-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await loadPublicContent();
  return NextResponse.json(result, {
    status: result.status === "ready" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
