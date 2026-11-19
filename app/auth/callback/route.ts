import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" may only ever be a path on this site.
  const next = safeNextPath(searchParams.get("next"), "/portal");
  const redirectTo = new URL(next, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await supabase.auth.getUser();
    }
  }

  // With or without a valid code the visitor continues to the same on-site page.
  return NextResponse.redirect(redirectTo);
}
