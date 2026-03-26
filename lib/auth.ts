import { redirect } from "next/navigation";
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
    .select("role")
    .eq("id", userId)
    .single();

  return (profile?.role as AppRole | undefined) ?? null;
}

export async function requireUser() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
