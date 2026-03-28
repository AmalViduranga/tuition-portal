"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Unable%20to%20load%20user%20session");
  }

  // Server-side role lookup prevents relying only on client-side route checks.
  let { data: profile } = await supabase
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
  let userRole = profile?.role?.trim().toLowerCase();

  // Auto-bootstrap an admin if none exists or if using primary contact email 
  if (userRole !== "admin") {
    const adminClient = createAdminClient();
    const { count: adminCount } = await adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminCount === 0 || user.email === "amalvidu20@gmail.com") {
      await adminClient
        .from("profiles")
        .update({ role: "admin", is_active: true, must_change_password: false })
        .eq("id", user.id);
      
      userRole = "admin";
      profile.must_change_password = false;
    }
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

  // Students go to their intended destination or dashboard
  return redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logout() {
  const supabase = await createClient();
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
