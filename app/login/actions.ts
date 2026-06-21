"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const user = data.user;

  if (!user) {
    redirect("/login?error=Unable%20to%20load%20user%20session");
  }

  // Server-side role lookup prevents relying only on client-side route checks.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, must_change_password")
    .eq("id", user.id)
    .single();

  // Handle case where profile might not exist (e.g., deleted or trigger failed)
  if (!profile) {
    const adminSupabase = createAdminClient();
    await adminSupabase.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || "Admin",
      email: user.email,
      role: "admin",
      is_active: true,
      must_change_password: false
    });
    return redirect("/admin");
  }

  // Normalize role for comparison (handle case sensitivity, whitespace)
  const userRole = profile?.role?.trim().toLowerCase();

  // Auto-bootstrap logic removed for security.
  // Admins must be manually assigned via database query.
  if (userRole !== "admin") {
    // We retain the fallback check to ensure the user at least gets a profile
    // if the trigger failed, which we already handled above.
  }

  // Admins go to admin dashboard
  if (userRole === "admin") {
    return redirect("/admin");
  }

  // Check if student must change password on first login
  if (profile?.must_change_password) {
    return redirect("/change-password?required=true");
  }

  // Prevent non-admins from accessing admin routes
  if (next.startsWith("/admin")) {
    return redirect("/dashboard");
  }

  // --- SINGLE DEVICE RESTRICTION FOR STUDENTS ---
  if (userRole === "student") {
    const lockId = crypto.randomUUID();
    
    // Hash User-Agent
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    const uaHash = crypto.createHash("sha256").update(userAgent).digest("hex");

    const adminSupabase = createAdminClient();
    await adminSupabase
      .from("profiles")
      .update({ 
        current_session_lock: lockId,
        current_session_user_agent_hash: uaHash 
      })
      .eq("id", user.id);

    const cookieStore = await cookies();
    cookieStore.set("student_session_lock", lockId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  }
  // ----------------------------------------------

  // Students go to their intended destination or dashboard
  return redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Clear session lock on logout for students
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role === "student") {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from("profiles")
        .update({ current_session_lock: null })
        .eq("id", user.id);
      
      const cookieStore = await cookies();
      cookieStore.delete("student_session_lock");
    }
  }

  await supabase.auth.signOut();
  redirect("/");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return redirect("/change-password?error=Password%20must%20be%20at%20least%208%20characters");
  }

  if (password !== confirmPassword) {
    return redirect("/change-password?error=Passwords%20do%20not%20match");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return redirect(`/change-password?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
  return redirect("/dashboard");
}
