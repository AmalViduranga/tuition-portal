"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  
  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!full_name) {
    return { error: "Full name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
