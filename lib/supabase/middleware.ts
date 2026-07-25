import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isPortal = pathname.startsWith("/portal");
  const isDashboard = pathname.startsWith("/dashboard");
  const isStudent = pathname.startsWith("/student");
  const isAdmin = pathname.startsWith("/admin");

  if (!user && (isPortal || isDashboard || isStudent || isAdmin)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isPortal || isDashboard || isStudent || isAdmin || isAuthPage)) {
    // Only resolve the user role on the server for protected or auth routes to save DB calls on public routes.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .single();

    const mustChangePassword = profile?.must_change_password === true;
    if (mustChangePassword && !isChangePasswordPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/change-password";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (!mustChangePassword && isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    // Admin routes are blocked unless role='admin'.
    if (isAdmin && profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
