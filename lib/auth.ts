import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "student";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getCurrentUserRole(userId: string): Promise<AppRole | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .single();

  return (profile?.role as AppRole | undefined) ?? null;
}

export async function isActiveStudent(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .single();

  return profile?.is_active ?? false;
}

export async function requireUser() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if student account is active and single session lock
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active, role, current_session_lock, current_session_user_agent_hash")
    .eq("id", user.id)
    .single();

  if (profile?.role === "student") {
    if (!profile?.is_active) {
      redirect("/inactive-account");
    }

    // --- SINGLE DEVICE LOCK CHECK ---
    const cookieStore = await cookies();
    const lockId = cookieStore.get("student_session_lock")?.value;

    if (profile.current_session_lock && profile.current_session_lock !== lockId) {
      // Current session was invalidated by another login
      await supabase.auth.signOut();
      redirect("/login?error=Your%20account%20was%20logged%20in%20from%20another%20device");
    }

    if (profile.current_session_user_agent_hash) {
      const headersList = await headers();
      const userAgent = headersList.get("user-agent") || "unknown";
      const uaHash = crypto.createHash("sha256").update(userAgent).digest("hex");
      
      if (profile.current_session_user_agent_hash !== uaHash) {
        // User-Agent changed unexpectedly, invalidate session
        await supabase.auth.signOut();
        redirect("/login?error=Session%20invalidated.%20Please%20log%20in%20again.");
      }
    }
    // --------------------------------
  }

  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  // Server-side role gate for sensitive admin pages and data access.
  const role = await getCurrentUserRole(user.id);

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user };
}

export async function requireAdminApi() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const role = await getCurrentUserRole(user.id);
  if (role !== "admin") {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, supabase, user };
}
