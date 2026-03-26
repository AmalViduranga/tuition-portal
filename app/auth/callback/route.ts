import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("next") ?? "/portal";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
