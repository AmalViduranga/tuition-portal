"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  // The user should already be signed in via the auth callback
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to reset your password. Please request a new reset link." };
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password,
    // Clear must_change_password flag if set
    data: { must_change_password: false },
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Also clear the flag in profiles table
  await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  return { success: true };
}
