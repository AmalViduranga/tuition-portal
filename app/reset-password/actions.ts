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

  if (!token) {
    return { error: "Missing reset token" };
  }

  const supabase = await createClient();

  // Verify the token and update password
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (error) {
    return { error: error.message };
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);
  }

  return { success: true };
}
